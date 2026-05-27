import { useState, useEffect } from 'react'
import { billingApi } from '../../api/billing.js'
import useStore from '../../store/useStore.js'

const STATUT_STYLE = {
  pending:   { label: 'En attente', bg: '#FF6D0022', color: '#FF6D00' },
  sent:      { label: 'Envoyé',     bg: '#2196F322', color: '#2196F3' },
  validated: { label: 'Validé',     bg: '#00C85322', color: '#00C853' },
}

export default function FacturationPanel() {
  const addToast = useStore(s => s.addToast)
  const token = useStore(s => s.token)
  const [bts, setBts] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patient: '', date: new Date().toISOString().split('T')[0], from: '', to: '', amount: '', type: 'AMB', trajet: 'aller', nss: '', mutuelle: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await billingApi.getBTs(month)
      setBts(data)
    } catch {
      addToast('Impossible de charger les bons de transport', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const bt = await billingApi.createBT(form)
      setBts(prev => [bt, ...prev])
      setShowForm(false)
      setForm({ patient: '', date: new Date().toISOString().split('T')[0], from: '', to: '', amount: '', type: 'AMB', trajet: 'aller', nss: '', mutuelle: '' })
      addToast('Bon de transport créé', 'success')
    } catch {
      addToast('Erreur lors de la création', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      const updated = await billingApi.updateStatus(id, status)
      setBts(prev => prev.map(b => b.id === id ? updated : b))
    } catch {
      addToast('Erreur mise à jour statut', 'error')
    }
  }

  const downloadPdf = (bt) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.open(`${apiUrl}/api/billing/bt/${bt.id}/pdf?token=${token}`, '_blank')
  }

  const totalCA = bts.reduce((sum, b) => sum + (b.amount || 0), 0)

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#0A1628' }}>Facturation — Bons de Transport</h2>
          <p className="text-xs" style={{ color: '#64748B' }}>{bts.length} BT · CA {totalCA.toFixed(2)} €</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs" style={{ color: '#1F2937' }} />
          <button onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#1565C0' }}>
            + Générer BT
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F0F4FF' }}>
        {showForm && (
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#0A1628' }}>Nouveau Bon de Transport</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Patient *</label>
                <input required value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="Nom Prénom" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Date *</label>
                <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Montant (€)</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>De</label>
                <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="Lieu de prise en charge" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Vers</label>
                <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="Destination" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>N° SS</label>
                <input value={form.nss} onChange={e => setForm(f => ({ ...f, nss: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="1 84 05 ..." />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#64748B' }}>Mutuelle</label>
                <input value={form.mutuelle} onChange={e => setForm(f => ({ ...f, mutuelle: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="Nom mutuelle" />
              </div>
              <div className="col-span-2 flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm border font-semibold" style={{ color: '#64748B' }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#1565C0', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Création...' : 'Créer le BT'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: '#94A3B8' }}>Chargement...</div>
          ) : bts.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: '#94A3B8' }}>Aucun bon de transport ce mois-ci</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ background: '#F0F4FF' }}>
                  {['N° BT', 'Patient', 'Date', 'Trajet', 'Montant', 'Statut', ''].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bts.map(b => {
                  const s = STATUT_STYLE[b.status] || STATUT_STYLE.pending
                  return (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-blue-50 transition">
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#1565C0' }}>{b.numero}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#1F2937' }}>{b.patient}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#64748B' }}>{b.date}</td>
                      <td className="px-4 py-3 text-xs max-w-32 truncate" style={{ color: '#64748B' }}>{b.from} → {b.to}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#1F2937' }}>{b.amount?.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <select value={b.status} onChange={e => handleStatus(b.id, e.target.value)}
                          className="text-xs px-2 py-0.5 rounded-full font-medium border-0 outline-none cursor-pointer"
                          style={{ background: s.bg, color: s.color }}>
                          <option value="pending">En attente</option>
                          <option value="sent">Envoyé</option>
                          <option value="validated">Validé</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => downloadPdf(b)}
                          className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 font-medium" style={{ color: '#1565C0' }}>
                          PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
