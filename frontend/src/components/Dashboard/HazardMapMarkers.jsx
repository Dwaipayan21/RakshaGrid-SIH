import React from 'react'
import {
  Marker,
  Popup,
  Circle,
  Polyline,
  Tooltip,
} from 'react-leaflet'

import L from 'leaflet'


// =========================================================
// HAZARD ICON
// =========================================================

const hazardIcon = L.divIcon({
  className: 'hazard-marker',

  html: `
    <div style="
      width:16px;
      height:16px;
      border-radius:50%;
      background:#ef4444;
      border:3px solid rgba(255,255,255,.9);
      box-shadow:0 0 18px rgba(239,68,68,.8);
    "></div>
  `,

  iconSize: [16, 16],
  iconAnchor: [8, 8],
})


// =========================================================
// SETTLEMENT ICON
// =========================================================

const settlementIcon = L.divIcon({
  className: 'settlement-marker',

  html: `
    <div style="
      width:12px;
      height:12px;
      border-radius:50%;
      background:#22d3ee;
      border:2px solid white;
      box-shadow:0 0 12px rgba(34,211,238,.8);
    "></div>
  `,

  iconSize: [12, 12],
  iconAnchor: [6, 6],
})


// =========================================================
// SHELTER ICON
// =========================================================

const shelterIcon = L.divIcon({
  className: 'shelter-marker',

  html: `
    <div style="
      width:15px;
      height:15px;
      border-radius:4px;
      background:#10b981;
      border:2px solid white;
      box-shadow:0 0 12px rgba(16,185,129,.8);
    "></div>
  `,

  iconSize: [15, 15],
  iconAnchor: [7, 7],
})


// =========================================================
// HAZARD MAP MARKERS
// =========================================================

