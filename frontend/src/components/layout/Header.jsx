import { useEffect } from 'react'
import useStore from '../../store/useStore.js'
import { useAuth } from '../../hooks/useAuth.js'
import { sitesApi } from '../../api/sites.js'

const PLAN_BADGE = {
  starter:    'bg-slate-500',
  pro:        'bg-blue-600',
  enterprise: 'bg-purple-600',
}

export default function Header({ onSettings }) {
  const { user, company, activeSiteId, sites } = useStore()
  const { setActiveSiteId, setSites } = useStore()
  const { logout } = useAuth()
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  // Charge les sites au montage
  useEffect(() => {
    if (!user) return
    sitesApi.list().then(setSites).catch(() => {})
  }, [user?.companyId])

  // Applique la couleur de marque dynamiquement
  useEffect(() => {
    const color = company?.primaryColor
    if (color) document.documentElement.style.setProperty('--brand', color)
  }, [company?.primaryColor])

  const appName = company?.appName || 'CarePilot Pro'

  return (
    <header style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 100%)' }} className="px-4 py-2 flex items-center gap-4 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        {company?.logoUrl ? (
          <img src={company.logoUrl} alt="logo" className="w-8 h-8 rounded object-contain" />
        ) : (
          <span className="text-2xl">🚑</span>
        )}
        <div>
          <div className="text-white font-bold text-sm leading-tight">{appName}</div>
          <div className="text-blue-300 text-xs">Régulation ambulancière</div>
        </div>
      </div>

      {/* Entreprise */}
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold text-sm">{company?.name || '...'}</span>
        <span className={`text-white text-xs px-2 py-0.5 rounded-full font-medium uppercase ${PLAN_BADGE[company?.plan] || 'bg-slate-500'}`}>
          {company?.plan || 'starter'}
        </span>
      </div>

      {/* Sélecteur de site (multi-agences) */}
      {sites.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-blue-300 text-xs">📍</span>
          <select
            value={activeSiteId || ''}
            onChange={e => setActiveSiteId(e.target.value || null)}
            className="text-xs bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1 outline-none cursor-pointer"
          >
            <option value="">Tous les sites</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1" />

      {/* Date */}
      <span className="text-blue-200 text-xs capitalize hidden md:block">{dateStr}</span>

      {/* User */}
      <div className="flex items-center gap-3">
        <button onClick={onSettings} className="text-blue-200 hover:text-white text-sm flex items-center gap-1">
          <span>⚙</span>
          <span className="hidden md:block">{user?.name || user?.email}</span>
        </button>
        <button onClick={logout} className="text-blue-300 hover:text-red-300 text-xs px-2 py-1 border border-blue-600 rounded">
          Déconnexion
        </button>
      </div>
    </header>
  )
}
