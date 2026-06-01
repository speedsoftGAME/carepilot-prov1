import { useState } from 'react'
import { useMissions } from '../../hooks/useMissions.js'
import { useVehicles } from '../../hooks/useVehicles.js'
import MissionCard from '../../components/missions/MissionCard.jsx'
import MissionModal from '../../components/missions/MissionModal.jsx'
import DispatchIA from '../../components/dispatch/DispatchIA.jsx'
import OKCareModal from '../../components/okcare/OKCareModal.jsx'
import EmptyState from '../../components/shared/EmptyState.jsx'
import useStore from '../../store/useStore.js'

const FILTERS = [
  { id: 'all',         label: 'Toutes' },
  { id: 'waiting',     label: 'En attente' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'done',        label: 'Terminées' },
  { id: 'urgent',      label: '🔴 Urgentes' },
]

export default function MissionsPanel() {
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editMission, setEditMission] = useState(null)
  const [dispatchMission, setDispatchMission] = useState(null)
  const [okcareMission, setOkcareMission] = useState(null)
  const { addToast } = useStore()

  const params = {}
  if (dateFilter) params.date = dateFilter
  if (filter === 'urgent') params.priority = 'urgent'
  else if (filter !== 'all') params.status = filter

  const { missions, create, update, changeStatus, assign, remove } = useMissions(params)
  useVehicles()

  const filtered = search.trim()
    ? missions.filter(m => m.patient.toLowerCase().includes(search.toLowerCase()))
    : missions

  const exportCSV = () => {
    const p = new URLSearchParams()
    if (dateFilter) p.set('date', dateFilter)
    if (filter === 'urgent') p.set('priority', 'urgent')
    else if (filter !== 'all') p.set('status', filter)
    const url = `/api/missions/export?${p.toString()}`
    const a = document.createElement('a')
    a.href = url; a.download = `missions_${dateFilter || 'export'}.csv`; a.click()
  }

  const openNew = () => { setEditMission(null); setModalOpen(true) }
  const openEdit = (m) => { setEditMission(m); setModalOpen(true) }
  const handleSave = (data) => editMission ? update(editMission.id, data) : create(data)
  const handleDelete = async (m) => {
    if (!confirm(`Supprimer la mission ${m.numero} ?`)) return
    try { await remove(m.id) } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />

        <div className="flex gap-1 flex-1 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === f.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f.label}
              {filter !== f.id && (
                <span className="ml-1 text-slate-400">
                  {f.id === 'all' ? missions.length
                    : f.id === 'urgent' ? missions.filter(m => m.priority === 'urgent').length
                    : missions.filter(m => m.status === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un patient..."
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-44"
        />
        <button onClick={exportCSV} title="Exporter en CSV"
          className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 shrink-0">
          📥 CSV
        </button>
        <button onClick={openNew}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 flex items-center gap-1 shrink-0">
          + Nouvelle mission
        </button>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <EmptyState icon="🚑" title="Aucune mission"
            message={search ? `Aucun patient correspondant à "${search}"` : `Aucune mission ${dateFilter ? 'ce jour' : ''} pour ce filtre.`}
            action={{ label: '+ Créer une mission', onClick: openNew }} />
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(m => (
              <div key={m.id} className="relative group">
                <MissionCard mission={m} onClick={() => openEdit(m)} onStatusChange={changeStatus} />
                {/* Actions au survol */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setDispatchMission(m) }}
                    title="Dispatch IA"
                    className="w-7 h-7 bg-blue-600 text-white rounded-md text-xs flex items-center justify-center hover:bg-blue-700">🤖</button>
                  <button onClick={(e) => { e.stopPropagation(); setOkcareMission(m) }}
                    title="Vérifier OKCare"
                    className="w-7 h-7 bg-green-600 text-white rounded-md text-xs flex items-center justify-center hover:bg-green-700">✅</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(m) }}
                    title="Supprimer"
                    className="w-7 h-7 bg-red-500 text-white rounded-md text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MissionModal open={modalOpen} onClose={() => setModalOpen(false)}
        mission={editMission} onSave={handleSave} />

      <DispatchIA open={!!dispatchMission} onClose={() => setDispatchMission(null)}
        mission={dispatchMission}
        onAssign={(vehicleId) => assign(dispatchMission.id, vehicleId)} />

      <OKCareModal open={!!okcareMission} onClose={() => setOkcareMission(null)}
        mission={okcareMission} />
    </div>
  )
}
