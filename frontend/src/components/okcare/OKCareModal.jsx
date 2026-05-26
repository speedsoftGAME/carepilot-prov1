import { useState } from 'react'
import Modal from '../shared/Modal.jsx'
import { verifyPatient, getUsage } from '../../api/okcare.js'
import { useEffect } from 'react'

export default function OKCareModal({ open, onClose, mission }) {
  const [form, setForm] = useState({ nss: '', mutuelle: '', patientNom: '', patientPrenom: '', ddn: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    if (open) {
      setResult(null); setError(null)
      if (mission) {
        setForm({
          nss: mission.nss || '',
          mutuelle: mission.mutuelle || '',
          patientNom: mission.patNom || '',
          patientPrenom: mission.patPrenom || '',
          ddn: mission.ddn || '',
        })
      }
      getUsage().then(setUsage).catch(() => {})
    }
  }, [open, mission])

  const verify = async () => {
    setLoading(true); setError(null)
    try {
      const data = await verifyPatient(form)
      setResult(data)
      setUsage(u => u ? { ...u, current: { ...u.current, count: data.usage.count, remaining: data.usage.remaining } } : u)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal open={open} onClose={onClose} title="✅ Vérification OKCare" size="md">
      {usage && (
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-4 text-xs">
          <span className="text-slate-600">Quota mensuel</span>
          <span className="font-semibold text-slate-800">{usage.current.count} / {usage.current.limit} utilisées</span>
        </div>
      )}

      {!result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nom</label>
              <input value={form.patientNom} onChange={e => set('patientNom', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prénom</label>
              <input value={form.patientPrenom} onChange={e => set('patientPrenom', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">NSS (numéro de sécurité sociale)</label>
            <input value={form.nss} onChange={e => set('nss', e.target.value)}
              placeholder="1 85 03 38 031 234 56"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mutuelle</label>
              <input value={form.mutuelle} onChange={e => set('mutuelle', e.target.value)}
                placeholder="MGEN, MAIF..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date de naissance</label>
              <input type="date" value={form.ddn} onChange={e => set('ddn', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

          <button onClick={verify} disabled={loading || (!form.nss && !form.mutuelle)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm mt-2">
            {loading ? 'Vérification en cours...' : 'Vérifier les droits'}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border ${result.tauxRemboursement === 100 ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{result.droitsOuverts ? '✅' : '❌'}</span>
              <div>
                <div className="font-bold text-slate-800">{result.statut === 'couvert' ? 'Droits ouverts' : 'Non couvert'}</div>
                <div className="text-xs text-slate-500">{result.regime}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.tauxRemboursement}%</div>
                <div className="text-xs text-slate-500">Sécurité Sociale</div>
              </div>
              {result.complementaire && (
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.tauxComplementaire}%</div>
                  <div className="text-xs text-slate-500">{result.complementaire}</div>
                </div>
              )}
            </div>
          </div>

          {result.simulation && (
            <p className="text-xs text-slate-400 text-center">Mode démonstration — données simulées</p>
          )}

          <div className="text-xs text-slate-500 text-center">
            {result.usage.remaining} vérifications restantes ce mois
          </div>

          <button onClick={() => setResult(null)}
            className="w-full py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Nouvelle vérification
          </button>
        </div>
      )}
    </Modal>
  )
}
