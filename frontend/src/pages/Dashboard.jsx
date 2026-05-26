import { useState } from 'react'
import useStore from '../store/useStore.js'
import Header from '../components/layout/Header.jsx'
import StatsBar from '../components/layout/StatsBar.jsx'
import TabBar from '../components/layout/TabBar.jsx'
import SettingsModal from '../components/settings/SettingsModal.jsx'

import MissionsPanel from './panels/MissionsPanel.jsx'
import FlottePanel from './panels/FlottePanel.jsx'
import CartePanel from './panels/CartePanel.jsx'
import GPSPanel from './panels/GPSPanel.jsx'
import ElisaPanel from './panels/ElisaPanel.jsx'
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

const PANELS = {
  missions:       <MissionsPanel />,
  flotte:         <FlottePanel />,
  gps:            <GPSPanel />,
  carte:          <CartePanel />,
  elisa:          <ElisaPanel />,
  pointeuse:      <PointeusePanel />,
  patients:       <PatientsPanel />,
  etablissements: <EtablissementsPanel />,
  facturation:    <FacturationPanel />,
  ca:             <CAPanel />,
  heures:         <HeuresPanel />,
  planning:       <PlanningPanel />,
  j1:             <J1Panel />,
  imperatifs:     <ImperatifsPanel />,
  alertes:        <AlertesPanel />,
}

export default function Dashboard() {
  const activeTab = useStore(s => s.activeTab)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#F0F4FF' }}>
      <Header onSettings={() => setSettingsOpen(true)} />
      <StatsBar />
      <TabBar />
      <div className="flex-1 overflow-hidden">
        {PANELS[activeTab] || <MissionsPanel />}
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
