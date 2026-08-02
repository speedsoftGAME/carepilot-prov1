import useStore from '../../store/useStore.js'

export default function StatsBar() {
  const { missions, vehicles } = useStore()

  const today = new Date().toISOString().split('T')[0]
  const todayMissions = missions.filter(m => m.date === today)

  const stats = [
    { label: 'Missions aujourd\'hui', value: todayMissions.length, color: '#1565C0' },
    { label: 'En attente', value: todayMissions.filter(m => m.status === 'waiting').length, color: '#64748B' },
    { label: 'En cours', value: todayMissions.filter(m => m.status === 'in_progress').length, color: '#FF6D00' },
    { label: 'Terminées', value: todayMissions.filter(m => m.status === 'done').length, color: '#00C853' },
    { label: 'Véhicules dispo', value: vehicles.filter(v => v.status === 'available').length, color: '#00C853' },
    { label: 'En mission', value: vehicles.filter(v => v.status === 'on_mission').length, color: '#FF6D00' },
    {
      label: 'CA du jour',
      value: todayMissions.reduce((s, m) => s + (m.ca || 0), 0).toFixed(0) + ' €',
      color: '#1565C0',
    },
  ]

  return (
    <div style={{ background: '#0D2347' }} className="px-4 py-2 flex gap-6 overflow-x-auto">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
          <span className="text-blue-300 text-xs">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
