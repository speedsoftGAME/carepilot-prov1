import { useState, useEffect } from 'react'
import { statsApi } from '../../api/stats.js'
import useStore from '../../store/useStore.js'
import client from '../../api/client.js'

export default function CAPanel() {
  const addToast = useStore(s => s.addToast)
  const token = useStore(s => s.token)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    setLoading(true)
    statsApi.overview(month)
      .then(setStats)
      .catch(() => addToast('Impossible de charger les statistiques', 'error'))
      .finally(() => setLoading(false))
  }, [month])

  const exportSage = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.open(`${apiUrl}/api/billing/export-sage?month=${month}`, '_blank')
  }
  const exportEbp = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.open(`${apiUrl}/api/billing/export-ebp?month=${month}`, '_blank')
  }

  const maxCA = stats ? Math.max(...stats.byDay.map(d => d.ca), 1) : 1

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Chiffre d'Affaires</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>Synthèse financière en temps réel</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs" style={{ color: '#1F2937' }} />
          <button onClick={exportSage}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: '#1565C0' }}>
            Sage
          </button>
          <button onClick={exportEbp}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: '#1565C0' }}>
            EBP
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#F0F4FF' }}>
        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>
        ) : !stats ? null : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "CA du jour",   value: `${stats.todayCA.toFixed(2)} €`,    icon: '📅', color: '#1565C0' },
                { label: "CA du mois",   value: `${stats.totalCA.toFixed(2)} €`,    icon: '📆', color: '#00C853' },
                { label: "Missions",     value: stats.missionCount,                  icon: '🚑', color: '#FF6D00' },
                { label: "Terminées",    value: stats.doneCount,                     icon: '✅', color: '#00C853' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border shadow-sm p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart CA par jour */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs font-semibold mb-4" style={{ color: '#64748B' }}>
                CA par jour — {month} ({stats.byDay.length} jour{stats.byDay.length > 1 ? 's' : ''} avec activité)
              </p>
              {stats.byDay.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#94A3B8' }}>Aucune mission ce mois-ci</p>
              ) : (
                <div className="flex items-end gap-1 h-28 overflow-x-auto">
                  {stats.byDay.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-8 flex-1">
                      <span className="text-xs font-semibold" style={{ color: '#1565C0', fontSize: 9 }}>{d.ca.toFixed(0)}</span>
                      <div className="w-full rounded-t transition-all" title={`${d.date}: ${d.ca.toFixed(2)} €`}
                        style={{ height: `${Math.max((d.ca / maxCA) * 88, 4)}px`, background: '#1565C0', minWidth: 8 }} />
                      <span style={{ color: '#94A3B8', fontSize: 9 }}>{d.date.slice(8)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CA par véhicule */}
            {stats.byVehicle.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-4 py-2 border-b text-xs font-semibold" style={{ color: '#64748B' }}>CA par véhicule</div>
                {stats.byVehicle.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
                    <span className="text-sm">🚑</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>{v.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{v.count} mission{v.count > 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm" style={{ color: '#1565C0' }}>{v.ca.toFixed(2)} €</div>
                      {stats.totalCA > 0 && (
                        <div className="text-xs" style={{ color: '#94A3B8' }}>
                          {Math.round((v.ca / stats.totalCA) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-blue-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${stats.totalCA > 0 ? (v.ca / stats.totalCA) * 100 : 0}%`, background: '#1565C0' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CA par type */}
            {stats.byType.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-4 py-2 border-b text-xs font-semibold" style={{ color: '#64748B' }}>CA par type de transport</div>
                <div className="flex divide-x">
                  {stats.byType.map((t, i) => (
                    <div key={i} className="flex-1 p-4 text-center">
                      <div className="text-lg font-bold" style={{ color: '#1565C0' }}>{t.ca.toFixed(0)} €</div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: '#1F2937' }}>{t.type}</div>
                      <div className="text-xs" style={{ color: '#94A3B8' }}>{t.count} mission{t.count > 1 ? 's' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
