import React from 'react'
import { Marker, Popup, Circle, Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet'

// Create custom L.divIcon for hazard zones with pulse animation
const createHazardIcon = (zone, isSelected) => {
  const isCritical = zone.priorityLevel === 'critical'
  const isHigh = zone.priorityLevel === 'high'

  const colorClass = isCritical
    ? 'bg-red-500 text-red-100 border-red-300 shadow-red-500/50'
    : isHigh
    ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-amber-500/50'
    : 'bg-emerald-500 text-emerald-950 border-emerald-300 shadow-emerald-500/50'

  const pulseClass = isSelected
    ? isCritical
      ? 'animate-ping opacity-75 bg-red-500'
      : isHigh
      ? 'animate-ping opacity-75 bg-amber-500'
      : 'animate-ping opacity-75 bg-emerald-400'
    : ''

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${
        isSelected
          ? `<div class="absolute -inset-3 rounded-full ${pulseClass} opacity-60"></div>`
          : ''
      }
      <div class="relative z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border-2 ${colorClass} shadow-lg font-mono text-xs font-bold transition-all duration-300 transform ${
    isSelected ? 'scale-110 ring-4 ring-white/30' : 'hover:scale-105'
  }">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span class="truncate max-w-[110px]">${zone.name.split(' ')[0]}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-hazard-marker',
    iconSize: [120, 36],
    iconAnchor: [60, 18],
  })
}

// Create custom L.divIcon for Relocation / Shelter Sites
const createShelterIcon = (site, isHovered) => {
  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      <div class="relative z-10 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-emerald-400 border border-emerald-500/50 shadow-md font-mono text-[11px] font-semibold hover:bg-slate-800 transition">
        <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="truncate max-w-[100px]">${site.name.split(' ')[0]}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-shelter-marker',
    iconSize: [110, 30],
    iconAnchor: [55, 15],
  })
}

const HazardMapMarkers = ({ hazardZones, selectedZone, onSelectZone, activeHoveredSite }) => {
  if (!hazardZones || hazardZones.length === 0) return null

  return (
    <>
      {/* 1. Selected Hazard Circle Danger Area Perimeter */}
      {selectedZone && (
        <>
          <Circle
            center={[selectedZone.lat, selectedZone.lon]}
            radius={3500}
            pathOptions={{
              color: selectedZone.priorityLevel === 'critical' ? '#ef4444' : '#f59e0b',
              fillColor: selectedZone.priorityLevel === 'critical' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.18,
              weight: 2,
              dashArray: '6, 8',
            }}
          />
          <Circle
            center={[selectedZone.lat, selectedZone.lon]}
            radius={6500}
            pathOptions={{
              color: selectedZone.priorityLevel === 'critical' ? '#dc2626' : '#d97706',
              fillColor: selectedZone.priorityLevel === 'critical' ? '#991b1b' : '#78350f',
              fillOpacity: 0.08,
              weight: 1,
              dashArray: '3, 6',
            }}
          />
        </>
      )}

      {/* 2. Evacuation Polylines between active hazard zone and nearby relocation sites */}
      {selectedZone &&
        selectedZone.nearbySites.map((site, index) => {
          const isHighlighted = activeHoveredSite && activeHoveredSite.name === site.name
          return (
            <Polyline
              key={`polyline-${selectedZone.id}-${index}`}
              positions={[
                [selectedZone.lat, selectedZone.lon],
                [site.lat, site.lon],
              ]}
              pathOptions={{
                color: isHighlighted ? '#00f0ff' : '#10b981',
                weight: isHighlighted ? 4 : 2.5,
                dashArray: '8, 8',
                opacity: isHighlighted ? 0.95 : 0.7,
              }}
            >
              <Tooltip sticky permanent={false} className="custom-tooltip">
                <span className="font-mono text-xs text-slate-200">
                  {site.name} • {site.distanceKm} km ({site.etaMin} min)
                </span>
              </Tooltip>
            </Polyline>
          )
        })}

      {/* 3. Nearby Shelter / Relocation Markers for Active Zone */}
      {selectedZone &&
        selectedZone.nearbySites.map((site, index) => (
          <Marker
            key={`shelter-${site.name}-${index}`}
            position={[site.lat, site.lon]}
            icon={createShelterIcon(site, activeHoveredSite?.name === site.name)}
          >
            <Popup>
              <div className="p-1 min-w-[200px] text-slate-900">
                <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{site.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                    {site.suitability}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-mono">
                  <p className="flex justify-between">
                    <span>Distance:</span> <strong className="text-slate-800">{site.distanceKm} km</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>ETA:</span> <strong className="text-slate-800">{site.etaMin} mins</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Free Capacity:</span>{' '}
                    <strong className="text-emerald-700">
                      {site.available} / {site.total} beds
                    </strong>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* 4. Hazard Zone Markers for Morigaon District */}
      {hazardZones.map((zone) => {
        const isSelected = selectedZone?.id === zone.id
        return (
          <Marker
            key={`hazard-${zone.id}`}
            position={[zone.lat, zone.lon]}
            icon={createHazardIcon(zone, isSelected)}
            eventHandlers={{
              click: () => onSelectZone(zone),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[220px] text-slate-900">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{zone.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{zone.district} District</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold font-mono ${
                      zone.priorityLevel === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : zone.priorityLevel === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {zone.hazardSeverity}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Population:</span>
                    <strong>{zone.population.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Vulnerable:</span>
                    <span>{zone.vulnerablePopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Children / Elderly:</span>
                    <span>{zone.children} / {zone.elderly}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Composite Risk:</span>
                    <strong className="text-amber-600">{zone.compositeRiskScore} / 1.0</strong>
                  </div>
                </div>

                <button
                  onClick={() => onSelectZone(zone)}
                  className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold py-1.5 px-3 rounded transition"
                >
                  Zoom & Inspect Sector →
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

export default HazardMapMarkers
