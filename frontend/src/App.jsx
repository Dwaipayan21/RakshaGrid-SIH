import React, { useState, useEffect } from 'react'
import TopNav from './components/Layout/TopNav'
import ActionBar from './components/Layout/ActionBar'
import TacticalMapSection from './components/Dashboard/TacticalMapSection'
import HazardDetailPanel from './components/Dashboard/HazardDetailPanel'
import Drawer from './components/Drawers/Drawer'
import { hazardZones } from './data/hazardData'
import {
  checkRiskEngineHealth,
  assessSettlementRisk,
} from './services/riskApi'

const drawerTitles = {
  topo: 'Corridor Topography & Surge Clearance',
  convoy: 'Convoy Execution Segments',
  telemetry: 'On-Site Telemetry',
  matrix: 'Decision Matrix & Criteria Assessment',
  params: 'Overrides & Audit Log',
}

const App = () => {
  // =========================================================
  // THEME
  // =========================================================

  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  )

  // =========================================================
  // UI STATE
  // =========================================================

  const [activeDrawer, setActiveDrawer] = useState(null)

  const [selectedZoneId, setSelectedZoneId] =
    useState('bhuragaon')

  const [activeHoveredSite, setActiveHoveredSite] =
    useState(null)

  // =========================================================
  // RISK ENGINE STATE
  // =========================================================

  const [riskApiStatus, setRiskApiStatus] =
    useState('checking')

  const [riskAssessment, setRiskAssessment] =
    useState(null)

  const [riskLoading, setRiskLoading] =
    useState(false)

  const [riskError, setRiskError] =
    useState(null)

  // =========================================================
  // THEME
  // =========================================================

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

  // =========================================================
  // RISK ENGINE HEALTH CHECK
  // =========================================================

  useEffect(() => {
    checkRiskEngineHealth()
      .then(() => {
        console.log(
          'RakshaGrid Risk Engine: ONLINE'
        )

        setRiskApiStatus('online')
      })
      .catch((error) => {
        console.error(
          'Risk API health check failed:',
          error
        )

        setRiskApiStatus('offline')
      })
  }, [])

  // =========================================================
  // SELECTED ZONE
  // =========================================================

  const selectedZone =
    hazardZones.find(
      (z) => z.id === selectedZoneId
    ) || hazardZones[0]

  // =========================================================
  // CONVERT FRONTEND ZONE DATA
  // → RISK ENGINE INPUT
  // =========================================================

  const buildSettlementPayload = (zone) => {
    /*
     * Current hazardData contains prototype/demo values.
     *
     * These values are mapped into the settlement
     * schema expected by the Risk Engine.
     *
     * Later these fields can be replaced with
     * authoritative government / GIS / telemetry data.
     */

    const population =
      Number(zone.population || 0)

    const vulnerablePopulation =
      Number(
        zone.vulnerablePopulation || 0
      )

    const vulnerabilityScore =
      population > 0
        ? Math.min(
            100,
            (vulnerablePopulation /
              population) *
              100
          )
        : 50

    // =======================================================
    // FLOOD INDICATORS
    // =======================================================

    const hazardImpact =
      zone.hazardImpact || {}

    const rainfall =
      Number(
        hazardImpact.rainfall?.value
      ) ||
      Number(zone.rainfall_mm) ||
      180

    const riverLevel =
      Number(
        hazardImpact.riverLevel?.value
      ) ||
      Number(zone.river_level_m) ||
      8.2

    const dangerLevel =
      Number(
        hazardImpact.dangerLevel?.value
      ) ||
      Number(zone.danger_level_m) ||
      7.5

    const inundationDepth =
      Number(
        hazardImpact.inundationDepth?.value
      ) ||
      Number(zone.inundation_depth_m) ||
      1.4

    const historicalFrequency =
      Number(
        hazardImpact.floodFrequency?.value
      ) /
        100 ||
      Number(
        zone.historical_flood_frequency
      ) ||
      0.75

    // =======================================================
    // SETTLEMENT PAYLOAD
    // =======================================================

    return {
      settlement_id:
        `ASSAM-MORIGAON-${String(
          zone.id
        ).toUpperCase()}`,

      settlement_name:
        zone.name ||
        'Unknown Settlement',

      state: 'Assam',

      district:
        zone.district ||
        'Morigaon',

      hazard_type: 'flood',

      latitude:
        Number(zone.lat || 26.25),

      longitude:
        Number(zone.lon || 92.34),

      population,

      households: Number(
        zone.households ||
          Math.ceil(
            population / 5
          )
      ),

      population_density:
        Number(
          zone.populationDensity ||
            1000
        ),

      vulnerability_score:
        vulnerabilityScore,

      travel_time_minutes:
        Number(
          zone.travel_time_minutes ||
            35
        ),

      road_accessibility:
        Number(
          zone.road_accessibility ||
            0.4
        ),

      shelter_capacity:
        Number(
          zone.shelter_capacity ||
            zone.nearbySites?.reduce(
              (total, site) =>
                total +
                Number(
                  site.available || 0
                ),
              0
            ) ||
            1200
        ),

      // Flood-specific indicators
      rainfall_mm: rainfall,

      river_level_m: riverLevel,

      danger_level_m: dangerLevel,

      inundation_depth_m:
        inundationDepth,

      historical_flood_frequency:
        historicalFrequency,
    }
  }

  // =========================================================
  // RUN RISK ASSESSMENT
  // =========================================================

  const runRiskAssessment = async (zone) => {
    if (!zone) return

    setRiskLoading(true)
    setRiskError(null)

    try {
      const settlementPayload =
        buildSettlementPayload(zone)

      console.log(
        'Sending settlement to RakshaGrid Risk Engine:',
        settlementPayload
      )

      const response =
        await assessSettlementRisk(
          settlementPayload
        )

      console.log(
        'Risk Engine response:',
        response
      )

      setRiskAssessment(response)
    } catch (error) {
      console.error(
        'Risk assessment failed:',
        error
      )

      setRiskError(
        error.message ||
          'Risk assessment failed'
      )
    } finally {
      setRiskLoading(false)
    }
  }

  // =========================================================
  // RUN ASSESSMENT WHEN ZONE CHANGES
  // =========================================================

  useEffect(() => {
    if (
      selectedZone &&
      riskApiStatus === 'online'
    ) {
      runRiskAssessment(
        selectedZone
      )
    }
  }, [
    selectedZoneId,
    riskApiStatus,
  ])

  // =========================================================
  // THEME TOGGLE
  // =========================================================

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'light'
        ? 'dark'
        : 'light'
    )
  }

  // =========================================================
  // ZONE SELECTION
  // =========================================================

  const handleSelectZone = (zone) => {
    if (zone && zone.id) {
      setSelectedZoneId(zone.id)
    }
  }

  // =========================================================
  // DASHBOARD METRICS
  // =========================================================

  const p1Count =
    hazardZones.filter(
      (zone) =>
        Number(
          zone.compositeRiskScore || 0
        ) >= 0.75
    ).length

  const p2Count =
    hazardZones.filter((zone) => {
      const score =
        Number(
          zone.compositeRiskScore || 0
        )

      return (
        score >= 0.5 &&
        score < 0.75
      )
    }).length

  const totalPopulation =
    hazardZones.reduce(
      (sum, zone) =>
        sum +
        Number(
          zone.population || 0
        ),
      0
    )

  const totalVulnerable =
    hazardZones.reduce(
      (sum, zone) =>
        sum +
        Number(
          zone.vulnerablePopulation ||
            0
        ),
      0
    )

  const selectedRisk =
    Math.round(
      Number(
        selectedZone?.compositeRiskScore ||
          0
      ) * 100
    )

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="h-screen w-full flex flex-col overflow-hidden bg-tactical-base text-slate-100 font-sans transition-colors duration-300">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <TopNav
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* =====================================================
          MAIN COMMAND AREA
          ===================================================== */}

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">

        {/* ===================================================
            MAP + HAZARD DETAIL
            =================================================== */}

        <div className="flex-1 flex overflow-hidden p-3 pb-2 gap-3 min-h-0">

          {/* TACTICAL MAP */}

          <TacticalMapSection
            hazardZones={hazardZones}
            selectedZone={selectedZone}
            onSelectZone={
              handleSelectZone
            }
            activeHoveredSite={
              activeHoveredSite
            }
          />

          {/* HAZARD DETAIL */}

          <HazardDetailPanel
            zone={selectedZone}
            riskAssessment={
              riskAssessment
            }
            riskLoading={
              riskLoading
            }
            riskError={
              riskError
            }
            onOpenDrawer={
              setActiveDrawer
            }
            activeHoveredSite={
              activeHoveredSite
            }
            setActiveHoveredSite={
              setActiveHoveredSite
            }
          />

        </div>

        {/* ===================================================
            COMPACT RISK SUMMARY
            =================================================== */}

        <div className="mx-3 mb-2 h-12 flex-shrink-0 rounded-xl border border-tactical-border bg-tactical-surface">

          <div className="h-full flex items-center px-4">

            {/* P1 */}

            <div className="flex items-center gap-2 pr-6">

              <span className="text-[9px] font-mono text-slate-500 uppercase">
                P1
              </span>

              <span className="text-sm font-bold font-mono text-red-400">
                {p1Count}
              </span>

            </div>

            {/* P2 */}

            <div className="flex items-center gap-2 pr-6">

              <span className="text-[9px] font-mono text-slate-500 uppercase">
                P2
              </span>

              <span className="text-sm font-bold font-mono text-amber-400">
                {p2Count}
              </span>

            </div>

            {/* DIVIDER */}

            <div className="h-5 w-px bg-tactical-border mr-6" />

            {/* POPULATION */}

            <div className="flex items-center gap-2 pr-6">

              <span className="text-[9px] font-mono text-slate-500 uppercase">
                POP
              </span>

              <span className="text-sm font-bold font-mono text-slate-200">
                {totalPopulation.toLocaleString()}
              </span>

            </div>

            {/* VULNERABLE */}

            <div className="flex items-center gap-2 pr-6">

              <span className="text-[9px] font-mono text-slate-500 uppercase">
                VULNERABLE
              </span>

              <span className="text-sm font-bold font-mono text-red-300">
                {totalVulnerable.toLocaleString()}
              </span>

            </div>

            {/* DIVIDER */}

            <div className="h-5 w-px bg-tactical-border mr-6" />

            {/* SELECTED RISK */}

            <div className="flex items-center gap-2">

              <span className="text-[9px] font-mono text-slate-500 uppercase">
                SELECTED RISK
              </span>

              <span className="text-sm font-bold font-mono text-red-400">
                {selectedRisk}%
              </span>

            </div>

            {/* RISK ENGINE STATUS */}

            <div className="ml-auto flex items-center gap-2">

              <span
                className={`w-2 h-2 rounded-full ${
                  riskApiStatus ===
                  'online'
                    ? 'bg-emerald-400'
                    : riskApiStatus ===
                      'checking'
                    ? 'bg-amber-400'
                    : 'bg-red-400'
                }`}
              />

              <span
                className={`text-[9px] font-mono font-bold uppercase ${
                  riskApiStatus ===
                  'online'
                    ? 'text-emerald-400'
                    : riskApiStatus ===
                      'checking'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {riskApiStatus ===
                'online'
                  ? 'RISK ENGINE CONNECTED'
                  : riskApiStatus ===
                    'checking'
                  ? 'RISK ENGINE CHECKING'
                  : 'RISK ENGINE OFFLINE'}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ACTION BAR
          ===================================================== */}

      <ActionBar
        onSendAlert={() =>
          console.log(
            'TODO: wire to alerts API'
          )
        }
        onAuthorizeDispatch={() =>
          console.log(
            'TODO: wire to dispatch API'
          )
        }
      />

      {/* =====================================================
          DRAWER
          ===================================================== */}

      <Drawer
        activeKey={activeDrawer}
        onClose={() =>
          setActiveDrawer(null)
        }
        title={
          activeDrawer
            ? drawerTitles[
                activeDrawer
              ]
            : ''
        }
      >

        <div className="space-y-3">

          {/* Description */}

          <p className="text-sm text-slate-400">
            Content for the "
            {activeDrawer}" panel
            goes here.
          </p>

          {/* Risk Engine Status */}

          <div className="rounded-lg border border-slate-700 p-3">

            <div className="text-xs uppercase tracking-wide text-slate-500">
              Risk Engine
            </div>

            <div className="mt-1 text-sm">

              {riskApiStatus ===
              'online'
                ? 'ONLINE'
                : riskApiStatus ===
                  'checking'
                ? 'CHECKING'
                : 'OFFLINE'}

            </div>

          </div>

          {/* Risk Loading */}

          {riskLoading && (
            <div className="text-sm text-amber-400">
              Running risk assessment...
            </div>
          )}

          {/* Risk Error */}

          {riskError && (
            <div className="text-sm text-red-400">
              Risk assessment error:{' '}
              {riskError}
            </div>
          )}

          {/* Current Assessment */}

          {riskAssessment?.result && (
            <div className="rounded-lg border border-slate-700 p-3 space-y-2">

              <div className="text-xs uppercase tracking-wide text-slate-500">
                Current Risk Assessment
              </div>

              <div className="text-lg font-bold">
                {
                  riskAssessment
                    .result
                    .risk_score
                }
              </div>

              <div className="text-sm">

                Priority:{' '}

                <span className="font-semibold">
                  {
                    riskAssessment
                      .result
                      .priority
                  }
                </span>

              </div>

              <div className="text-xs text-slate-400">

                Hazard:{' '}

                {
                  riskAssessment
                    .result
                    .hazard_type
                }

              </div>

            </div>
          )}

        </div>

      </Drawer>

    </main>
  )
}

export default App