export default function HazardMapMarkers({
  hazardZones = [],

  selectedZone,

  shelters = [],

  activeLayers = {},

  onSelectZone,

  onShelterSelect,

  activeHoveredSite,

  selectedShelter,
}) {


  // =======================================================
  // LAYER VISIBILITY
  // =======================================================

  const showRiskZones =
    Boolean(activeLayers?.riskZones)

  const showSettlements =
    Boolean(activeLayers?.settlements)

  const showShelters =
    Boolean(activeLayers?.shelters)

  const showFloodExtent =
    Boolean(activeLayers?.floodExtent)


  // =======================================================
  // SELECTED ZONE COORDINATES
  //
  // Supports both:
  // lat / lon
  // latitude / longitude
  // =======================================================

  const selectedLat =
    selectedZone?.latitude ??
    selectedZone?.lat

  const selectedLon =
    selectedZone?.longitude ??
    selectedZone?.lon


  return (
    <>

      {/* =================================================
          FLOOD EXTENT

          This is the visual flood-risk extent.
          It is controlled independently by the
          "Flood Extent" layer switch.
          ================================================= */}

      {showFloodExtent &&
        selectedZone &&
        selectedLat != null &&
        selectedLon != null && (
          <>

            {/* Outer flood extent */}

            <Circle
              center={[
                selectedLat,
                selectedLon,
              ]}
              radius={6500}
              pathOptions={{
                color: '#f97316',
                weight: 1.5,
                dashArray: '6 8',
                fillColor: '#f97316',
                fillOpacity: 0.04,
              }}
            />


            {/* Inner flood extent */}

            <Circle
              center={[
                selectedLat,
                selectedLon,
              ]}
              radius={3500}
              pathOptions={{
                color: '#ef4444',
                weight: 2,
                dashArray: '8 8',
                fillColor: '#ef4444',
                fillOpacity: 0.08,
              }}
            />

          </>
        )}


      {/* =================================================
          RISK ZONE

          Controlled by:
          Risk Zones
          ================================================= */}

      {showRiskZones &&
        selectedZone &&
        selectedLat != null &&
        selectedLon != null && (

          <Circle
            center={[
              selectedLat,
              selectedLon,
            ]}
            radius={1800}
            pathOptions={{
              color: '#ef4444',
              weight: 2.5,
              fillColor: '#ef4444',
              fillOpacity: 0.12,
            }}
          />

        )}


      {/* =================================================
          EVACUATION CORRIDORS

          These are ONLY visual guidance lines.

          IMPORTANT:
          They are NOT the OSRM route.

          The actual shortest road route is produced
          by useRoute() + RouteLayer in Map.jsx.
          ================================================= */}

      {showShelters &&
        selectedZone &&
        selectedLat != null &&
        selectedLon != null &&
        shelters
          .filter(
            (shelter) =>
              shelter.status !== 'AT_RISK'
          )
          .map((shelter) => {

            const shelterLat =
              shelter.latitude ??
              shelter.lat

            const shelterLon =
              shelter.longitude ??
              shelter.lon


            if (
              shelterLat == null ||
              shelterLon == null
            ) {
              return null
            }


            return (
              <Polyline
                key={`evacuation-corridor-${shelter.id}`}
                positions={[
                  [
                    selectedLat,
                    selectedLon,
                  ],
                  [
                    shelterLat,
                    shelterLon,
                  ],
                ]}
                pathOptions={{
                  color: '#10b981',
                  weight: 2,
                  opacity: 0.35,
                  dashArray: '6 8',
                }}
              />
            )
          })}


      {/* =================================================
          SHELTERS

          IMPORTANT:
          Clicking a shelter calls onShelterSelect().

          This reconnects the shelter to:

          setSelectedShelter()
                  ↓
              useRoute()
                  ↓
                OSRM
                  ↓
              RouteLayer
          ================================================= */}

      {showShelters &&
        shelters.map((shelter) => {

          const shelterLat =
            shelter.latitude ??
            shelter.lat

          const shelterLon =
            shelter.longitude ??
            shelter.lon


          if (
            shelterLat == null ||
            shelterLon == null
          ) {
            return null
          }


          const isSelected =
            selectedShelter?.id ===
            shelter.id


          return (
            <Marker
              key={`shelter-${shelter.id}`}
              position={[
                shelterLat,
                shelterLon,
              ]}
              icon={shelterIcon}

              eventHandlers={{
                click: () => {
                  onShelterSelect?.(
                    shelter
                  )
                },
              }}
            >

              {/* =================================================
                  SHELTER NAME
                  ================================================= */}

              <Tooltip
                direction="top"
                offset={[
                  0,
                  -8,
                ]}
              >
                {shelter.name}
              </Tooltip>


              {/* =================================================
                  SHELTER POPUP
                  ================================================= */}

              <Popup>

                <div
                  className="
                    text-sm
                    font-sans
                    text-slate-900
                    min-w-[170px]
                  "
                >

                  <strong>
                    {shelter.name}
                  </strong>


                  <div className="mt-2">
                    Capacity:{' '}
                    {shelter.capacity ??
                      '—'}
                  </div>


                  <div>
                    Available:{' '}
                    {shelter.available ??
                      '—'}
                  </div>


                  <div>
                    Status:{' '}
                    {shelter.status ||
                      'OPERATIONAL'}
                  </div>


                  {isSelected && (
                    <div
                      className="
                        mt-2
                        pt-2
                        border-t
                        border-slate-300
                        font-bold
                        text-emerald-700
                      "
                    >
                      ROUTE SELECTED
                    </div>
                  )}

                </div>

              </Popup>

            </Marker>
          )
        })}


      {/* =================================================
          SETTLEMENTS

          These are the existing hazard-zone /
          settlement markers.
          ================================================= */}

      {showSettlements &&
        hazardZones.map((zone) => {

          const zoneLat =
            zone.latitude ??
            zone.lat ??
            zone.coordinates?.[1]

          const zoneLon =
            zone.longitude ??
            zone.lon ??
            zone.lng ??
            zone.coordinates?.[0]


          if (
            zoneLat == null ||
            zoneLon == null
          ) {
            return null
          }


          return (
            <Marker
              key={`settlement-${zone.id}`}
              position={[
                zoneLat,
                zoneLon,
              ]}
              icon={settlementIcon}

              eventHandlers={{
                click: () => {
                  onSelectZone?.(
                    zone
                  )
                },
              }}
            >

              <Tooltip
                direction="top"
              >
                {zone.name}
              </Tooltip>


              <Popup>

                <div
                  className="
                    text-sm
                    font-sans
                    text-slate-900
                    min-w-[170px]
                  "
                >

                  <strong>
                    {zone.name}
                  </strong>


                  <div className="mt-2">
                    Population:{' '}
                    {zone.population != null
                      ? zone.population.toLocaleString()
                      : '—'}
                  </div>


                  <div>
                    Vulnerable:{' '}
                    {zone.vulnerable != null
                      ? zone.vulnerable.toLocaleString()
                      : '—'}
                  </div>


                  <div>
                    Risk:{' '}
                    {zone.compositeRiskScore ??
                      '—'}
                  </div>

                </div>

              </Popup>

            </Marker>
          )
        })}


      {/* =================================================
          SELECTED HAZARD MARKER

          This preserves a distinct red hazard marker
          for the currently selected settlement/zone.
          ================================================= */}

      {showRiskZones &&
        selectedZone &&
        selectedLat != null &&
        selectedLon != null && (

          <Marker
            position={[
              selectedLat,
              selectedLon,
            ]}
            icon={hazardIcon}
            zIndexOffset={1000}
          >

            <Tooltip
              direction="top"
              offset={[
                0,
                -10,
              ]}
            >
              ACTIVE HAZARD ZONE
            </Tooltip>

          </Marker>

        )}

    </>
  )
}
