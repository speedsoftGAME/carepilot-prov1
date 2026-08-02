const STATUS = {
  waiting:     { label: 'En attente',  bg: 'bg-slate-100',  text: 'text-slate-600', dot: 'bg-slate-400' },
  in_progress: { label: 'En cours',    bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  done:        { label: 'Terminée',    bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  cancelled:   { label: 'Annulée',     bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400' },
}

const PRIORITY = {
  normal: null,
  urgent: 'bg-red-500 text-white',
}

export default function MissionCard({ mission, onClick, onStatusChange }) {
  const s = STATUS[mission.status] || STATUS.waiting

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border ${mission.priority === 'urgent' ? 'border-red-400 shadow-red-100' : 'border-slate-200'} shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{mission.numero}</span>
          {mission.priority === 'urgent' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500 text-white animate-pulse">URGENT</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot} mr-1`} />
            {s.label}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{mission.type}</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="font-semibold text-slate-800">{mission.patient}</div>
        {mission.time && <div className="text-xs text-blue-600 font-medium">{mission.time}</div>}
      </div>

      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex items-start gap-1">
          <span className="text-green-600 shrink-0">▶</span>
          <span className="truncate">{mission.from}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-red-500 shrink-0">■</span>
          <span className="truncate">{mission.to}</span>
        </div>
      </div>

      {mission.vehicle && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <span className="text-xs">🚐</span>
          <span className="text-xs text-slate-600">{mission.vehicle.name}</span>
        </div>
      )}

      {onStatusChange && mission.status === 'waiting' && (
        <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onStatusChange(mission.id, 'in_progress')}
            className="flex-1 text-xs py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >
            Démarrer
          </button>
        </div>
      )}
      {onStatusChange && mission.status === 'in_progress' && (
        <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onStatusChange(mission.id, 'done')}
            className="flex-1 text-xs py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Terminer
          </button>
        </div>
      )}
    </div>
  )
}
