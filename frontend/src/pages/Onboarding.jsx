import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const STEPS = ['Bienvenue', 'Votre flotte', 'Votre équipe', 'C\'est parti !']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [vehicle, setVehicle] = useState({ name: '', type: 'AMB' })
  const [employee, setEmployee] = useState({ name: '', role: '', pin: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finish = () => {
    localStorage.setItem('onboardingDone', '1')
    navigate('/dashboard')
  }

  const skip = (next) => { setError(''); setStep(next) }

  const addVehicle = async () => {
    if (!vehicle.name.trim()) return setError('Le nom du véhicule est requis')
    setLoading(true); setError('')
    try {
      await client.post('/api/vehicles', vehicle)
      setStep(2)
    } catch { setError('Impossible d\'ajouter le véhicule') }
    finally { setLoading(false) }
  }

  const addEmployee = async () => {
    if (!employee.name.trim() || !employee.pin) return setError('Nom et PIN requis')
    if (employee.pin.length < 4) return setError('PIN minimum 4 chiffres')
    setLoading(true); setError('')
    try {
      await client.post('/api/employees', employee)
      setStep(3)
    } catch { setError('Impossible d\'ajouter le salarié') }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 60%, #1565C0 100%)' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🚑</div>
          <h1 className="text-2xl font-bold text-white">CarePilot Pro</h1>
          <p className="text-blue-300 text-sm mt-1">Configuration initiale</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-blue-300 mb-2">
            {STEPS.map((s, i) => (
              <span key={s} style={{ opacity: i <= step ? 1 : 0.4, fontWeight: i === step ? 700 : 400 }}>{s}</span>
            ))}
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%`, background: 'white' }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</div>
          )}

          {/* Étape 0 — Bienvenue */}
          {step === 0 && (
            <div className="text-center">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>Bienvenue !</h2>
              <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                Configurons ensemble votre espace en 2 minutes.
              </p>
              <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>
                Vous pourrez tout modifier à tout moment dans le panneau Paramètres.
              </p>
              <button onClick={() => setStep(1)} className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition mb-2" style={{ background: '#1565C0' }}>
                Commencer la configuration →
              </button>
              <button onClick={finish} className="w-full py-2 text-sm rounded-xl" style={{ color: '#94A3B8' }}>
                Ignorer et aller au tableau de bord
              </button>
            </div>
          )}

          {/* Étape 1 — Véhicule */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#1F2937' }}>Votre premier véhicule 🚑</h2>
              <p className="text-sm mb-5" style={{ color: '#64748B' }}>Ajoutez votre première ambulance ou VSL.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nom du véhicule *</label>
                  <input value={vehicle.name} onChange={e => setVehicle(v => ({ ...v, name: e.target.value }))}
                    placeholder="Ambulance 1" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={vehicle.type} onChange={e => setVehicle(v => ({ ...v, type: e.target.value }))} className={inputCls}>
                    <option value="AMB">AMB — Ambulance</option>
                    <option value="VSL">VSL — Véhicule Sanitaire Léger</option>
                    <option value="SMUR">SMUR</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => skip(2)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ color: '#64748B' }}>Passer</button>
                <button onClick={addVehicle} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1565C0' }}>
                  {loading ? '...' : 'Ajouter →'}
                </button>
              </div>
            </>
          )}

          {/* Étape 2 — Salarié */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#1F2937' }}>Votre premier salarié 👷</h2>
              <p className="text-sm mb-5" style={{ color: '#64748B' }}>Il se connectera avec son PIN sur la pointeuse.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nom complet *</label>
                  <input value={employee.name} onChange={e => setEmployee(v => ({ ...v, name: e.target.value }))}
                    placeholder="Jean Dupont" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fonction</label>
                  <input value={employee.role} onChange={e => setEmployee(v => ({ ...v, role: e.target.value }))}
                    placeholder="Ambulancier DEA" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PIN (4 chiffres minimum) *</label>
                  <input type="password" inputMode="numeric" value={employee.pin} onChange={e => setEmployee(v => ({ ...v, pin: e.target.value }))}
                    placeholder="••••" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => skip(3)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ color: '#64748B' }}>Passer</button>
                <button onClick={addEmployee} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1565C0' }}>
                  {loading ? '...' : 'Ajouter →'}
                </button>
              </div>
            </>
          )}

          {/* Étape 3 — Terminé */}
          {step === 3 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>Tout est prêt !</h2>
              <p className="text-sm mb-1" style={{ color: '#64748B' }}>Votre espace CarePilot Pro est configuré.</p>
              <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>
                Ajoutez d'autres véhicules et salariés dans les panneaux<br />Flotte et Paramètres à tout moment.
              </p>
              <button onClick={finish} className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition" style={{ background: '#1565C0' }}>
                Accéder au tableau de bord →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
