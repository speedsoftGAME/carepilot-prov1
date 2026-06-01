import { useState, useEffect } from 'react'
import { settingsApi } from '../../api/settings.js'
import { sitesApi } from '../../api/sites.js'
import { apiKeysApi } from '../../api/apikeys.js'
import { usersApi } from '../../api/users.js'
import useStore from '../../store/useStore.js'

const TAB = ['Général', 'Utilisateurs', 'Sites', 'API', 'SAMU']

// ─── Section Général ────────────────────────────────────────────────────────
function GeneralSection() {
  const addToast = useStore(s => s.addToast)
  const company = useStore(s => s.company)
  const setAuth = useStore(s => s.setAuth)
  const user = useStore(s => s.user)
  const token = useStore(s => s.token)
  const refreshToken = useStore(s => s.refreshToken)

  const [form, setForm] = useState({ name: '', siret: '', address: '', phone: '', email: '' })
  const [branding, setBranding] = useState({ primaryColor: '', logoUrl: '', appName: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi.get().then(({ company: c }) => {
      setForm({ name: c.name || '', siret: c.siret || '', address: c.address || '', phone: c.phone || '', email: c.email || '' })
      setBranding({ primaryColor: c.primaryColor || '', logoUrl: c.logoUrl || '', appName: c.appName || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const saveCompany = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await settingsApi.updateCompany(form)
      addToast('Informations sauvegardées ✓', 'success')
    } catch { addToast('Erreur lors de la sauvegarde', 'error') }
    finally { setSaving(false) }
  }

  const saveBranding = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const updated = await settingsApi.updateBranding(branding)
      // Met à jour le store pour effet immédiat
      setAuth({ user, accessToken: token, refreshToken, company: { ...company, ...updated } })
      addToast('Personnalisation appliquée ✓', 'success')
    } catch { addToast('Erreur lors de la sauvegarde', 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="p-6 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={saveCompany} className="bg-white rounded-xl border shadow-sm p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: '#0A1628' }}>Informations entreprise</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Raison sociale', key: 'name', placeholder: 'Ambulances du Dauphiné' },
            { label: 'SIRET', key: 'siret', placeholder: '123 456 789 00010' },
            { label: 'Adresse', key: 'address', placeholder: '15 rue de la Paix, Grenoble' },
            { label: 'Téléphone', key: 'phone', placeholder: '04 76 12 34 56' },
            { label: 'Email', key: 'email', placeholder: 'contact@ambulances.fr', type: 'email' },
          ].map(f => (
            <div key={f.key} className={f.key === 'address' ? 'col-span-2' : ''}>
              <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                type={f.type || 'text'} placeholder={f.placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <button type="submit" disabled={saving} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1565C0', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </form>

      <form onSubmit={saveBranding} className="bg-white rounded-xl border shadow-sm p-5">
        <h3 className="font-semibold text-sm mb-1" style={{ color: '#0A1628' }}>Personnalisation White-label</h3>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Personnalisez l'apparence de CarePilot Pro pour votre marque</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Nom de l'application</label>
            <input value={branding.appName} onChange={e => setBranding(p => ({ ...p, appName: e.target.value }))}
              placeholder="CarePilot Pro" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Couleur principale</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={branding.primaryColor || '#1565C0'}
                onChange={e => setBranding(p => ({ ...p, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded border cursor-pointer" />
              <input value={branding.primaryColor} onChange={e => setBranding(p => ({ ...p, primaryColor: e.target.value }))}
                placeholder="#1565C0" className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>URL du logo (HTTPS)</label>
            <input value={branding.logoUrl} onChange={e => setBranding(p => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://votre-site.fr/logo.png" type="url"
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="preview" className="mt-2 h-10 object-contain rounded border" />
            )}
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1565C0', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Sauvegarde...' : 'Appliquer'}
        </button>
      </form>
    </div>
  )
}

// ─── Section Utilisateurs ────────────────────────────────────────────────────
function UsersSection() {
  const addToast = useStore(s => s.addToast)
  const currentUser = useStore(s => s.user)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', role: 'dispatcher', password: '' })

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    usersApi.list().then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { addToast('Mot de passe : 8 caractères minimum', 'error'); return }
    setSaving(true)
    try {
      const created = await usersApi.create(form)
      setUsers(prev => [...prev, created])
      setForm({ email: '', name: '', role: 'dispatcher', password: '' })
      setShowForm(false)
      addToast('Utilisateur créé ✓', 'success')
    } catch (err) { addToast(err.response?.data?.error || 'Erreur création', 'error') }
    finally { setSaving(false) }
  }

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await usersApi.updateRole(id, role)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: updated.role } : u))
      addToast('Rôle mis à jour ✓', 'success')
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await usersApi.remove(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      addToast('Utilisateur supprimé', 'success')
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
  }

  const ROLE_BADGE = {
    admin:      { label: 'Administrateur', color: '#7C3AED', bg: '#EDE9FE' },
    dispatcher: { label: 'Dispatcher',     color: '#1565C0', bg: '#DBEAFE' },
  }

  if (loading) return <div className="p-6 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>

  return (
    <div className="space-y-4">
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm" style={{ color: '#92400E' }}>
          ⚠ Seul un administrateur peut gérer les utilisateurs.
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#64748B' }}>
          {users.length} utilisateur{users.length !== 1 ? 's' : ''} dans votre espace
        </p>
        {isAdmin && (
          <button onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: '#1565C0' }}>
            + Ajouter un utilisateur
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>Nouvel utilisateur</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Email *</label>
              <input type="email" required value={form.email} placeholder="prenom.nom@ambulances.fr"
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Nom complet</label>
              <input value={form.name} placeholder="Jean Dupont"
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Rôle</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="dispatcher">Dispatcher</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Mot de passe provisoire *</label>
              <input type="password" required minLength={8} value={form.password} placeholder="8 caractères min."
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ color: '#64748B' }}>Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#1565C0' }}>
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: '#94A3B8' }}>Aucun utilisateur</div>
        ) : users.map(u => {
          const badge = ROLE_BADGE[u.role] || ROLE_BADGE.dispatcher
          const isSelf = u.id === currentUser?.id
          return (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: '#1565C0' }}>
                {(u.name || u.email)[0].toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: '#1F2937' }}>
                  {u.name || '—'} {isSelf && <span className="text-xs font-normal" style={{ color: '#94A3B8' }}>(vous)</span>}
                </div>
                <div className="text-xs truncate" style={{ color: '#64748B' }}>{u.email}</div>
              </div>
              {isAdmin && !isSelf ? (
                <select value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1 font-medium"
                  style={{ color: badge.color, background: badge.bg, borderColor: badge.color + '44' }}>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="admin">Administrateur</option>
                </select>
              ) : (
                <span className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ color: badge.color, background: badge.bg }}>
                  {badge.label}
                </span>
              )}
              <div className="text-xs" style={{ color: '#94A3B8' }}>
                {new Date(u.createdAt).toLocaleDateString('fr-FR')}
              </div>
              {isAdmin && !isSelf && (
                <button onClick={() => handleDelete(u.id)}
                  className="text-xs px-2 py-1 rounded-lg border text-red-400 hover:bg-red-50">
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section Sites ───────────────────────────────────────────────────────────
function SitesSection() {
  const addToast = useStore(s => s.addToast)
  const { sites, setSites } = useStore()
  const [form, setForm] = useState({ name: '', address: '', phone: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { sitesApi.list().then(setSites).catch(() => {}) }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const site = await sitesApi.create(form)
      setSites([...sites, site])
      setForm({ name: '', address: '', phone: '' })
      setShowForm(false)
      addToast('Site créé ✓', 'success')
    } catch { addToast('Erreur création site', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await sitesApi.remove(id)
      setSites(sites.filter(s => s.id !== id))
      addToast('Site supprimé', 'success')
    } catch { addToast('Erreur suppression', 'error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#64748B' }}>
          {sites.length} agence{sites.length !== 1 ? 's' : ''} — le sélecteur de site apparaît dans le header dès qu'un site est créé
        </p>
        <button onClick={() => setShowForm(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#1565C0' }}>
          + Ajouter un site
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>Nouvelle agence</h3>
          {[
            { label: 'Nom *', key: 'name', placeholder: 'Agence de Grenoble', required: true },
            { label: 'Adresse', key: 'address', placeholder: '15 rue de la Paix, Grenoble' },
            { label: 'Téléphone', key: 'phone', placeholder: '04 76 12 34 56' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>{f.label}</label>
              <input value={form[f.key]} required={f.required} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ color: '#64748B' }}>Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#1565C0' }}>Créer</button>
          </div>
        </form>
      )}

      {sites.map(s => (
        <div key={s.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
          <span className="text-xl">🏢</span>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{s.name}</div>
            {s.address && <div className="text-xs" style={{ color: '#64748B' }}>{s.address}</div>}
            {s.phone && <div className="text-xs" style={{ color: '#94A3B8' }}>{s.phone}</div>}
          </div>
          <button onClick={() => handleDelete(s.id)} className="text-xs px-2 py-1 rounded-lg border text-red-400 hover:bg-red-50">✕ Supprimer</button>
        </div>
      ))}

      {sites.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border p-8 text-center text-sm" style={{ color: '#94A3B8' }}>
          Aucun site configuré — mode mono-agence
        </div>
      )}
    </div>
  )
}

// ─── Section API ─────────────────────────────────────────────────────────────
function ApiSection() {
  const addToast = useStore(s => s.addToast)
  const company = useStore(s => s.company)
  const [keys, setKeys] = useState([])
  const [newKey, setNewKey] = useState(null)
  const [keyName, setKeyName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { apiKeysApi.list().then(setKeys).catch(() => {}).finally(() => setLoading(false)) }, [])

  const generate = async () => {
    if (!keyName.trim()) { addToast('Donnez un nom à cette clé', 'error'); return }
    try {
      const key = await apiKeysApi.create(keyName.trim())
      setNewKey(key)
      setKeys(prev => [{ ...key, key: key.key.slice(0, 8) + '••••••••••••••••••••••••' }, ...prev])
      setKeyName('')
      addToast('Clé générée — copiez-la maintenant, elle ne sera plus visible !', 'success')
    } catch { addToast('Erreur génération clé', 'error') }
  }

  const revoke = async (id) => {
    try {
      await apiKeysApi.revoke(id)
      setKeys(prev => prev.filter(k => k.id !== id))
      addToast('Clé révoquée', 'success')
    } catch { addToast('Erreur révocation', 'error') }
  }

  const isPro = ['pro', 'enterprise'].includes(company?.plan)

  return (
    <div className="space-y-4">
      {!isPro && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm" style={{ color: '#92400E' }}>
          ⚠ L'API publique est disponible à partir du plan <strong>Pro</strong>. Mettez à niveau pour générer des clés API.
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h3 className="font-semibold text-sm mb-1" style={{ color: '#0A1628' }}>Générer une clé API</h3>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
          Utilisez <code className="bg-slate-100 px-1 rounded">X-API-Key: votre-clé</code> dans vos requêtes vers <code className="bg-slate-100 px-1 rounded">/api/public/*</code>
        </p>
        <div className="flex gap-2">
          <input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="Nom de la clé (ex: Partenaire SAMU)"
            disabled={!isPro} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
          <button onClick={generate} disabled={!isPro}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: isPro ? '#1565C0' : '#CBD5E1' }}>
            Générer
          </button>
        </div>
      </div>

      {newKey && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-800 mb-2">✓ Clé créée — copiez-la maintenant, elle ne sera plus affichée</p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 bg-white border rounded-lg px-3 py-2 text-xs font-mono break-all">{newKey.key}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKey.key); addToast('Clé copiée !', 'success') }}
              className="px-3 py-2 rounded-lg text-xs font-semibold border" style={{ color: '#1565C0' }}>
              Copier
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-xs mt-2" style={{ color: '#94A3B8' }}>Fermer</button>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>
        ) : keys.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: '#94A3B8' }}>Aucune clé API générée</div>
        ) : keys.map(k => (
          <div key={k.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
            <span className="text-lg">🔑</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{k.name}</div>
              <code className="text-xs" style={{ color: '#94A3B8' }}>{k.key}</code>
            </div>
            <div className="text-right text-xs" style={{ color: '#94A3B8' }}>
              {k.lastUsed ? `Utilisé ${new Date(k.lastUsed).toLocaleDateString('fr-FR')}` : 'Jamais utilisé'}
            </div>
            <button onClick={() => revoke(k.id)} className="text-xs px-2 py-1 rounded-lg border text-red-400 hover:bg-red-50">Révoquer</button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-1" style={{ color: '#1565C0' }}>
        <p className="font-semibold">Endpoints disponibles :</p>
        <p><code>GET /api/public/status</code> — statut entreprise + véhicules</p>
        <p><code>GET /api/public/missions</code> — liste des missions (params: date, status)</p>
        <p><code>GET /api/public/vehicles</code> — positions véhicules</p>
        <p><code>POST /api/public/missions</code> — créer une mission (intégrations partenaires)</p>
      </div>
    </div>
  )
}

// ─── Section SAMU ─────────────────────────────────────────────────────────────
function SamuSection() {
  const addToast = useStore(s => s.addToast)
  const [config, setConfig] = useState({ endpointUrl: '', token: '', enabled: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatedToken, setGeneratedToken] = useState(null)

  useEffect(() => {
    settingsApi.getSamuConfig().then(c => { if (c) setConfig({ endpointUrl: c.endpointUrl || '', token: '', enabled: c.enabled }) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const generateToken = () => {
    const t = 'samu_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    setGeneratedToken(t)
    setConfig(p => ({ ...p, token: t }))
  }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await settingsApi.updateSamu(config)
      setGeneratedToken(null)
      addToast('Configuration SAMU sauvegardée ✓', 'success')
    } catch { addToast('Erreur sauvegarde', 'error') }
    finally { setSaving(false) }
  }

  const apiUrl = typeof window !== 'undefined' ? (import.meta.env?.VITE_API_URL || 'https://votre-api.railway.app') : ''

  if (loading) return <div className="p-6 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm" style={{ color: '#1565C0' }}>
        <p className="font-semibold mb-1">🏥 Intégration SAMU / Centre 15</p>
        <p className="text-xs">
          CarePilot Pro peut recevoir des alertes SAMU via webhook. Le SAMU envoie une requête <code className="bg-white px-1 rounded">POST</code> vers votre endpoint avec le header <code className="bg-white px-1 rounded">X-SAMU-Token</code>.
        </p>
      </div>

      <form onSubmit={save} className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm" style={{ color: '#0A1628' }}>Configuration</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs" style={{ color: '#64748B' }}>Intégration active</span>
            <div className="relative">
              <input type="checkbox" checked={config.enabled} onChange={e => setConfig(p => ({ ...p, enabled: e.target.checked }))} className="sr-only" />
              <div className="w-10 h-5 rounded-full transition-colors" style={{ background: config.enabled ? '#00C853' : '#CBD5E1' }}
                onClick={() => setConfig(p => ({ ...p, enabled: !p.enabled }))}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 mx-0.5"
                  style={{ transform: config.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Endpoint webhook (fourni au SAMU)</label>
          <div className="flex gap-2">
            <input value={`${apiUrl}/api/samu/webhook`} readOnly
              className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono bg-slate-50" />
            <button type="button" onClick={() => { navigator.clipboard.writeText(`${apiUrl}/api/samu/webhook`); addToast('Copié !', 'success') }}
              className="px-3 py-2 rounded-lg text-xs border" style={{ color: '#1565C0' }}>Copier</button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Token d'authentification SAMU (X-SAMU-Token)</label>
          <div className="flex gap-2">
            <input value={config.token} onChange={e => setConfig(p => ({ ...p, token: e.target.value }))}
              placeholder="Token actuel masqué" className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" />
            <button type="button" onClick={generateToken} className="px-3 py-2 rounded-lg text-xs border font-medium" style={{ color: '#1565C0' }}>
              Générer
            </button>
          </div>
          {generatedToken && (
            <p className="text-xs mt-1 text-green-700">✓ Nouveau token — sauvegardez avant de fermer cette page</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Format attendu (JSON)</label>
          <pre className="bg-slate-50 rounded-lg p-3 text-xs font-mono overflow-auto" style={{ color: '#1F2937' }}>{`{
  "patient": "Jean DUPONT",
  "adresseDepart": "15 rue de la Paix, Lyon",
  "adresseArrivee": "CHU Lyon, 103 Grande Rue",
  "typeTransport": "AMB",
  "priorite": "urgent",
  "numeroDossier": "SAMU69-2026-001",
  "commentaire": "Trauma crânien"
}`}</pre>
        </div>

        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#1565C0', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Sauvegarde...' : 'Enregistrer la configuration'}
        </button>
      </form>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function ParametresPanel() {
  const [tab, setTab] = useState(0)

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3">
        <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Paramètres</h2>
        <p className="text-xs" style={{ color: '#64748B' }}>Configuration avancée de CarePilot Pro</p>
      </div>

      {/* Onglets */}
      <div className="bg-white border-b px-4 flex gap-1">
        {TAB.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === i ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ background: '#F0F4FF' }}>
        {tab === 0 && <GeneralSection />}
        {tab === 1 && <UsersSection />}
        {tab === 2 && <SitesSection />}
        {tab === 3 && <ApiSection />}
        {tab === 4 && <SamuSection />}
      </div>
    </div>
  )
}
