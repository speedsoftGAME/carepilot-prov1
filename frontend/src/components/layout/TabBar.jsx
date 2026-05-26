import useStore from '../../store/useStore.js'

const TABS = [
  { id: 'missions',        label: 'Missions',        icon: '🚑' },
  { id: 'flotte',          label: 'Flotte',          icon: '🚐' },
  { id: 'gps',             label: 'GPS',             icon: '📍' },
  { id: 'carte',           label: 'Carte',           icon: '🗺️' },
  { id: 'elisa',           label: 'Élisa',           icon: '📡' },
  { id: 'pointeuse',       label: 'Pointeuse',       icon: '⏱️' },
  { id: 'patients',        label: 'Patients',        icon: '👤' },
  { id: 'etablissements',  label: 'Établissements',  icon: '🏥' },
  { id: 'facturation',     label: 'Facturation',     icon: '📄' },
  { id: 'ca',              label: 'CA',              icon: '💶' },
  { id: 'heures',          label: 'Heures',          icon: '⏰' },
  { id: 'planning',        label: 'Planning',        icon: '📅' },
  { id: 'j1',              label: 'J+1',             icon: '🔮' },
  { id: 'imperatifs',      label: 'Impératifs',      icon: '⚡' },
  { id: 'alertes',         label: 'Alertes',         icon: '🔔' },
]

export default function TabBar() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <div className="bg-white border-b border-slate-200 flex overflow-x-auto shrink-0 shadow-sm">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-700 bg-blue-50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
