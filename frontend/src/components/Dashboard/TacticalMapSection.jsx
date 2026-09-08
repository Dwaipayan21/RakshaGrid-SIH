import React from 'react'
import Map from '../Map'
import DisasterAreaStatusLegend from './DisasterAreaStatusLegend'

const TacticalMapSection = ({ hazardZones, selectedZone, onSelectZone, activeHoveredSite }) => {
  return (
    <section
      className="flex-1 flex flex-col rounded-2xl bg-tactical-surface border border-tactical-border shadow-2xl overflow-hidden relative"
      data-purpose="hero-tactical-map"
    >
      {/* Floating Tactical HUD — Tab Switcher Card Only */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-1.5 bg-tactical-card/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-tactical-border shadow-xl"
        >
          {/* Label */}
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-bold text-slate-400 border-r border-tactical-border mr-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping flex-shrink-0" />
            <span className="uppercase tracking-wide whitespace-nowrap">Morigaon Pilot</span>
          </div>

          {/* Zone Tabs */}
          <div className="flex items-center gap-1">
            {hazardZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id
              const isCritical = zone.priorityLevel === 'critical'
              const isHigh = zone.priorityLevel === 'high'

              return (
                <button
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                    isSelected
                      ? isCritical
                        ? 'bg-red-500/90 text-white shadow-md shadow-red-500/30 ring-1 ring-red-400/50'
                        : isHigh
                        ? 'bg-amber-500/90 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50'
                        : 'bg-emerald-500/90 text-slate-950 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="whitespace-nowrap">{zone.name.split(' ')[0]}</span>
                  <span
                    className={`text-[9px] font-mono tabular-nums ${
                      isSelected ? 'opacity-80' : 'text-slate-500'
                    }`}
                  >
                    {zone.compositeRiskScore}
                  </span>
                </button>
              )
            })}
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
        <DisasterAreaStatusLegend />
      </div>
    </section>
  )
}

export default TacticalMapSection
