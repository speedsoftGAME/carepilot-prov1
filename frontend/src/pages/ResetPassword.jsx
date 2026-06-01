import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas')
    if (password.length < 8) return setError('8 caractères minimum')
    setLoading(true)
    setError('')
    try {
      await client.post('/api/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 60%, #1565C0 100%)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-bold text-lg mb-2" style={{ color: '#1F2937' }}>Lien invalide</h2>
          <p className="text-sm mb-4" style={{ color: '#64748B' }}>Ce lien de réinitialisation est invalide ou a expiré.</p>
          <Link to="/forgot-password" className="text-sm font-semibold" style={{ color: '#1565C0' }}>
            Demander un nouveau lien →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 60%, #1565C0 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚑</div>
          <h1 className="text-3xl font-bold text-white">CarePilot Pro</h1>
          <p className="text-blue-300 mt-1">Régulation ambulancière intelligente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {done ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>Mot de passe mis à jour !</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>
                Redirection vers la connexion dans 3 secondes...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#1F2937' }}>Nouveau mot de passe</h2>
              <p className="text-sm mb-6" style={{ color: '#64748B' }}>Choisissez un nouveau mot de passe sécurisé.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nouveau mot de passe *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="8 caractères minimum"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={inputCls}
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </form>
              <p className="text-center text-xs text-slate-400 mt-4">
                <Link to="/login" style={{ color: '#1565C0' }} className="font-medium">← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
