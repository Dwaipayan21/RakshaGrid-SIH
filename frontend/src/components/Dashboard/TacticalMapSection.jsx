import React, { useState } from 'react'
import DisasterAreaStatusLegend from './DisasterAreaStatusLegend'
import Map from '../Map/Map'

const TacticalMapSection = ({
  hazardZones,
  selectedZone,
  onSelectZone,
  activeHoveredSite,
}) => {
  const [layersOpen, setLayersOpen] = useState(false)

  const [mapLayers, setMapLayers] = useState({
    riskZones: true,
    settlements: true,
    shelters: true,
    roadNetwork: false,
    hospitals: false,
    floodExtent: false,
  })

  const toggleLayer = (key) => {
    setMapLayers((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  const activeLayerCount =
    Object.values(mapLayers).filter(Boolean).length

  return (
    <section
      className="flex-1 min-w-0 flex flex-col rounded-2xl bg-tactical-surface border border-tactical-border shadow-2xl overflow-hidden relative"
      data-purpose="hero-tactical-map"
    >
      {/* ============================================================
          TOP LEFT — MORIGAON PILOT ZONE SELECTOR
          ============================================================ */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-tactical-card/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-tactical-border shadow-xl">

          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-bold text-slate-400 border-r border-tactical-border">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />

            <span className="uppercase tracking-wide whitespace-nowrap">
              Morigaon Pilot
            </span>
          </div>

          <div className="flex items-center gap-1">
            {hazardZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id
              const isCritical =
                zone.priorityLevel === 'critical'
              const isHigh =
                zone.priorityLevel === 'high'

              return (
                <button
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                    isSelected
                      ? isCritical
                        ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30 ring-1 ring-red-400/50'
                        : isHigh
                        ? 'bg-amber-500/90 text-slate-950 shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/50'
                        : 'bg-emerald-500/90 text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {zone.name.split(' ')[0]}
                  </span>

                  <span
                    className={`text-[9px] tabular-nums ${
                      isSelected
                        ? 'opacity-80'
                        : 'text-slate-500'
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

      {/* ============================================================
          TOP RIGHT — MAP LAYERS
          ============================================================ */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setLayersOpen((previous) => !previous)
            }
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-600 shadow-2xl hover:border-cyan-400/60 transition"
          >
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3L3 8l9 5 9-5-9-5z"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M3 12l9 5 9-5"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M3 16l9 5 9-5"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
              Layers
            </span>

            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
              {activeLayerCount}
            </span>
          </button>

          {layersOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/98 backdrop-blur-xl border border-slate-600 shadow-2xl overflow-hidden">

              <div className="px-4 py-3 border-b border-slate-800">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
                  Tactical Map Layers
                </div>

                <div className="text-[8px] font-mono text-slate-600 mt-1">
                  Toggle operational GIS information
                </div>
              </div>

              <div className="p-2">
                {[
                  ['riskZones', 'Risk Zones', 'Composite risk classification', 'bg-red-400'],
                  ['settlements', 'Settlements', 'Vulnerable habitations', 'bg-cyan-400'],
                  ['shelters', 'Shelters', 'Evacuation facilities', 'bg-emerald-400'],
                  ['roadNetwork', 'Road Network', 'Evacuation corridors', 'bg-amber-400'],
                  ['hospitals', 'Hospitals', 'Emergency medical facilities', 'bg-pink-400'],
                  ['floodExtent', 'Flood Extent', 'Hazard extent layer', 'bg-blue-400'],
                ].map(([key, label, description, dot]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleLayer(key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 text-left"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${dot} ${
                        mapLayers[key]
                          ? 'opacity-100'
                          : 'opacity-20'
                      }`}
                    />

                    <div className="flex-1">
                      <div
                        className={`text-[10px] font-mono font-bold ${
                          mapLayers[key]
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {label}
                      </div>

                      <div className="text-[8px] text-slate-600">
                        {description}
                      </div>
                    </div>

                    <span
                      className={`w-7 h-4 rounded-full p-0.5 ${
                        mapLayers[key]
                          ? 'bg-cyan-500/30'
                          : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`block w-3 h-3 rounded-full transition-transform ${
                          mapLayers[key]
                            ? 'bg-cyan-400 translate-x-3'
                            : 'bg-slate-600'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-slate-800">
                <span className="text-[8px] font-mono text-slate-600">
                  Additional GIS layers will activate when
                  authoritative data is connected.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          MAP
          ============================================================ */}
      <div
        className="relative w-full h-full"
        id="tactical-map-container"
      >
        <Map
          hazardZones={hazardZones}
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
          activeHoveredSite={activeHoveredSite}
          mapLayers={mapLayers}
        />

        <DisasterAreaStatusLegend />
      </div>
    </section>
  )
}

export default TacticalMapSection