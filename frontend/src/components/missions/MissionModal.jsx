import { useState, useEffect } from 'react'
import Modal from '../shared/Modal.jsx'
import VehiclePicker from './VehiclePicker.jsx'

const EMPTY = {
  date: new Date().toISOString().split('T')[0],
  time: '', patient: '', patNom: '', patPrenom: '',
  from: '', to: '', type: 'AMB', priority: 'normal',
  trajet: 'aller', notes: '', ca: '', vehicleId: '', status: 'waiting',
  nss: '', mutuelle: '', numMutuelle: '', ddn: '', phone: '', adresse: '', medecin: '', obs: '',
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', required }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
  )
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
      {children}
    </select>
  )
}

export default function MissionModal({ open, onClose, mission, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [tab, setTab] = useState('infos')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mission) setForm({ ...EMPTY, ...mission, vehicleId: mission.vehicleId || '', ca: mission.ca || '' })
    else setForm(EMPTY)
    setTab('infos')
  }, [mission, open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({ ...form, ca: parseFloat(form.ca) || 0, vehicleId: form.vehicleId || null })
      onClose()
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mission ? `Modifier ${mission.numero}` : 'Nouvelle mission'} size="lg">
      <form onSubmit={handleSubmit}>
        {/* Onglets */}
        <div className="flex gap-1 mb-5 bg-slate-100 rounded-lg p-1">
          {[['infos', '📋 Informations'], ['patient', '👤 Patient'], ['vehicule', '🚐 Véhicule']].map(([id, lbl]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Onglet Informations */}
        {tab === 'infos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" required>
                <Input type="date" value={form.date} onChange={set('date')} required />
              </Field>
              <Field label="Heure">
                <Input type="time" value={form.time} onChange={set('time')} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Type">
                <Select value={form.type} onChange={set('type')}>
                  <option>AMB</option><option>VSL</option><option>SMUR</option><option>TAXI</option>
                </Select>
              </Field>
              <Field label="Priorité">
                <Select value={form.priority} onChange={set('priority')}>
                  <option value="normal">Normale</option>
                  <option value="urgent">Urgente</option>
                </Select>
              </Field>
              <Field label="Trajet">
                <Select value={form.trajet} onChange={set('trajet')}>
                  <option value="aller">Aller</option>
                  <option value="retour">Retour</option>
                  <option value="aller-retour">Aller-Retour</option>
                </Select>
              </Field>
            </div>
            <Field label="Prise en charge" required>
              <Input value={form.from} onChange={set('from')} placeholder="Adresse de départ" required />
            </Field>
            <Field label="Destination" required>
              <Input value={form.to} onChange={set('to')} placeholder="Adresse d'arrivée" required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CA (€)">
                <Input type="number" value={form.ca} onChange={set('ca')} placeholder="0.00" />
              </Field>
              <Field label="Statut">
                <Select value={form.status} onChange={set('status')}>
                  <option value="waiting">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </Select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea value={form.notes} onChange={set('notes')} rows={2}
                placeholder="Observations, équipements requis..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </Field>
          </div>
        )}

        {/* Onglet Patient */}
        {tab === 'patient' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom"><Input value={form.patNom} onChange={set('patNom')} placeholder="Dupont" /></Field>
              <Field label="Prénom"><Input value={form.patPrenom} onChange={set('patPrenom')} placeholder="Jean" /></Field>
            </div>
            <Field label="Patient (affiché)" required>
              <Input value={form.patient} onChange={set('patient')} placeholder="Nom Prénom" required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="NSS"><Input value={form.nss} onChange={set('nss')} placeholder="1 85 03 38 031..." /></Field>
              <Field label="Date de naissance"><Input type="date" value={form.ddn} onChange={set('ddn')} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mutuelle"><Input value={form.mutuelle} onChange={set('mutuelle')} placeholder="MGEN" /></Field>
              <Field label="N° Mutuelle"><Input value={form.numMutuelle} onChange={set('numMutuelle')} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Téléphone"><Input type="tel" value={form.phone} onChange={set('phone')} placeholder="06 00 00 00 00" /></Field>
              <Field label="Médecin"><Input value={form.medecin} onChange={set('medecin')} placeholder="Dr. Martin" /></Field>
            </div>
            <Field label="Adresse patient">
              <Input value={form.adresse} onChange={set('adresse')} placeholder="12 rue de la Paix, Grenoble" />
            </Field>
            <Field label="Observations">
              <textarea value={form.obs} onChange={set('obs')} rows={2} placeholder="Allergies, mobilité réduite..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </Field>
          </div>
        )}

        {/* Onglet Véhicule */}
        {tab === 'vehicule' && (
          <div>
            <p className="text-sm text-slate-500 mb-3">Sélectionne le véhicule à assigner :</p>
            <VehiclePicker value={form.vehicleId} onChange={(vid) => setVal('vehicleId', vid || '')} requiredType={form.type} />
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Enregistrement...' : mission ? 'Modifier' : 'Créer la mission'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
