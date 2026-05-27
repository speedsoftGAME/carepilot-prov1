import { useState, useEffect } from 'react'
import client from '../../api/client.js'
import useStore from '../../store/useStore.js'

export default function HeuresPanel() {
  const addToast = useStore(s => s.addToast)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  const load = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/pointage/heures', { params: { month } }).then(r => r.data)
      setData(res)
    } catch {
      addToast('Impossible de charger les heures', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month])

  const exportCsv = async () => {
    try {
      const res = await client.get('/api/planning/export-csv', { params: { month }, responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url; a.download = `heures-${month}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      addToast('Erreur export CSV', 'error')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Heures & Pointages</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>Récapitulatif mensuel calculé depuis la pointeuse</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs" style={{ color: '#1F2937' }} />
          <button onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: '#1565C0' }}>
            ⬇ Exporter CSV
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F0F4FF' }}>
        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-sm" style={{ color: '#94A3B8' }}>
            Aucun pointage enregistré pour {month}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: '#F0F4FF' }}>
                    {['Salarié', 'Total heures', 'Jours travaillés', 'Détail'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#64748B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-blue-50 transition">
                      <td className="px-4 py-3 font-semibold" style={{ color: '#1F2937' }}>
                        {row.employee.name}
                      </td>
                      <td className="px-4 py-3 font-bold text-base" style={{ color: row.totalHeures > 151 ? '#FF6D00' : '#1565C0' }}>
                        {row.totalHeures}h
                        {row.totalHeures > 151 && <span className="text-xs ml-1">⚠ HS</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#1F2937' }}>
                        {row.details.length}j
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#64748B' }}>
                        {row.details.slice(0, 3).map(d => (
                          <span key={d.date} className="inline-block mr-2">
                            {d.date} ({d.heures}h)
                          </span>
                        ))}
                        {row.details.length > 3 && <span>+{row.details.length - 3} jour(s)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.some(r => r.totalHeures > 151) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs" style={{ color: '#92400E' }}>
                ⚠ Certains salariés dépassent les 151h réglementaires — vérifier les heures supplémentaires.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
