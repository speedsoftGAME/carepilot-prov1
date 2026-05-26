import useStore from '../../store/useStore.js'
import { useAuth } from '../../hooks/useAuth.js'

const PLAN_BADGE = {
  starter: 'bg-slate-500',
  pro: 'bg-blue-600',
  enterprise: 'bg-purple-600',
}

export default function Header({ onSettings }) {
  const { user, company } = useStore()
  const { logout } = useAuth()
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <header style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 100%)' }} className="px-4 py-2 flex items-center gap-4 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <span className="text-2xl">🚑</span>
        <div>
          <div className="text-white font-bold text-sm leading-tight">CarePilot Pro</div>
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

      <div className="flex-1" />

      {/* Date */}
      <span className="text-blue-200 text-xs capitalize hidden md:block">{dateStr}</span>

      {/* User */}
      <div className="flex items-center gap-3">
        <button onClick={onSettings} className="text-blue-200 hover:text-white text-sm flex items-center gap-1">
          <span>⚙</span>
          <span className="hidden md:block">{user?.name || user?.email}</span>
        </button>
        <button
          onClick={logout}
          className="text-blue-300 hover:text-red-300 text-xs px-2 py-1 border border-blue-600 rounded"
        >
          Déconnexion
        </button>
      </div>
    </header>
  )
}
