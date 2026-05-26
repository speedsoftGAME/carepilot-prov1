import useStore from '../../store/useStore.js'

const STATUS_COLOR = {
  available:   'text-green-600',
  on_mission:  'text-orange-500',
  maintenance: 'text-slate-400',
  unavailable: 'text-red-400',
}
const STATUS_LABEL = {
  available:   'Disponible',
  on_mission:  'En mission',
  maintenance: 'Maintenance',
  unavailable: 'Indisponible',
}

export default function VehiclePicker({ value, onChange, requiredType }) {
  const { vehicles } = useStore()
  const filtered = requiredType ? vehicles.filter(v => v.type === requiredType || v.status === 'available') : vehicles

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${!value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
      >
        Aucun véhicule
      </button>
      {filtered.map(v => (
        <button
          key={v.id}
          type="button"
          onClick={() => onChange(v.id)}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${
            value === v.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
          } ${v.status !== 'available' ? 'opacity-60' : ''}`}
        >
          <span className="font-medium">{v.name} <span className="font-normal text-slate-500">({v.type})</span></span>
          <span className={`text-xs ${STATUS_COLOR[v.status]}`}>{STATUS_LABEL[v.status]}</span>
        </button>
      ))}
      {filtered.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun véhicule disponible</p>}
    </div>
  )
}
