import { useEffect, useState } from 'react'
import { useSocket } from '../../hooks/useSocket.js'
import useStore from '../../store/useStore.js'
import { useVehicles } from '../../hooks/useVehicles.js'

export default function GPSPanel() {
  useVehicles()
  const { connected } = useSocket()
  const vehicles = useStore(s => s.vehicles)
  const [lastUpdate, setLastUpdate] = useState({})

  useEffect(() => {
    const unsubscribe = useStore.subscribe(
      s => s.vehicles,
      (newVehicles) => {
        const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLastUpdate(prev => {
          const updates = {}
          newVehicles.forEach(v => {
            if (v.lat && v.lng) updates[v.id] = now
          })
          return { ...prev, ...updates }
        })
      }
    )
    return unsubscribe
  }, [])

  const STATUS_MAP = {
    available: { label: 'Disponible',  color: '#00C853' },
    on_mission:{ label: 'En mission',  color: '#FF6D00' },
    unavailable:{ label: 'Indisponible', color: '#94A3B8' },
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>GPS Temps Réel</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>Localisation flotte via Socket.io</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${connected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {connected ? '● Connecté' : '⏳ Connexion...'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F0F4FF' }}>
        {!connected && (
          <div className="bg-white rounded-xl border p-4 text-center text-sm" style={{ color: '#64748B' }}>
            <div className="text-3xl mb-2">📡</div>
            <p className="font-medium">Connexion Socket.io en cours...</p>
            <p className="text-xs mt-1">Les positions GPS s'afficheront automatiquement dès la connexion.</p>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: '#94A3B8' }}>
          Flotte ({vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''})
        </p>

        {vehicles.map(v => {
          const s = STATUS_MAP[v.status] || STATUS_MAP.unavailable
          return (
            <div key={v.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                {v.status === 'on_mission' && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-60" style={{ background: s.color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{v.name}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>{v.crew || 'Équipage non défini'}</div>
                {v.lat && v.lng ? (
                  <div className="text-xs mt-0.5 font-mono" style={{ color: '#94A3B8' }}>
                    {v.lat.toFixed(5)}°N · {v.lng.toFixed(5)}°E
                    {lastUpdate[v.id] && <span className="ml-2">↻ {lastUpdate[v.id]}</span>}
                  </div>
                ) : (
                  <div className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>Position inconnue</div>
                )}
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0" style={{ background: s.color + '22', color: s.color }}>
                {s.label}
              </span>
            </div>
          )
        })}

        {vehicles.length === 0 && (
          <div className="bg-white rounded-xl border p-6 text-center text-sm" style={{ color: '#94A3B8' }}>
            Aucun véhicule — ajoutez des véhicules dans la flotte
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs" style={{ color: '#1565C0' }}>
          <p className="font-semibold mb-1">📱 Application ambulancier</p>
          <p>Les ambulanciers utilisent <strong>ambulancier.html</strong> sur leur téléphone pour envoyer leur position GPS en temps réel.</p>
        </div>
      </div>
    </div>
  )
}
