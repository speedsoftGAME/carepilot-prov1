import { useState } from 'react'
import { useVehicles } from '../../hooks/useVehicles.js'
import Modal from '../../components/shared/Modal.jsx'
import EmptyState from '../../components/shared/EmptyState.jsx'
import useStore from '../../store/useStore.js'

const STATUS = {
  available:   { label: 'Disponible',    bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  on_mission:  { label: 'En mission',    bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  maintenance: { label: 'Maintenance',   bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  unavailable: { label: 'Indisponible',  bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400' },
}

const TYPE_ICON = { AMB: '🚑', VSL: '🚐', SMUR: '🚒', TAXI: '🚕' }

function VehicleFormModal({ open, onClose, vehicle, onSave }) {
  const [form, setForm] = useState({ name: '', type: 'AMB', crew: '' })
  const [loading, setLoading] = useState(false)
  useState(() => { if (vehicle) setForm({ name: vehicle.name, type: vehicle.type, crew: vehicle.crew || '' }) }, [vehicle])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await onSave(form); onClose() } catch (err) { alert(err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }
  const cls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'

  return (
    <Modal open={open} onClose={onClose} title={vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
          <input value={form.name} onChange={set('name')} required placeholder="Ambulance 1" className={cls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          <select value={form.type} onChange={set('type')} className={cls}>
            <option>AMB</option><option>VSL</option><option>SMUR</option><option>TAXI</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Équipage</label>
          <input value={form.crew} onChange={set('crew')} placeholder="Jean Dupont, Marie Martin" className={cls} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm">Annuler</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? '...' : vehicle ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function FlottePanel() {
  const { vehicles, create, update, changeStatus, remove } = useVehicles()
  const { addToast } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = filterStatus === 'all' ? vehicles : vehicles.filter(v => v.status === filterStatus)

  const openNew = () => { setEditVehicle(null); setModalOpen(true) }
  const openEdit = (v) => { setEditVehicle(v); setModalOpen(true) }
  const handleSave = (data) => editVehicle ? update(editVehicle.id, data) : create(data)
  const handleDelete = async (v) => {
    if (!confirm(`Supprimer ${v.name} ?`)) return
    try { await remove(v.id) } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
  }

  const counts = {
    all: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    on_mission: vehicles.filter(v => v.status === 'on_mission').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 flex-1">
          {[['all', 'Tous'], ['available', 'Disponibles'], ['on_mission', 'En mission'], ['maintenance', 'Maintenance']].map(([id, lbl]) => (
            <button key={id} onClick={() => setFilterStatus(id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium ${filterStatus === id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {lbl} <span className={filterStatus === id ? 'text-blue-200' : 'text-slate-400'}>{counts[id]}</span>
            </button>
          ))}
        </div>
        <button onClick={openNew}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 shrink-0">
          + Ajouter un véhicule
        </button>
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <EmptyState icon="🚐" title="Aucun véhicule" message="Ajoutez vos véhicules à la flotte."
            action={{ label: '+ Ajouter un véhicule', onClick: openNew }} />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(v => {
              const s = STATUS[v.status] || STATUS.available
              const activeMissions = v.missions?.filter(m => m.status !== 'done' && m.status !== 'cancelled') || []
              return (
                <div key={v.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                        {TYPE_ICON[v.type] || '🚐'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{v.name}</div>
                        <div className="text-xs text-slate-500">{v.type}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text} flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>

                  {v.crew && (
                    <div className="text-xs text-slate-600 mb-3 flex items-center gap-1">
                      <span>👥</span> {v.crew}
                    </div>
                  )}

                  {activeMissions.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-2 mb-3">
                      <p className="text-xs font-medium text-orange-700 mb-1">{activeMissions.length} mission(s) active(s)</p>
                      {activeMissions.slice(0, 2).map(m => (
                        <p key={m.id} className="text-xs text-orange-600 truncate">{m.patient} — {m.time || ''}</p>
                      ))}
                    </div>
                  )}

                  {/* Changement de statut rapide */}
                  <div className="flex gap-1 flex-wrap mb-3">
                    {Object.entries(STATUS).map(([k, val]) => (
                      <button key={k} onClick={() => changeStatus(v.id, k)}
                        disabled={v.status === k}
                        className={`text-xs px-2 py-1 rounded-md ${v.status === k ? `${val.bg} ${val.text} font-medium` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} disabled:cursor-default`}>
                        {val.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button onClick={() => openEdit(v)}
                      className="flex-1 text-xs py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(v)}
                      className="text-xs px-3 py-1.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <VehicleFormModal open={modalOpen} onClose={() => setModalOpen(false)}
        vehicle={editVehicle} onSave={handleSave} />
    </div>
  )
}
