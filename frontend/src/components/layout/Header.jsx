import { useEffect, useState } from 'react'
import useStore from '../../store/useStore.js'
import { useAuth } from '../../hooks/useAuth.js'
import { sitesApi } from '../../api/sites.js'
import { usersApi } from '../../api/users.js'
import client from '../../api/client.js'

const PLAN_BADGE = {
  starter:    'bg-slate-500',
  pro:        'bg-blue-600',
  enterprise: 'bg-purple-600',
}

function ProfileModal({ open, onClose }) {
  const { user, setAuth, token, refreshToken, company } = useStore()
  const addToast = useStore(s => s.addToast)
  const [name, setName] = useState(user?.name || '')
  const [tab, setTab] = useState('profile')
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (open) { setName(user?.name || ''); setTab('profile'); setPwd({ current: '', next: '', confirm: '' }) } }, [open])

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const updated = await usersApi.updateProfile({ name })
      setAuth({ user: { ...user, ...updated }, accessToken: token, refreshToken, company })
      addToast('Profil mis à jour ✓', 'success')
      onClose()
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
    finally { setSaving(false) }
  }

  const changePwd = async (e) => {
    e.preventDefault()
    if (pwd.next !== pwd.confirm) return addToast('Les mots de passe ne correspondent pas', 'error')
    setSaving(true)
    try {
      await usersApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next })
      addToast('Mot de passe modifié ✓', 'success')
      onClose()
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
    finally { setSaving(false) }
  }

  if (!open) return null
  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: '#0A1628' }}>
          <h3 className="font-bold text-white">Mon profil</h3>
          <button onClick={onClose} className="text-white opacity-60 hover:opacity-100 text-xl">✕</button>
        </div>
        <div className="flex border-b">
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === t ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'profile' ? '👤 Informations' : '🔑 Mot de passe'}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'profile' ? (
            <form onSubmit={saveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#64748B' }}>Nom</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#64748B' }}>Email (non modifiable)</label>
                <input value={user?.email || ''} disabled className={inputCls + ' bg-gray-50 text-gray-400'} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#64748B' }}>Rôle</label>
                <input value={user?.role === 'admin' ? 'Administrateur' : 'Dispatcher'} disabled className={inputCls + ' bg-gray-50 text-gray-400'} />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#1565C0' }}>
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </form>
          ) : (
            <form onSubmit={changePwd} className="space-y-3">
              {[
                { label: 'Mot de passe actuel', key: 'current' },
                { label: 'Nouveau mot de passe', key: 'next' },
                { label: 'Confirmer le nouveau', key: 'confirm' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#64748B' }}>{f.label}</label>
                  <input type="password" value={pwd[f.key]} onChange={e => setPwd(p => ({ ...p, [f.key]: e.target.value }))} className={inputCls} placeholder="••••••••" />
                </div>
              ))}
              <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#1565C0' }}>
                {saving ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Header({ onSettings }) {
  const { user, company, activeSiteId, sites, unreadAlerts, setUnreadAlerts, setActiveTab, toasts } = useStore()
  const { setActiveSiteId, setSites } = useStore()
  const { logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    if (!user) return
    sitesApi.list().then(setSites).catch(() => {})
  }, [user?.companyId])

  useEffect(() => {
    if (!user) return
    client.get('/api/alerts').then(({ data }) => {
      setUnreadAlerts(data.filter(a => !a.read).length)
    }).catch(() => {})
  }, [user?.companyId])

  // Incrémenter le compteur quand Socket.io envoie une notification
  useEffect(() => {
    if (toasts.length > 0) {
      setUnreadAlerts(n => n + 1)
    }
  }, [toasts.length])

  useEffect(() => {
    const color = company?.primaryColor
    if (color) document.documentElement.style.setProperty('--brand', color)
  }, [company?.primaryColor])

  const appName = company?.appName || 'CarePilot Pro'

  return (
    <>
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

        {/* Sélecteur de site */}
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

        {/* Cloche alertes */}
        <button
          onClick={() => { setActiveTab('alertes'); setUnreadAlerts(0) }}
          className="relative text-blue-300 hover:text-white transition-colors"
          title="Alertes"
        >
          <span className="text-lg">🔔</span>
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-xs font-bold"
              style={{ background: '#F44336', fontSize: 10 }}>
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </button>

        {/* Profil */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm"
          title="Mon profil"
        >
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: '#1565C0' }}>
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </span>
          <span className="hidden md:block">{user?.name || user?.email}</span>
        </button>

        {/* Déconnexion */}
        <button onClick={logout} title="Déconnexion"
          className="text-blue-300 hover:text-red-300 text-xs px-2 py-1 border border-blue-700 rounded transition-colors">
          ⏻
        </button>
      </header>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
