import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await client.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur, veuillez réessayer')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 60%, #1565C0 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚑</div>
          <h1 className="text-3xl font-bold text-white">CarePilot Pro</h1>
          <p className="text-blue-300 mt-1">Régulation ambulancière intelligente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>Email envoyé !</h2>
              <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                Si cet email est associé à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>
                Vérifiez aussi vos spams.
              </p>
              <Link to="/login" className="text-sm font-semibold" style={{ color: '#1565C0' }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#1F2937' }}>Mot de passe oublié ?</h2>
              <p className="text-sm mb-6" style={{ color: '#64748B' }}>
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@carepilot.fr"
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
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
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
