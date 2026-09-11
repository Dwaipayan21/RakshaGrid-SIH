import React, {
  useMemo,
  useState,
  useEffect,
} from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import HazardMapMarkers from '../Dashboard/HazardMapMarkers'

import AssamDistrictLayer from './AssamDistrictLayer'

import useRoute from '../../hooks/useRoute'

import RouteLayer from './RouteLayer'

import shelters from '../../data/shelters'


const Map = ({
  hazardZones,
  selectedZone,
  onSelectZone,
  activeHoveredSite,
  mapLayers = {
    riskZones: true,
    settlements: true,
    shelters: true,
    roadNetwork: false,
    hospitals: false,
    floodExtent: false,
  },
}) => {

  const [
    selectedShelter,
    setSelectedShelter,
  ] = useState(null)


  // Clear selected shelter if Shelters layer is toggled off
  useEffect(() => {
    if (!mapLayers?.shelters) {
      setSelectedShelter(null)
    }
  }, [mapLayers?.shelters])


  // =========================================================
  // SELECTED HAZARD COORDINATES
  // =========================================================

  const hazardLat =
    selectedZone?.latitude ??
    selectedZone?.lat ??
    selectedZone?.coordinates?.[1]


  const hazardLon =
    selectedZone?.longitude ??
    selectedZone?.lon ??
    selectedZone?.lng ??
    selectedZone?.coordinates?.[0]


  // =========================================================
  // ROUTE START
  // =========================================================

  const routeStart = useMemo(() => {

    if (
      hazardLat == null ||
      hazardLon == null
    ) {
      return null
    }

    return [
      hazardLat,
      hazardLon,
    ]

  }, [
    hazardLat,
    hazardLon,
  ])


  // =========================================================
  // ROUTE END
  // =========================================================

  const routeEnd = useMemo(() => {

    if (!selectedShelter) {
      return null
    }

    return [
      selectedShelter.latitude,
      selectedShelter.longitude,
    ]

  }, [
    selectedShelter,
  ])


  // =========================================================
  // ROUTE ENGINE
  // =========================================================

  const {
    route,
    loading,
    error,
  } = useRoute(
    routeStart,
    routeEnd
  )


  // =========================================================
  // MAP CENTER
  // =========================================================

  const center = [
    hazardLat ?? 26.35,
    hazardLon ?? 92.27,
  ]


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        rounded-2xl
      "
    >

      {/* =====================================================
          LEAFLET POPUP PRIORITY
          Keeps evacuation-center details above map controls
          and the Morigaon pilot selector.
          ===================================================== */}

      <style>
        {`
          .leaflet-popup-pane {
            z-index: 2000 !important;
          }

          .leaflet-popup {
            z-index: 2000 !important;
          }

          .leaflet-popup-content-wrapper {
            z-index: 2000 !important;
          }

          .leaflet-popup-tip {
            z-index: 2000 !important;
          }
        `}
      </style>


      <MapContainer

        center={center}

        zoom={12}

        minZoom={7}

        maxZoom={18}

        scrollWheelZoom={true}

        zoomControl={false}

        style={{
          height: '100%',
          width: '100%',
          zIndex: 1,
        }}

      >

        {/* ===================================================
            SATELLITE BASE MAP
            =================================================== */}

        <TileLayer

          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

          attribution="
            Tiles &copy; Esri —
            Source: Esri, Maxar, Earthstar Geographics,
            and the GIS User Community
          "

          maxZoom={19}

        />


        {/* ===================================================
            ZOOM CONTROL
            =================================================== */}

        <ZoomControl
          position="bottomright"
        />


        {/* ===================================================
            ASSAM DISTRICT BOUNDARIES
            =================================================== */}

        <AssamDistrictLayer

          onDistrictClick={
            (district) => {

              console.log(
                'Selected district:',
                district
              )

            }
          }

        />


        {/* ===================================================
            HAZARD MARKERS
            =================================================== */}

        <HazardMapMarkers

          hazardZones={
            hazardZones
          }

          selectedZone={
            selectedZone
          }

          onSelectZone={
            onSelectZone
          }

          activeHoveredSite={
            activeHoveredSite
          }

          activeLayers={
            mapLayers
          }

        />


        {/* ===================================================
            EVACUATION CENTERS / SHELTERS
            =================================================== */}

        {mapLayers?.shelters &&
          shelters.map(
            (shelter) => (

              <Marker

                key={
                  shelter.id
                }

                position={[
                  shelter.latitude,
                  shelter.longitude,
                ]}

                eventHandlers={{
                  click: () => {

                    console.log(
                      'Shelter clicked:',
                      shelter.name
                    )

                    console.log(
                      'Route start:',
                      hazardLat,
                      hazardLon
                    )

                    console.log(
                      'Route end:',
                      shelter.latitude,
                      shelter.longitude
                    )

                    setSelectedShelter(
                      shelter
                    )

                  },
                }}

              >

                <Popup
                  autoPan={true}
                  autoPanPaddingTopLeft={[
                    40,
                    100,
                  ]}
                  autoPanPaddingBottomRight={[
                    40,
                    40,
                  ]}
                  closeButton={true}
                >

                  <div
                    className="
                      min-w-[220px]
                      font-mono
                      text-sm
                    "
                  >

                    {/* ================================
                        SHELTER NAME
                        ================================ */}

                    <div
                      className="
                        text-base
                        font-bold
                        mb-2
                      "
                    >
                      {shelter.name}
                    </div>


                    {/* ================================
                        BASIC INFORMATION
                        ================================ */}

                    <div>
                      Type:{' '}
                      {shelter.type}
                    </div>

                    <div>
                      District:{' '}
                      {shelter.district}
                    </div>

                    <div>
                      Circle:{' '}
                      {shelter.circle}
                    </div>

                    <div>
                      Status:{' '}
                      {shelter.status}
                    </div>


                    <hr
                      className="
                        my-2
                        border-slate-300
                      "
                    />


                    {/* ================================
                        CAPACITY
                        ================================ */}

                    <div>
                      Capacity:{' '}
                      {shelter.capacity}
                    </div>

                    <div>
                      Available:{' '}
                      {shelter.availableCapacity}
                    </div>


                    <hr
                      className="
                        my-2
                        border-slate-300
                      "
                    />


                    {/* ================================
                        CENSUS INTELLIGENCE
                        ================================ */}

                    <div
                      className="
                        font-bold
                        mb-1
                      "
                    >
                      CENSUS INTELLIGENCE
                    </div>

                    <div>
                      Evacuation Zone:
                      {' '}
                      {shelter.name}
                    </div>

                    <div>
                      Population data:
                      {' '}
                      Available
                    </div>

                    <div>
                      Household data:
                      {' '}
                      Available
                    </div>

                  </div>

                </Popup>

              </Marker>

            )
          )}


        {/* ===================================================
            ROUTE
            =================================================== */}

        {mapLayers?.roadNetwork &&
          selectedShelter &&
          route && (

            <RouteLayer
              route={route}
            />

          )
        }

      </MapContainer>


      {/* =====================================================
          ROUTE LOADING
          ===================================================== */}

      {selectedShelter &&
        loading && (

          <div
            className="
              absolute
              top-4
              right-4
              z-[1000]
              rounded-lg
              border
              border-cyan-500/30
              bg-slate-950/90
              backdrop-blur
              px-3
              py-2
              text-[10px]
              font-mono
              text-cyan-300
              shadow-xl
            "
          >

            CALCULATING ROUTE...

          </div>

        )
      }


      {/* =====================================================
          ROUTE ERROR
          ===================================================== */}

      {selectedShelter &&
        error && (

          <div
            className="
              absolute
              top-4
              right-4
              z-[1000]
              max-w-xs
              rounded-lg
              border
              border-red-500/30
              bg-red-950/90
              backdrop-blur
              px-3
              py-2
              text-[10px]
              font-mono
              text-red-300
              shadow-xl
            "
          >

            ROUTE ERROR:{' '}

            {error}

          </div>

        )
      }

    </div>

  )

}


export default Map