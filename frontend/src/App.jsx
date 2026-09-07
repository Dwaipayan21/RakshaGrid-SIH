import React, { useState, useEffect } from 'react'
import TopNav from './components/Layout/TopNav'
import ActionBar from './components/Layout/ActionBar'
import TacticalMapSection from './components/Dashboard/TacticalMapSection'
import HazardDetailPanel from './components/Dashboard/HazardDetailPanel'
import Drawer from './components/Drawers/Drawer'
import { hazardZones } from './data/hazardData'

const drawerTitles = {
  topo: 'Corridor Topography & Surge Clearance',
  convoy: 'Convoy Execution Segments',
  telemetry: 'On-Site Telemetry',
  matrix: 'Decision Matrix & Criteria Assessment',
  params: 'Overrides & Audit Log',
}

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [activeDrawer, setActiveDrawer] = useState(null)
  const [selectedZoneId, setSelectedZoneId] = useState('bhuragaon')
  const [activeHoveredSite, setActiveHoveredSite] = useState(null)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const selectedZone = hazardZones.find((z) => z.id === selectedZoneId) || hazardZones[0]

  const handleSelectZone = (zone) => {
    if (zone && zone.id) {
      setSelectedZoneId(zone.id)
    }
  }

  return (
    <main className="h-screen w-full flex flex-col overflow-hidden bg-tactical-base text-slate-100 font-sans transition-colors duration-300">
      <TopNav theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex overflow-hidden p-4 gap-4 relative">
        <TacticalMapSection
          hazardZones={hazardZones}
          selectedZone={selectedZone}
          onSelectZone={handleSelectZone}
          activeHoveredSite={activeHoveredSite}
        />
        <HazardDetailPanel
          zone={selectedZone}
          onOpenDrawer={setActiveDrawer}
          activeHoveredSite={activeHoveredSite}
          setActiveHoveredSite={setActiveHoveredSite}
        />
      </div>

      <ActionBar
        onSendAlert={() => console.log('TODO: wire to alerts API')}
        onAuthorizeDispatch={() => console.log('TODO: wire to dispatch API')}
      />

      <Drawer
        activeKey={activeDrawer}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer ? drawerTitles[activeDrawer] : ''}
      >
        <p className="text-sm text-slate-400">
          Content for the "{activeDrawer}" panel goes here — build this out per drawer as the backend endpoints for it are ready.
        </p>
      </Drawer>
    </main>
  )
}

export default App
