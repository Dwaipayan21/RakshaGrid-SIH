import React, { useState } from 'react'

const initialProtocols = [
  {
    id: 'P-01',
    code: 'SOP-EV-101',
    title: 'Evacuate High-Risk Settlements',
    detail: 'Route 1,120 children & 540 elders to Jagiroad Relief Camp.',
    status: 'ACTIVE',
    tagClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
  },
  {
    id: 'P-02',
    code: 'SOP-AL-204',
    title: 'Cell Broadcast & Flood Siren',
    detail: 'Emergency alert sent to all mobile devices in sector.',
    status: 'DONE',
    tagClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'P-03',
    code: 'SOP-SH-309',
    title: 'Shelter Bed & Supply Audit',
    detail: 'Verify 620 free beds, medical triage & generator fuel.',
    status: 'READY',
    tagClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  {
    id: 'P-04',
    code: 'SOP-MD-402',
    title: 'Post-Surge Medical Triage',
    detail: 'Deploy mobile medical truck MMU-4 for waterborne disease check.',
    status: 'STANDBY',
    tagClass: 'bg-slate-800 text-slate-400 border-slate-700',
  },
]

const HazardDetailPanel = ({
  zone,
  riskAssessment,
  riskLoading,
  riskError,
  activeHoveredSite,
  setActiveHoveredSite = () => {},
}) => {
  const [protocols, setProtocols] = useState(initialProtocols)

  if (!zone) return null
    // Risk Engine result
  const riskResult = riskAssessment?.result

  const liveRiskScore = riskResult?.risk_score ?? null
  const livePriority = riskResult?.priority ?? null
  const liveFactors = riskResult?.factors ?? null

  const displayRiskScore =
    liveRiskScore !== null
      ? (liveRiskScore / 100).toFixed(2)
      : zone.compositeRiskScore

  const displayPriority =
    livePriority ||
    (zone.priorityLevel === 'critical'
      ? 'P1'
      : zone.priorityLevel === 'high'
        ? 'P2'
        : 'P3')

  const enginePriority = riskAssessment?.result?.priority || null
const isCritical =
  enginePriority === 'P1' ||
  (!enginePriority && zone.priorityLevel === 'critical')

const isHigh =
  enginePriority === 'P2' ||
  (!enginePriority && zone.priorityLevel === 'high')

const isMedium =
  enginePriority === 'P3' ||
  (!enginePriority &&
    zone.priorityLevel !== 'critical' &&
    zone.priorityLevel !== 'high')

const priorityLabel = isCritical
  ? 'VERY HIGH'
  : isHigh
    ? 'HIGH'
    : isMedium
      ? 'MEDIUM'
      : 'LOW'

const priorityAction = isCritical
  ? '{priorityAction}'
  : isHigh
    ? '{priorityLabel}'
    : isMedium
      ? 'MONITOR & PREPARE'
      : 'ROUTINE MONITORING'

  const totalRelocationCapacity = zone.nearbySites.reduce((acc, site) => acc + site.available, 0)

  const toggleProtocol = (id) => {
    setProtocols((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'DONE' ? 'ACTIVE' : p.status === 'ACTIVE' ? 'DONE' : 'ACTIVE'
          return {
            ...p,
            status: nextStatus,
            tagClass:
              nextStatus === 'DONE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
          }
        }
        return p
      })
    )
  }

  return (
    <aside
      className="w-[360px] flex flex-col gap-3 shrink-0 z-20 overflow-y-auto max-h-full pr-1"
      data-purpose="live-hazard-detail-panel"
    >
      {/* 1. Header Card & Relocation Priority Banner */}
      <div className="rounded-2xl bg-tactical-surface border border-tactical-border p-5 flex flex-col justify-between shadow-xl relative overflow-hidden shrink-0">
        <div
          className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
            isCritical ? 'bg-red-500/20' : isHigh ? 'bg-amber-500/20' : 'bg-emerald-500/20'
          }`}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
              {zone.district} District • Morigaon Pilot
            </span>
            <span className="text-[11px] font-mono text-slate-400">{zone.areaSqKm} km² Area</span>
          </div>

          <h2 className="text-2xl font-black text-white leading-tight">{zone.name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{zone.subtitle}</p>

          {/* Relocation Priority Badge Banner */}
          <div
            className={`mt-3 px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-mono font-extrabold tracking-wide ${
              isCritical
                ? 'bg-red-950/80 border-red-500/50 text-red-200 glow-crimson animate-pulse'
                : isHigh
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 glow-amber'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 glow-emerald'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCritical ? 'bg-red-400' : isHigh ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span>{zone.relocationPriority}</span>
            </div>
            <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
              {zone.hazardSeverity}
            </span>
          </div>

          {/* Demographics & Vulnerability Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-tactical-card border border-tactical-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Population</span>
              <span className="text-lg font-bold text-white tracking-tight">{zone.population.toLocaleString()}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30">
              <span className="text-[10px] text-red-300 uppercase tracking-wider block font-bold">Vulnerable Settlers</span>
              <span className="text-lg font-bold text-red-400 tracking-tight">
                {zone.vulnerablePopulation.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-tactical-card border border-tactical-border">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                <span>Children</span>
                <span className="text-sky-400 font-bold">{zone.children}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase mt-1">
                <span>Elderly</span>
                <span className="text-amber-400 font-bold">{zone.elderly}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-tactical-card border border-tactical-border flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase">
                  Composite Risk
                </span>
                {riskLoading && (
                  <span className="text-[9px] text-sky-400 animate-pulse">
                    ANALYZING
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-extrabold text-amber-400">
                  {riskAssessment?.result?.risk_score != null
                  ? (riskAssessment.result.risk_score / 100).toFixed(2)
                  : zone.compositeRiskScore}
                </span>
                <span className="text-[10px] text-slate-400">
                    / 1.0
                </span>
              </div>
              {riskError && (
                <span className="text-[9px] text-red-400 mt-1">
                  Risk Engine unavailable
                </span>
              )}
            </div>
          </div>

          {/* Risk Gauge Bar */}
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="text-slate-400">Historical Incidents (1998-2023)</span>
              <span className="text-red-400 font-bold">{zone.pastIncidents} Incidents Logged</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-1.5 rounded-full glow-crimson"
                style={{ width: `${Math.min(zone.pastIncidents * 12, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hazard Impact Breakdown Card */}
      <div className="rounded-2xl bg-tactical-surface border border-tactical-border p-4 shadow-xl shrink-0">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
          <span>Hazard Impact Factors</span>
          <span className="text-[10px] text-slate-500 font-normal">NRSC Atlas Data</span>
        </h3>

        <div className="space-y-3 font-mono">
          {Object.entries(zone.hazardImpact).map(([key, item]) => {
            const isHighRisk = item.value >= 70
            const isLowCap = key === 'soilDrainage' && item.value <= 30

            return (
              <div key={key} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">{item.label}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-200 font-bold">{item.value}%</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        isHighRisk || isLowCap
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isHighRisk || isLowCap ? 'bg-red-500 glow-crimson' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Nearby Relocation Sites & Safe Shelters */}
      <div className="rounded-2xl bg-tactical-surface border border-tactical-border p-4 shadow-xl shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Nearby Relocation Sites
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {zone.nearbySites.length} Designated Evacuation Shelters
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            {totalRelocationCapacity} Free Beds
          </span>
        </div>

        <div className="space-y-2.5">
          {zone.nearbySites.map((site, index) => {
            const occupied = site.total - site.available
            const freePct = Math.round((site.available / site.total) * 100)
            const isHovered = activeHoveredSite?.name === site.name

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveHoveredSite(site)}
                onMouseLeave={() => setActiveHoveredSite(null)}
                className={`p-3 rounded-xl border transition cursor-pointer font-mono ${
                  isHovered
                    ? 'bg-tactical-cardHover border-cyan-400 shadow-md glow-cyan'
                    : 'bg-tactical-card border-tactical-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{site.name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{site.tag}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      site.suitability === 'High'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {site.suitability} Suitability
                  </span>
                </div>

                {/* Bed capacity progress bar */}
                <div className="mt-2 text-[10px] flex items-center justify-between text-slate-300">
                  <span>Available Beds:</span>
                  <span className="font-bold text-emerald-400">
                    {site.available} / {site.total} ({freePct}% Ready)
                  </span>
                </div>
                <div className="mt-1 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                  <div
                    className="bg-slate-600 h-1.5"
                    style={{ width: `${100 - freePct}%` }}
                    title={`${occupied} Occupied`}
                  />
                  <div
                    className="bg-emerald-500 h-1.5 glow-emerald"
                    style={{ width: `${freePct}%` }}
                    title={`${site.available} Available`}
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{site.distanceKm} km</span>
                  </span>
                  <span className="flex items-center space-x-1 text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>ETA {site.etaMin} mins</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Priority Tier */}
      <div
        className="bg-tactical-surface border border-tactical-border p-3.5 rounded-2xl shadow-lg shrink-0"
        data-purpose="priority-tier-panel"
      >
        {(() => {
          const villageName = zone.name.split(' ')[0]
          const priorityByVillage = {
            Bhuragaon: {
              label: 'P1 Immediate',
              color: 'text-red-400',
              border: 'border-red-500/30',
            },
            Mayong: {
              label: 'P2 Prepare',
              color: 'text-amber-400',
              border: 'border-amber-500/30',
            },
            Laharighat: {
              label: 'P3 Monitor',
              color: 'text-emerald-400',
              border: 'border-emerald-500/30',
            },
          }
          const priority = priorityByVillage[villageName] || {
            label: 'Unassigned',
            color: 'text-slate-400',
            border: 'border-tactical-border',
          }

          return (
            <div className={`rounded-xl bg-tactical-card border ${priority.border} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Priority Tier
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {villageName}
                </span>
              </div>
              <div className={`mt-1 text-xl font-mono font-extrabold ${priority.color}`}>
                {priority.label}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase">Risk Score</span>
                <span className={`font-bold ${priority.color}`}>
                  {Number(zone.compositeRiskScore).toFixed(2)} / 1.0
                </span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* 5. Action Protocols Segment (Directly Below Elev, Route, Supp Deck) */}
      <div className="rounded-2xl bg-tactical-surface border border-tactical-border p-4 shadow-xl shrink-0 font-mono">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Execution Protocols
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            SOP Standard
          </span>
        </div>

        <div className="space-y-2">
          {protocols.map((p) => (
            <div
              key={p.id}
              onClick={() => toggleProtocol(p.id)}
              className="p-2.5 rounded-xl bg-tactical-card border border-tactical-border hover:border-slate-600 transition cursor-pointer flex items-start justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400">{p.code}</span>
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.detail}</p>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ml-2 ${p.tagClass}`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default HazardDetailPanel
