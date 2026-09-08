import React from 'react'
import { Marker, Popup, Circle, Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet'

// Creates a GIS-style location pin using Lucide's MapPin SVG path + plain colored text.
// Absolutely NO card, border, background, or box around the name.
const createHazardIcon = (zone, isSelected) => {
  const isCritical = zone.priorityLevel === 'critical'
  const isHigh = zone.priorityLevel === 'high'

  // Danger-intensity color hex values
  const pinColor = isCritical ? '#f87171'   // red-400
    : isHigh                  ? '#fb923c'   // orange-400
    :                           '#34d399'   // emerald-400

  const displayName = zone.name.split(' ')[0]

  // Lucide MapPin SVG paths (identical to <MapPin> from lucide-react)
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="14" height="14"
         viewBox="0 0 24 24"
         fill="${pinColor}"
         stroke="${pinColor}"
         stroke-width="1"
         stroke-linecap="round"
         stroke-linejoin="round"
         style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.9));flex-shrink:0;margin-top:1px;">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
    </svg>
  `

  // Plain text — NO wrapping div with background/border
  const html = `
    <div style="
      display:inline-flex;
      align-items:center;
      gap:3px;
      cursor:pointer;
      transition:filter 0.15s ease, transform 0.15s ease;
    "
    onmouseover="this.style.filter='brightness(1.35)';this.style.transform='scale(1.08)'"
    onmouseout="this.style.filter='';this.style.transform=''">
      ${pinSvg}
      <span style="
        font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
        font-size:11px;
        font-weight:${isSelected ? '800' : '700'};
        color:${pinColor};
        white-space:nowrap;
        text-shadow:0 1px 4px rgba(0,0,0,0.95),0 0 8px rgba(0,0,0,0.85);
        letter-spacing:0.02em;
      ">${displayName}</span>
    </div>
  `

  return L.divIcon({
    html,
    className: 'gis-pin-marker',
    iconSize: [100, 18],
    iconAnchor: [7, 14],   // tip of the pin sits at the coordinate
  })
}

// Creates a plain GIS location pin for Relocation / Shelter Sites (green, no card/background)
const createShelterIcon = (site, isHovered) => {
  const pinColor = isHovered ? '#6ee7b7' : '#34d399'  // emerald-300 on hover, emerald-400 default
  const displayName = site.name.split(' ')[0]

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="12" height="12"
         viewBox="0 0 24 24"
         fill="${pinColor}"
         stroke="${pinColor}"
         stroke-width="1"
         stroke-linecap="round"
         stroke-linejoin="round"
         style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.9));flex-shrink:0;margin-top:1px;">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
    </svg>
  `

  const html = `
    <div style="
      display:inline-flex;
      align-items:center;
      gap:3px;
      cursor:pointer;
      transition:filter 0.15s ease, transform 0.15s ease;
    "
    onmouseover="this.style.filter='brightness(1.35)';this.style.transform='scale(1.08)'"
    onmouseout="this.style.filter='';this.style.transform=''">
      ${pinSvg}
      <span style="
        font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
        font-size:10px;
        font-weight:600;
        color:${pinColor};
        white-space:nowrap;
        text-shadow:0 1px 4px rgba(0,0,0,0.95),0 0 8px rgba(0,0,0,0.85);
        letter-spacing:0.02em;
      ">${displayName}</span>
    </div>
  `

  return L.divIcon({
    html,
    className: 'gis-pin-marker',
    iconSize: [90, 16],
    iconAnchor: [6, 12],
  })
}

const HazardMapMarkers = ({ hazardZones, selectedZone, onSelectZone, activeHoveredSite }) => {
  if (!hazardZones || hazardZones.length === 0) return null

  // Filter out duplicate shelter sites that overlap with existing hazard sector names (Mayong, Laharighat)
  const filteredNearbySites = selectedZone?.nearbySites
    ? selectedZone.nearbySites.filter((site) => {
        const siteLower = site.name.toLowerCase()
        // Ignore duplicate shelter cards for Mayong and Laharighat
        return !siteLower.includes('mayong') && !siteLower.includes('laharighat')
      })
    : []

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

      {/* 2. Evacuation Polylines between active hazard zone and distinct relocation sites */}
      {selectedZone &&
        filteredNearbySites.map((site, index) => {
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

      {/* 3. Distinct Relief Camps / Shelters (no duplicate cards for Mayong/Laharighat) */}
      {selectedZone &&
        filteredNearbySites.map((site, index) => (
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

      {/* 4. Hazard / Settlement Zone Markers — no popup card, click triggers zone selection */}
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
          />
        )
      })}
    </>
  )
}

export default HazardMapMarkers
