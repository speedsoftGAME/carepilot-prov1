import { useState } from 'react'
import useStore from '../store/useStore.js'
import { useMissions } from '../hooks/useMissions.js'
import { useVehicles } from '../hooks/useVehicles.js'
import Header from '../components/layout/Header.jsx'
import StatsBar from '../components/layout/StatsBar.jsx'
import TabBar from '../components/layout/TabBar.jsx'
import SettingsModal from '../components/settings/SettingsModal.jsx'
import ErrorBoundary from '../components/shared/ErrorBoundary.jsx'

import MissionsPanel from './panels/MissionsPanel.jsx'
import FlottePanel from './panels/FlottePanel.jsx'
import CartePanel from './panels/CartePanel.jsx'
import GPSPanel from './panels/GPSPanel.jsx'
import PointeusePanel from './panels/PointeusePanel.jsx'
import PatientsPanel from './panels/PatientsPanel.jsx'
import EtablissementsPanel from './panels/EtablissementsPanel.jsx'
import FacturationPanel from './panels/FacturationPanel.jsx'
import CAPanel from './panels/CAPanel.jsx'
import HeuresPanel from './panels/HeuresPanel.jsx'
import PlanningPanel from './panels/PlanningPanel.jsx'
import J1Panel from './panels/J1Panel.jsx'
import ImperatifsPanel from './panels/ImperatifsPanel.jsx'
import AlertesPanel from './panels/AlertesPanel.jsx'
import ParametresPanel from './panels/ParametresPanel.jsx'

const wrap = (Panel) => <ErrorBoundary><Panel /></ErrorBoundary>

const PANELS = {
  missions:       wrap(MissionsPanel),
  flotte:         wrap(FlottePanel),
  gps:            wrap(GPSPanel),
  carte:          wrap(CartePanel),
  pointeuse:      wrap(PointeusePanel),
  patients:       wrap(PatientsPanel),
  etablissements: wrap(EtablissementsPanel),
  facturation:    wrap(FacturationPanel),
  ca:             wrap(CAPanel),
  heures:         wrap(HeuresPanel),
  planning:       wrap(PlanningPanel),
  j1:             wrap(J1Panel),
  imperatifs:     wrap(ImperatifsPanel),
  alertes:        wrap(AlertesPanel),
  parametres:     wrap(ParametresPanel),
}

export default function Dashboard() {
  const activeTab = useStore(s => s.activeTab)
  const [settingsOpen, setSettingsOpen] = useState(false)
  useMissions()
  useVehicles()

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#F0F4FF' }}>
      <Header onSettings={() => setSettingsOpen(true)} />
      <StatsBar />
      <TabBar />
      <div className="flex-1 overflow-hidden">
        {PANELS[activeTab] || wrap(MissionsPanel)}
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
