import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', companyName: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.companyName, form.email, form.password, form.name)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 60%, #1565C0 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚑</div>
          <h1 className="text-3xl font-bold text-white">CarePilot Pro</h1>
          <p className="text-blue-300 mt-1">Régulation ambulancière intelligente</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
              Connexion
            </button>
            <button onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nom de l'entreprise *</label>
                  <input value={form.companyName} onChange={set('companyName')} required
                    placeholder="Ambulances du Dauphiné" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Votre nom</label>
                  <input value={form.name} onChange={set('name')} placeholder="Jean Dupont" className={inputCls} />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required
                placeholder="admin@carepilot.fr" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mot de passe *</label>
              <input type="password" value={form.password} onChange={set('password')} required
                placeholder="••••••••" className={inputCls} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2">
              {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Compte démo : admin@carepilot.fr / password123
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
