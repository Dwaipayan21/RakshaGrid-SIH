import React from 'react'
import Map from '../Map'

const TacticalMapSection = ({ hazardZones, selectedZone, onSelectZone, activeHoveredSite }) => {
  return (
    <section
      className="flex-1 flex flex-col rounded-2xl bg-tactical-surface border border-tactical-border shadow-2xl overflow-hidden relative"
      data-purpose="hero-tactical-map"
    >
      {/* Floating Tactical Disaster HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Revenue Circle Quick Selector Pills */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-tactical-card/90 backdrop-blur-md p-1.5 rounded-xl border border-tactical-border shadow-lg">
          <div className="flex items-center space-x-2 px-2.5 py-1 text-xs font-mono font-bold text-slate-300 border-r border-tactical-border">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Morigaon Pilot:</span>
          </div>

          <div className="flex items-center space-x-1">
            {hazardZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id
              const isCritical = zone.priorityLevel === 'critical'
              const isHigh = zone.priorityLevel === 'high'

              return (
                <button
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? isCritical
                        ? 'bg-red-500 text-white shadow-md glow-crimson'
                        : isHigh
                        ? 'bg-amber-500 text-slate-950 shadow-md glow-amber'
                        : 'bg-emerald-500 text-slate-950 shadow-md glow-emerald'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  <span>{zone.name.split(' ')[0]}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-black/30 text-white' : 'text-slate-400'
                    }`}
                  >
                    {zone.compositeRiskScore}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Live Surge & Hazard Status Warning Pill */}
        <div className="pointer-events-auto flex items-center space-x-3 bg-red-950/85 backdrop-blur-md border border-red-500/50 px-3.5 py-2 rounded-xl text-red-200 text-xs font-mono glow-crimson shadow-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold tracking-wider uppercase text-[11px]">ACTIVE SECTOR:</span>
            <span className="font-extrabold text-white text-xs tracking-wider uppercase">
              {selectedZone ? selectedZone.name : 'Morigaon District'}
            </span>
          </div>
        </div>
      </div>

      {/* Leaflet Tactical Map */}
      <div className="relative w-full h-full" id="tactical-map-container">
        <Map
          hazardZones={hazardZones}
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
          activeHoveredSite={activeHoveredSite}
        />
      </div>
    </section>
  )
}

export default TacticalMapSection
