import { useState, useEffect, useRef } from 'react'
import client from '../../api/client.js'
import useStore from '../../store/useStore.js'
import { getSocket } from '../../hooks/useSocket.js'
import DispatchIA from '../../components/dispatch/DispatchIA.jsx'
import { useMissions } from '../../hooks/useMissions.js'

const today = new Date().toISOString().split('T')[0]

function timeStr(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function ElisaPanel() {
  const { assign } = useMissions({ date: today })
  const missions = useStore(s => s.missions)
  const [samuConfig, setSamuConfig] = useState(null)
  const [liveAlerts, setLiveAlerts] = useState([])
  const [dispatchMission, setDispatchMission] = useState(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  const samuMissions = missions.filter(m => m.numero?.startsWith('SAMU-'))

  useEffect(() => {
    client.get('/api/samu/config').then(r => setSamuConfig(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const handler = ({ title, message }) => {
      if (title?.includes('SAMU')) {
        setLiveAlerts(prev => [...prev, {
          id: Date.now(), title, message,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }])
      }
    }
    socket.on('notification', handler)
    return () => socket.off('notification', handler)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [liveAlerts.length])

  const isConnected = samuConfig?.enabled === true

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Interface Élisa — SAMU 38</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>Réception des alertes SAMU en temps réel</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {loading ? '⏳' : isConnected ? '● Connecté' : '● Déconnecté'}
        </span>
      </div>

      {!isConnected && !loading && (
        <div className="mx-4 mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs" style={{ color: '#92400E' }}>
          ⚠ Intégration SAMU désactivée — activez-la dans <strong>Paramètres → SAMU</strong> et renseignez le token.
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0" style={{ background: '#F0F4FF' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>
            Missions reçues aujourd'hui ({samuMissions.length})
          </p>

          {samuMissions.length === 0 && liveAlerts.length === 0 && (
            <div className="bg-white rounded-xl border p-8 text-center">
              <div className="text-3xl mb-2">📻</div>
              <p className="text-sm font-medium" style={{ color: '#64748B' }}>En attente d'alertes SAMU</p>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                Les missions envoyées par le SAMU via webhook apparaîtront ici automatiquement.
              </p>
            </div>
          )}

          {samuMissions.map(m => (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-lg w-full rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #F4433644' }}>
                <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#FFF5F5' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: '#F44336' }}>🚨 SAMU 38</span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>
                      {m.time || timeStr(m.createdAt)} · {m.numero}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.status === 'waiting' ? 'bg-orange-100 text-orange-700' :
                    m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {m.status === 'waiting' ? 'En attente' : m.status === 'in_progress' ? 'En cours' : 'Terminée'}
                  </span>
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="font-semibold text-sm" style={{ color: '#1F2937' }}>{m.patient}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>📍 {m.from} → {m.to}</p>
                  {m.notes && <p className="text-xs mt-1 italic" style={{ color: '#94A3B8' }}>{m.notes}</p>}
                  {m.status === 'waiting' && !m.vehicleId && (
                    <button onClick={() => setDispatchMission(m)}
                      className="mt-2 text-xs px-3 py-1 rounded-lg text-white font-medium"
                      style={{ background: '#1565C0' }}>
                      🤖 Dispatcher avec l'IA
                    </button>
                  )}
                  {m.vehicle && (
                    <p className="mt-1 text-xs font-medium" style={{ color: '#00C853' }}>
                      ✅ Assigné à {m.vehicle.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {liveAlerts.map(a => (
            <div key={a.id} className="flex justify-start">
              <div className="max-w-sm rounded-xl px-3 py-2 shadow-sm" style={{ background: '#FFF5F5', border: '1px solid #FECACA' }}>
                <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: '#F44336' }}>
                  🚨 SAMU 38 · {a.time}
                  <span className="text-white text-xs px-1 rounded ml-1" style={{ background: '#F44336', fontSize: 9 }}>LIVE</span>
                </div>
                <div className="text-sm font-medium" style={{ color: '#1F2937' }}>{a.title}</div>
                {a.message && <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{a.message}</div>}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="border-t bg-white px-4 py-3 flex items-center gap-3">
          <p className="flex-1 text-xs" style={{ color: '#94A3B8' }}>
            {isConnected
              ? 'Endpoint actif — les alertes SAMU arrivent en temps réel'
              : 'Configurer dans Paramètres → SAMU pour activer la réception'}
          </p>
          <span className="text-xs px-2 py-1 rounded-lg font-medium border" style={{ color: '#64748B', borderColor: '#E2E8F0' }}>
            {samuMissions.filter(m => m.status === 'waiting').length} en attente de dispatch
          </span>
        </div>
      </div>

      {dispatchMission && (
        <DispatchIA
          open={!!dispatchMission}
          onClose={() => setDispatchMission(null)}
          mission={dispatchMission}
          onAssign={(vehicleId) => assign(dispatchMission.id, vehicleId)}
        />
      )}
    </div>
  )
}
