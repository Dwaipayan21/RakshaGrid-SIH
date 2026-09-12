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
// HAZARD COLOR
// =========================================================

const getHazardColor = (riskScore) => {
  if (riskScore > 0.8) {
    return {
      fill: '#ef4444',
      glow: 'rgba(239,68,68,.8)',
    }
  }

  if (riskScore >= 0.5) {
    return {
      fill: '#f59e0b',
      glow: 'rgba(245,158,11,.8)',
    }
  }

  return {
    fill: '#22c55e',
    glow: 'rgba(34,197,94,.8)',
  }
}


// =========================================================
// HAZARD ICON
// =========================================================

const createHazardIcon = ({ fill, glow }) =>
  L.divIcon({
    className: 'hazard-marker',

    html: `
      <div style="
        width:16px;
        height:16px;
        border-radius:50%;
        background:${fill};
        border:3px solid rgba(255,255,255,.9);
        box-shadow:0 0 18px ${glow};
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
// EVACUATION CENTER ICON
//
// NEW MARKER
//
// Teal circular marker + white house icon.
// =========================================================

const shelterIcon = L.divIcon({
  className: 'rakshagrid-evacuation-marker',

  html: `
    <div class="evacuation-marker-wrapper">

      <div class="evacuation-marker-icon">

        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          <!-- Roof -->

          <path
            d="M3 11.5L12 4L21 11.5"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />


          <!-- House -->

          <path
            d="M5 10.5V20H19V10.5"
            stroke="white"
            stroke-width="2"
            stroke-linejoin="round"
          />


          <!-- Door -->

          <path
            d="M9 20V14H15V20"
            stroke="white"
            stroke-width="2"
            stroke-linejoin="round"
          />

        </svg>

      </div>

    </div>
  `,

  iconSize: [46, 46],

  iconAnchor: [23, 23],

  popupAnchor: [0, -25],
})


// =========================================================
// HAZARD MAP MARKERS
// =========================================================

export default function HazardMapMarkers({

  hazardZones = [],

  selectedZone,

  shelters = [],

  activeLayers = {},

  // Backward compatibility with Map.jsx

  showRiskZones: showRiskZonesProp,

  showSettlements: showSettlementsProp,

  showShelters: showSheltersProp,

  showFloodExtent: showFloodExtentProp,

  onSelectZone,

  onShelterSelect,

  activeHoveredSite,

  selectedShelter,

}) {


  // =======================================================
  // LAYER VISIBILITY
  // =======================================================

  const showRiskZones =
    activeLayers?.riskZones != null
      ? Boolean(activeLayers.riskZones)
      : Boolean(showRiskZonesProp)


  const showSettlements =
    activeLayers?.settlements != null
      ? Boolean(activeLayers.settlements)
      : Boolean(showSettlementsProp)


  const showShelters =
    activeLayers?.shelters != null
      ? Boolean(activeLayers.shelters)
      : Boolean(showSheltersProp)


  const showFloodExtent =
    activeLayers?.floodExtent != null
      ? Boolean(activeLayers.floodExtent)
      : Boolean(showFloodExtentProp)


  // =======================================================
  // SELECTED ZONE COORDINATES
  // =======================================================

  const selectedLat =
    selectedZone?.latitude ??
    selectedZone?.lat


  const selectedLon =
    selectedZone?.longitude ??
    selectedZone?.lon


  // =======================================================
  // SELECTED HAZARD COLOR
  // =======================================================

  const selectedHazardColor =
    getHazardColor(
      Number(
        selectedZone?.compositeRiskScore ?? 0
      )
    )


  // =======================================================
  // ORIGINAL SHELTER DATA
  //
  // IMPORTANT:
  //
  // The original RakshaGrid shelter information is stored
  // inside:
  //
  // selectedZone.nearbySites
  //
  // Each site contains:
  //
  // site.total
  // site.available
  //
  // Therefore:
  //
  // occupied = total - available
  //
  // We use the shelter coordinates from shelters.js but
  // the CAPACITY DATA from nearbySites.
  // =======================================================

  const originalShelterSites =
    Array.isArray(
      selectedZone?.nearbySites
    )
      ? selectedZone.nearbySites
      : []


  return (
    <>


      {/* =================================================
          FLOOD EXTENT
          ================================================= */}

      {showFloodExtent &&
        selectedZone &&
        selectedLat != null &&
        selectedLon != null && (

          <>


            {/* OUTER FLOOD EXTENT */}

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


            {/* INNER FLOOD EXTENT */}

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
              color:
                selectedHazardColor.fill,

              weight: 2.5,

              dashArray: '8 8',

              fillColor:
                selectedHazardColor.fill,

              fillOpacity: 0.12,
            }}
          />

        )}


      {/* =================================================
          EVACUATION CORRIDORS
          
          VISUAL GUIDANCE ONLY.

          Actual routing is handled by:
          
          onShelterSelect()
                ↓
          selectedShelter
                ↓
             useRoute()
                ↓
               OSRM
                ↓
            RouteLayer
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

                key={
                  `evacuation-corridor-${shelter.id}`
                }

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
          EVACUATION CENTERS
          
          IMPORTANT:
          
          MARKERS = shelters.js coordinates
          
          CAPACITY DATA = selectedZone.nearbySites
          
          This keeps the original numbers.
          ================================================= */}

      {showShelters &&

        shelters.map(
          (shelter, shelterIndex) => {

            // =================================================
            // SHELTER COORDINATES
            // =================================================

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


            // =================================================
            // ORIGINAL NEARBY SITE
            //
            // The original dashboard uses nearbySites[index].
            //
            // Therefore we match the marker to the original
            // site by index.
            // =================================================

            const originalSite =
              originalShelterSites[
                shelterIndex
              ]


            // =================================================
            // DISPLAY NAME
            //
            // Prefer original nearby-site name.
            // Fall back to shelter.js name.
            // =================================================

            const displayName =
              originalSite?.name ??
              shelter.name ??
              'Evacuation Center'


            // =================================================
            // SELECTED SHELTER
            // =================================================

            const isSelected =
              selectedShelter?.id ===
              shelter.id


            // =================================================
            // ORIGINAL CAPACITY
            //
            // IMPORTANT:
            //
            // Use site.total from the original data.
            //
            // Do NOT default this to 0 when original data
            // exists.
            // =================================================

            const capacityValue =
              originalSite?.total ??
              originalSite?.capacity ??
              shelter.total ??
              shelter.capacity ??
              shelter.totalCapacity


            const capacity =
              Number(
                capacityValue ?? 0
              )


            // =================================================
            // ORIGINAL AVAILABLE
            //
            // This is the ACTUAL remaining capacity from
            // nearbySites.
            // =================================================

            const availableValue =
              originalSite?.available ??
              shelter.available ??
              shelter.remaining ??
              shelter.remainingCapacity


            const available =
              Number(
                availableValue ?? 0
              )


            // =================================================
            // OCCUPIED
            //
            // Original project logic:
            //
            // occupied = total - available
            // =================================================

            const occupied =
              Math.max(
                capacity - available,
                0
              )


            // =================================================
            // OCCUPANCY %
            // =================================================

            const occupancyPercent =
              capacity > 0
                ? Math.round(
                    (occupied /
                      capacity) *
                      100
                  )
                : 0


            // =================================================
            // SAFE DISPLAY VALUES
            //
            // Prevent impossible percentages.
            // =================================================

            const safeOccupancyPercent =
              Math.min(
                Math.max(
                  occupancyPercent,
                  0
                ),
                100
              )


            return (

              <Marker

                key={
                  `shelter-${shelter.id ?? shelterIndex}`
                }

                position={[
                  shelterLat,
                  shelterLon,
                ]}

                icon={shelterIcon}


                eventHandlers={{
                  click: () => {

                    // Pass the original shelter object
                    // while retaining its map coordinates.

                    onShelterSelect?.(
                      {
                        ...shelter,

                        name: displayName,

                        total:
                          originalSite?.total ??
                          shelter.total,

                        capacity,

                        available,

                        occupied,

                      }
                    )

                  },
                }}


                zIndexOffset={
                  isSelected
                    ? 800
                    : 500
                }

              >


                {/* =================================================
                    PERMANENT SHELTER LABEL
                    ================================================= */}

                <Tooltip

                  permanent

                  direction="right"

                  offset={[
                    18,
                    0,
                  ]}

                  className="
                    rakshagrid-shelter-label
                  "

                >

                  <div
                    className="
                      shelter-map-label
                    "
                  >


                    {/* SHELTER NAME */}

                    <div
                      className="
                        shelter-map-name
                      "
                    >

                      {displayName}

                    </div>


                    {/* TYPE */}

                    <div
                      className="
                        shelter-map-type
                      "
                    >

                      EVACUATION CENTER

                    </div>


                    {/* OCCUPIED / CAPACITY */}

                    <div
                      className="
                        shelter-map-capacity
                      "
                    >

                      {occupied}
                      {' '}
                      /
                      {' '}
                      {capacity}

                    </div>


                  </div>

                </Tooltip>


                {/* =================================================
                    SHELTER POPUP
                    ================================================= */}

                <Popup

                  className="
                    rakshagrid-shelter-popup
                  "

                >

                  <div
                    className="
                      shelter-popup
                    "
                  >


                    {/* =================================================
                        HEADER
                        ================================================= */}

                    <div
                      className="
                        shelter-popup-header
                      "
                    >


                      <div
                        className="
                          shelter-popup-icon
                        "
                      >

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >

                          <path
                            d="M3 11.5L12 4L21 11.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M5 10.5V20H19V10.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M9 20V14H15V20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />

                        </svg>

                      </div>


                      <div>

                        <div
                          className="
                            shelter-popup-title
                          "
                        >

                          {displayName}

                        </div>


                        <div
                          className="
                            shelter-popup-subtitle
                          "
                        >

                          EVACUATION CENTER

                        </div>

                      </div>


                    </div>


                    {/* =================================================
                        CAPACITY INFORMATION
                        ================================================= */}

                    <div
                      className="
                        shelter-popup-capacity
                      "
                    >


                      {/* OCCUPIED */}

                      <div>

                        <span>
                          OCCUPIED
                        </span>

                        <strong>
                          {occupied}
                        </strong>

                      </div>


                      {/* CAPACITY */}

                      <div>

                        <span>
                          CAPACITY
                        </span>

                        <strong>
                          {capacity}
                        </strong>

                      </div>


                      {/* AVAILABLE */}

                      <div>

                        <span>
                          AVAILABLE
                        </span>

                        <strong>
                          {available}
                        </strong>

                      </div>


                    </div>


                    {/* =================================================
                        OCCUPANCY BAR
                        ================================================= */}

                    <div
                      className="
                        shelter-popup-progress
                      "
                    >

                      <div

                        className="
                          shelter-popup-progress-fill
                        "

                        style={{
                          width:
                            `${safeOccupancyPercent}%`,
                        }}

                      />

                    </div>


                    {/* =================================================
                        FOOTER
                        ================================================= */}

                    <div
                      className="
                        shelter-popup-footer
                      "
                    >

                      <span>

                        {safeOccupancyPercent}%
                        {' '}
                        occupied

                      </span>


                      <span>

                        {available}
                        {' '}
                        spaces available

                      </span>

                    </div>


                    {/* =================================================
                        SELECTED SHELTER
                        ================================================= */}

                    {isSelected && (

                      <div
                        className="
                          shelter-popup-selected
                        "
                      >

                        ROUTE SELECTED

                      </div>

                    )}


                  </div>

                </Popup>


              </Marker>

            )

          }

        )}


      {/* =================================================
          SETTLEMENTS
          ================================================= */}

      {showSettlements &&

        hazardZones.map(
          (zone) => {

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

                key={
                  `settlement-${zone.id}`
                }

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

                      {zone.vulnerablePopulation != null
                        ? zone.vulnerablePopulation.toLocaleString()
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

          }

        )}


      {/* =================================================
          SELECTED HAZARD MARKER
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

            icon={
              createHazardIcon(
                selectedHazardColor
              )
            }

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