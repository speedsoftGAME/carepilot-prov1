import { useState, useEffect, useCallback } from 'react'
import { planningApi } from '../../api/planning.js'
import { employeesApi } from '../../api/employees.js'
import useStore from '../../store/useStore.js'

const TYPE_STYLE = {
  work:      { label: 'Travail',    bg: '#E3F2FD', color: '#1565C0' },
  morning:   { label: 'Matin',      bg: '#E8F5E9', color: '#2E7D32' },
  afternoon: { label: 'Après-midi', bg: '#FFF3E0', color: '#E65100' },
  night:     { label: 'Nuit',       bg: '#EDE7F6', color: '#512DA8' },
  rest:      { label: 'Repos',      bg: '#F1F5F9', color: '#94A3B8' },
  vacation:  { label: 'Congé',      bg: '#FCE4EC', color: '#C62828' },
  sick:      { label: 'Maladie',    bg: '#FFF9C4', color: '#F57F17' },
}

function getISOWeek(date) {
  const d = new Date(date)
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2,'0')}`
}

function weekDays(weekStr) {
  const [year, week] = weekStr.split('-W').map(Number)
  const jan4 = new Date(year, 0, 4)
  const startOfW1 = new Date(jan4)
  startOfW1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const monday = new Date(startOfW1)
  monday.setDate(startOfW1.getDate() + (week - 1) * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function PlanningPanel() {
  const addToast = useStore(s => s.addToast)
  const [week, setWeek] = useState(getISOWeek(new Date()))
  const [cells, setCells] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  const days = weekDays(week)
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [planData, empData] = await Promise.all([
        planningApi.getWeek(week),
        employeesApi.list(),
      ])
      setCells(planData.cells || [])
      setEmployees(empData)
    } catch {
      addToast('Erreur chargement planning', 'error')
    } finally {
      setLoading(false)
    }
  }, [week])

  useEffect(() => { load() }, [load])

  const getCell = (employeeId, date) => cells.find(c => c.employeeId === employeeId && c.date === date)

  const handleCellClick = async (employeeId, date, currentType) => {
    const types = Object.keys(TYPE_STYLE)
    const currentIdx = types.indexOf(currentType || '')
    const nextType = types[(currentIdx + 1) % types.length]
    setSaving(`${employeeId}-${date}`)
    try {
      const cell = await planningApi.upsertCell({ employeeId, date, type: nextType, hours: nextType === 'rest' || nextType === 'vacation' || nextType === 'sick' ? 0 : 8 })
      setCells(prev => {
        const filtered = prev.filter(c => !(c.employeeId === employeeId && c.date === date))
        return [...filtered, cell]
      })
    } catch {
      addToast('Erreur mise à jour', 'error')
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (employeeId, date) => {
    setSaving(`${employeeId}-${date}`)
    try {
      await planningApi.deleteCell(employeeId, date)
      setCells(prev => prev.filter(c => !(c.employeeId === employeeId && c.date === date)))
    } catch {
      addToast('Erreur suppression', 'error')
    } finally {
      setSaving(null)
    }
  }

  const exportCsv = async () => {
    try {
      const month = week.split('-W')[0] + '-' + String(Math.ceil(parseInt(week.split('-W')[1]) / 4)).padStart(2, '0')
      const blob = await planningApi.exportCsv(week.split('-W')[0] + '-' + String(days[0].slice(5, 7)))
      const url = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }))
      const a = document.createElement('a'); a.href = url; a.download = `planning-${week}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      addToast('Erreur export', 'error')
    }
  }

  const prevWeek = () => {
    const d = new Date(days[0])
    d.setDate(d.getDate() - 7)
    setWeek(getISOWeek(d))
  }
  const nextWeek = () => {
    const d = new Date(days[0])
    d.setDate(d.getDate() + 7)
    setWeek(getISOWeek(d))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Planning — {week}</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>{employees.length} salarié(s) · Cliquez une cellule pour changer le type</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={prevWeek} className="px-2 py-1.5 rounded-lg border text-sm hover:bg-gray-50">‹</button>
          <button onClick={nextWeek} className="px-2 py-1.5 rounded-lg border text-sm hover:bg-gray-50">›</button>
          <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: '#1565C0' }}>
            ⬇ CSV
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4" style={{ background: '#F0F4FF' }}>
        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-sm" style={{ color: '#94A3B8' }}>
            Aucun salarié — créez des salariés dans les paramètres
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-auto">
            <table className="w-full text-xs min-w-max">
              <thead>
                <tr style={{ background: '#0A1628' }}>
                  <th className="px-4 py-3 text-left font-semibold text-white w-36">Salarié</th>
                  {days.map((date, i) => (
                    <th key={date} className="px-3 py-3 text-center font-semibold text-white min-w-28">
                      {dayLabels[i]} {date.slice(8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-t hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-semibold" style={{ color: '#1F2937' }}>
                      <div>{emp.name}</div>
                      {emp.role && <div className="text-xs font-normal" style={{ color: '#94A3B8' }}>{emp.role}</div>}
                    </td>
                    {days.map(date => {
                      const cell = getCell(emp.id, date)
                      const key = `${emp.id}-${date}`
                      const isSaving = saving === key
                      const s = cell ? TYPE_STYLE[cell.type] || TYPE_STYLE.work : null
                      return (
                        <td key={date} className="px-2 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleCellClick(emp.id, date, cell?.type)}
                              disabled={isSaving}
                              className="inline-block rounded-lg px-2 py-1 font-medium text-xs transition hover:opacity-80 active:scale-95 w-full"
                              style={{
                                background: s ? s.bg : '#F8FAFC',
                                color: s ? s.color : '#CBD5E1',
                                border: `1px dashed ${s ? s.color + '44' : '#E2E8F0'}`,
                              }}>
                              {isSaving ? '...' : s ? s.label : '+'}
                            </button>
                            {cell && (
                              <button onClick={() => handleDelete(emp.id, date)}
                                className="text-xs opacity-40 hover:opacity-100 transition" style={{ color: '#F44336' }}>
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(TYPE_STYLE).map(([, s]) => (
            <span key={s.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs" style={{ background: s.bg, color: s.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
