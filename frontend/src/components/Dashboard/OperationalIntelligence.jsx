import React from 'react'

const priorityStyles = {
  P1: {
    badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    dot: 'bg-red-400',
  },
  P2: {
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
  },
  P3: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  P4: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
}

const getPriority = (score) => {
  if (score >= 0.75) return 'P1'
  if (score >= 0.5) return 'P2'
  if (score >= 0.25) return 'P3'
  return 'P4'
}

const getRiskLabel = (score) => {
  if (score >= 0.75) return 'CRITICAL'
  if (score >= 0.5) return 'HIGH'
  if (score >= 0.25) return 'MODERATE'
  return 'LOW'
}

const getRiskColor = (score) => {
  if (score >= 0.75) return 'text-red-400'
  if (score >= 0.5) return 'text-orange-400'
  if (score >= 0.25) return 'text-amber-400'
  return 'text-emerald-400'
}

const OperationalIntelligence = ({
  hazardZones = [],
  selectedZone,
  riskAssessment,
}) => {
  const selectedScore =
    Number(
      riskAssessment?.result?.risk_score ??
        selectedZone?.compositeRiskScore ??
        0
    ) > 1
      ? Number(
          riskAssessment?.result?.risk_score ??
            selectedZone?.compositeRiskScore ??
            0
        ) / 100
      : Number(
          riskAssessment?.result?.risk_score ??
            selectedZone?.compositeRiskScore ??
            0
        )

  const priority = riskAssessment?.result?.priority || getPriority(selectedScore)

  const sortedZones = [...hazardZones]
    .sort(
      (a, b) =>
        Number(b.compositeRiskScore || 0) -
        Number(a.compositeRiskScore || 0)
    )
    .slice(0, 4)

  const totalPopulation = hazardZones.reduce(
    (sum, zone) => sum + Number(zone.population || 0),
    0
  )

  const totalVulnerable = hazardZones.reduce(
    (sum, zone) => sum + Number(zone.vulnerablePopulation || 0),
    0
  )

  const totalShelters = hazardZones.reduce(
    (sum, zone) => sum + Number(zone.nearbySites?.length || 0),
    0
  )

  const totalAvailableBeds = hazardZones.reduce(
    (sum, zone) =>
      sum +
      Number(
        zone.nearbySites?.reduce(
          (siteSum, site) => siteSum + Number(site.available || 0),
          0
        ) || 0
      ),
    0
  )

  const p1Count = hazardZones.filter(
    (zone) => Number(zone.compositeRiskScore || 0) >= 0.75
  ).length

  const p2Count = hazardZones.filter(
    (zone) =>
      Number(zone.compositeRiskScore || 0) >= 0.5 &&
      Number(zone.compositeRiskScore || 0) < 0.75
  ).length

  const factors = riskAssessment?.result?.factors || {
    hazard: selectedZone?.hazardImpact?.floodFrequency?.value || 0,
    exposure: selectedZone?.population
      ? Math.min(100, selectedZone.population / 100)
      : 0,
    vulnerability: selectedZone?.vulnerablePopulation
      ? Math.min(
          100,
          (selectedZone.vulnerablePopulation /
            Math.max(selectedZone.population, 1)) *
            100
        )
      : 0,
    accessibility: 30,
    capacity: 30,
  }

  const factorRows = [
    ['Hazard', factors.hazard],
    ['Exposure', factors.exposure],
    ['Vulnerability', factors.vulnerability],
    ['Accessibility', factors.accessibility],
    ['Capacity', factors.capacity],
  ]

  const recommendation =
    priority === 'P1'
      ? 'Immediate evacuation preparation required'
      : priority === 'P2'
        ? 'Prepare evacuation resources and monitor'
        : priority === 'P3'
          ? 'Continue monitoring and prepare shelters'
          : 'Routine monitoring'

  return (
    <section className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">

        {/* Intelligence header */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-slate-200">
              Operational Intelligence
            </span>

            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
              PILOT
            </span>
          </div>

          <div className="flex items-center gap-3 text-[9px] font-mono">
            <span className="text-slate-500">
              Decision Support Layer
            </span>

            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              RISK ENGINE ONLINE
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 divide-x divide-slate-800">

          <Metric
            label="P1 Critical"
            value={p1Count}
            accent="text-red-400"
          />

          <Metric
            label="P2 High"
            value={p2Count}
            accent="text-orange-400"
          />

          <Metric
            label="Population"
            value={totalPopulation.toLocaleString()}
            accent="text-white"
          />

          <Metric
            label="Vulnerable"
            value={totalVulnerable.toLocaleString()}
            accent="text-red-300"
          />

          <Metric
            label="Shelters"
            value={totalShelters}
            accent="text-sky-400"
          />

          <Metric
            label="Beds Available"
            value={totalAvailableBeds.toLocaleString()}
            accent="text-emerald-400"
          />

          <Metric
            label="Selected Risk"
            value={`${Math.round(selectedScore * 100)}%`}
            accent={getRiskColor(selectedScore)}
          />

          <Metric
            label="Priority"
            value={priority}
            accent={priorityStyles[priority]?.badge?.includes('red')
              ? 'text-red-400'
              : priority === 'P2'
                ? 'text-orange-400'
                : 'text-amber-400'}
          />

        </div>

        {/* Detail row */}
        <div className="grid xl:grid-cols-[1.1fr_1.3fr_1fr] border-t border-slate-800">

          {/* Priority queue */}
          <div className="p-4 border-b xl:border-b-0 xl:border-r border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
                  Evacuation Priority
                </h3>

                <p className="text-[9px] text-slate-500 mt-0.5">
                  Ranked by current composite risk
                </p>
              </div>

              <span className="text-[9px] font-mono text-slate-500">
                TOP {sortedZones.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {sortedZones.map((zone, index) => {
                const score = Number(zone.compositeRiskScore || 0)
                const p = getPriority(score)
                const style = priorityStyles[p]

                return (
                  <div
                    key={zone.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition ${
                      selectedZone?.id === zone.id
                        ? 'bg-slate-800 border-cyan-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-slate-600 w-4">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                    />

                    <span className="text-[10px] font-mono text-slate-300 truncate flex-1">
                      {zone.name}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-white">
                      {Math.round(score * 100)}%
                    </span>

                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${style.badge}`}
                    >
                      {p}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Why this location */}
          <div className="p-4 border-b xl:border-b-0 xl:border-r border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
                  Why This Location?
                </h3>

                <p className="text-[9px] text-slate-500 mt-0.5">
                  Risk factor contribution
                </p>
              </div>

              <span
                className={`text-[9px] font-mono font-bold ${getRiskColor(
                  selectedScore
                )}`}
              >
                {getRiskLabel(selectedScore)}
              </span>
            </div>

            <div className="space-y-2">
              {factorRows.map(([label, rawValue]) => {
                const value = Math.max(
                  0,
                  Math.min(100, Number(rawValue || 0))
                )

                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px] font-mono text-slate-400">
                        {label}
                      </span>

                      <span className="text-[9px] font-mono font-bold text-slate-300">
                        {Math.round(value)}
                      </span>
                    </div>

                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          value >= 75
                            ? 'bg-red-500'
                            : value >= 50
                              ? 'bg-orange-400'
                              : value >= 25
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Decision support */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
                  Decision Support
                </h3>

                <p className="text-[9px] text-slate-500 mt-0.5">
                  System recommendation
                </p>
              </div>

              <span
                className={`text-[8px] px-1.5 py-0.5 rounded border font-mono font-bold ${
                  priority === 'P1'
                    ? 'bg-red-500/10 text-red-300 border-red-500/20'
                    : priority === 'P2'
                      ? 'bg-orange-500/10 text-orange-300 border-orange-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}
              >
                {priority}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] font-mono font-bold text-white leading-snug">
                    {recommendation}
                  </p>

                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                    Based on current hazard, exposure, vulnerability,
                    accessibility and capacity indicators.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button className="flex-1 px-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[9px] font-mono font-bold text-red-300 transition">
                VIEW PRIORITY
              </button>

              <button className="flex-1 px-2 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-300 transition">
                FIND SHELTER
              </button>
            </div>
          </div>
        </div>

        {/* Data source status */}
        <div className="px-4 py-2 border-t border-slate-800 bg-black/20 flex flex-wrap items-center gap-4">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
            Data Sources
          </span>

          <SourceStatus
            name="Risk Engine"
            status="CONNECTED"
            type="online"
          />

          <SourceStatus
            name="Settlement Data"
            status="PILOT"
            type="pilot"
          />

          <SourceStatus
            name="Shelter Registry"
            status="PILOT"
            type="pilot"
          />

          <SourceStatus
            name="Government Feeds"
            status="PLANNED"
            type="planned"
          />

          <SourceStatus
            name="Satellite / SAR"
            status="PLANNED"
            type="planned"
          />

          <span className="ml-auto text-[8px] font-mono text-slate-600">
            Prototype decision-support interface
          </span>
        </div>
      </div>
    </section>
  )
}

const Metric = ({ label, value, accent }) => (
  <div className="px-3 py-2.5 min-w-0">
    <span className="block text-[8px] font-mono uppercase tracking-wider text-slate-500 truncate">
      {label}
    </span>

    <span
      className={`block mt-0.5 text-sm font-mono font-bold tabular-nums ${accent}`}
    >
      {value}
    </span>
  </div>
)

const SourceStatus = ({ name, status, type }) => {
  const styles = {
    online: 'bg-emerald-400 text-emerald-400',
    pilot: 'bg-amber-400 text-amber-400',
    planned: 'bg-slate-600 text-slate-500',
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${styles[type].split(' ')[0]}`}
      />

      <span className="text-[8px] font-mono text-slate-500">
        {name}
      </span>

      <span
        className={`text-[8px] font-mono font-bold ${styles[type].split(' ')[1]}`}
      >
        {status}
      </span>
    </div>
  )
}

export default OperationalIntelligence