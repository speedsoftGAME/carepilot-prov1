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

const today = () => new Date().toISOString().split('T')[0]
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }

export default function MissionsPanel() {
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(today())
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editMission, setEditMission] = useState(null)
  const [prefillMission, setPrefillMission] = useState(null)
  const [dispatchMission, setDispatchMission] = useState(null)
  const [okcareMission, setOkcareMission] = useState(null)
  const { addToast } = useStore()

  // Toujours charger toutes les missions du jour — filtrage côté client
  // Cela garantit des compteurs corrects et synchronise le StatsBar
  const params = {}
  if (dateFilter) params.date = dateFilter

  const { missions, create, update, changeStatus, assign, remove } = useMissions(params)
  useVehicles()

  // Filtrage client-side
  const filtered = missions.filter(m => {
    if (filter === 'urgent') return m.priority === 'urgent'
    if (filter !== 'all') return m.status === filter
    return true
  }).filter(m =>
    !search.trim() || m.patient.toLowerCase().includes(search.toLowerCase())
  )

  const count = (fid) => {
    if (fid === 'all') return missions.length
    if (fid === 'urgent') return missions.filter(m => m.priority === 'urgent').length
    return missions.filter(m => m.status === fid).length
  }

  const exportCSV = () => {
    const p = new URLSearchParams()
    if (dateFilter) p.set('date', dateFilter)
    const url = `/api/missions/export?${p.toString()}`
    const a = document.createElement('a')
    a.href = url; a.download = `missions_${dateFilter || 'export'}.csv`; a.click()
  }

  const openNew = () => { setEditMission(null); setPrefillMission(null); setModalOpen(true) }
  const openEdit = (m) => { setEditMission(m); setPrefillMission(null); setModalOpen(true) }

  const openDuplicate = (m) => {
    const { id, numero, createdAt, vehicle, vehicleId, ...data } = m
    setPrefillMission({ ...data, status: 'waiting', date: today() })
    setEditMission(null)
    setModalOpen(true)
  }

  const handleSave = (data) => editMission ? update(editMission.id, data) : create(data)

  const handleDelete = async (m) => {
    if (!confirm(`Supprimer la mission ${m.numero} ?`)) return
    try { await remove(m.id) } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error') }
  }

  const isToday = dateFilter === today()
  const isTomorrow = dateFilter === tomorrow()

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Sélecteur de date + raccourcis */}
        <div className="flex items-center gap-1">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={() => setDateFilter(today())}
            className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${isToday ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            Auj.
          </button>
          <button onClick={() => setDateFilter(tomorrow())}
            className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${isTomorrow ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            Dem.
          </button>
        </div>

        {/* Filtres statut */}
        <div className="flex gap-1 flex-1 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === f.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f.label}
              <span className={`ml-1 ${filter === f.id ? 'text-blue-200' : 'text-slate-400'}`}>
                {count(f.id)}
              </span>
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
          <>
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
                    <button onClick={(e) => { e.stopPropagation(); openDuplicate(m) }}
                      title="Dupliquer la mission"
                      className="w-7 h-7 bg-slate-500 text-white rounded-md text-xs flex items-center justify-center hover:bg-slate-600">📋</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(m) }}
                      title="Supprimer"
                      className="w-7 h-7 bg-red-500 text-white rounded-md text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                  </div>
                </div>
              ))}
            </div>
            {missions.length > 0 && (
              <p className="text-center text-xs mt-4" style={{ color: '#94A3B8' }}>
                {filtered.length} mission{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
                {filter !== 'all' ? ` · ${missions.length} au total ce jour` : ''}
              </p>
            )}
          </>
        )}
      </div>

      <MissionModal open={modalOpen} onClose={() => { setModalOpen(false); setPrefillMission(null) }}
        mission={editMission} prefill={prefillMission} onSave={handleSave} />

      <DispatchIA open={!!dispatchMission} onClose={() => setDispatchMission(null)}
        mission={dispatchMission}
        onAssign={(vehicleId) => assign(dispatchMission.id, vehicleId)} />

      <OKCareModal open={!!okcareMission} onClose={() => setOkcareMission(null)}
        mission={okcareMission} />
    </div>
  )
}
