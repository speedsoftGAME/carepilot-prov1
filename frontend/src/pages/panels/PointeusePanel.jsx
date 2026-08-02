import { useState, useEffect } from 'react'
import { employeesApi } from '../../api/employees.js'
import client from '../../api/client.js'
import useStore from '../../store/useStore.js'

export default function PointeusePanel() {
  const addToast = useStore(s => s.addToast)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])

  const loadRecent = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const data = await client.get('/api/pointage', { params: { date: today } }).then(r => r.data)
      setRecent(data.slice(0, 10))
    } catch {}
  }

  useEffect(() => { loadRecent() }, [])

  const press = (v) => setPin(p => p.length < 6 ? p + v : p)

  const pointer = async (type) => {
    if (pin.length < 4) { addToast('Entrez votre PIN (4 à 6 chiffres)', 'error'); return }
    setLoading(true)
    try {
      const emp = await employeesApi.pinAuth(pin)
      await client.post('/api/pointage', { employeeId: emp.id, type })
      addToast(`${type === 'entree' ? '✅ Entrée' : '🔴 Sortie'} enregistrée — ${emp.name}`, 'success')
      setPin('')
      loadRecent()
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur'
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Pointeuse Salariés</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>Saisie PIN pour entrée / sortie</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">● Actif</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#F0F4FF' }}>
        <div className="bg-white rounded-xl border shadow-sm p-5 max-w-xs mx-auto">
          <p className="text-center text-xs mb-1" style={{ color: '#94A3B8' }}>{dateStr}</p>
          <p className="text-center text-2xl font-bold mb-4" style={{ color: '#0A1628' }}>{timeStr}</p>
          <p className="text-center text-sm font-medium mb-3" style={{ color: '#64748B' }}>Entrez votre code PIN</p>
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg transition-all"
                style={{ borderColor: '#1565C0', background: i < pin.length ? '#1565C0' : 'transparent' }}>
                {i < pin.length && <span style={{ color: '#fff' }}>●</span>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
              <button key={i}
                onClick={() => k === '⌫' ? setPin(p => p.slice(0,-1)) : k !== '' && press(String(k))}
                disabled={loading}
                className="h-10 rounded-lg font-semibold text-sm border transition hover:bg-gray-50 active:scale-95"
                style={{ color: '#1F2937', visibility: k === '' ? 'hidden' : 'visible' }}>
                {k}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => pointer('sortie')} disabled={loading || pin.length < 4}
              className="py-2.5 rounded-lg text-sm font-semibold text-white transition active:scale-95"
              style={{ background: pin.length >= 4 ? '#F44336' : '#CBD5E1' }}>
              {loading ? '...' : '🔴 Sortie'}
            </button>
            <button onClick={() => pointer('entree')} disabled={loading || pin.length < 4}
              className="py-2.5 rounded-lg text-sm font-semibold text-white transition active:scale-95"
              style={{ background: pin.length >= 4 ? '#00C853' : '#CBD5E1' }}>
              {loading ? '...' : '✅ Entrée'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b text-xs font-semibold flex items-center justify-between" style={{ color: '#64748B' }}>
            <span>Activité du jour</span>
            <button onClick={loadRecent} className="text-xs" style={{ color: '#1565C0' }}>↻ Actualiser</button>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-4 text-xs text-center" style={{ color: '#94A3B8' }}>Aucun pointage aujourd'hui</div>
          ) : recent.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.type === 'entree' ? '#00C853' : '#F44336' }} />
              <div className="flex-1 text-sm font-medium" style={{ color: '#1F2937' }}>{r.employee?.name}</div>
              <span className="text-xs font-semibold" style={{ color: r.type === 'entree' ? '#00C853' : '#F44336' }}>
                {r.type === 'entree' ? 'Entrée' : 'Sortie'}
              </span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
