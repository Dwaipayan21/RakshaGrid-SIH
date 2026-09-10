import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import HazardMapMarkers from '../Dashboard/HazardMapMarkers'
import AssamDistrictLayer from './AssamDistrictLayer'

import useRoute from '../../hooks/useRoute'
import RouteLayer from './RouteLayer'

import shelters from '../../data/shelters'


// =========================================================
// MAP VIEW SYNC
// =========================================================

const MapViewSync = ({ center }) => {
  const map = useMap()

  useEffect(() => {
    if (!center) return

    map.flyTo(
      center,
      12,
      {
        duration: 0.8,
      }
    )
  }, [center, map])

  return null
}


// =========================================================
// OPENSTREETMAP / OVERPASS API
// =========================================================

const OSM_API =
  'https://overpass-api.de/api/interpreter'


// =========================================================
// OPERATIONAL GIS LAYERS
//
// These layers are independent from the original
// hazard/shelter/OSRM system.
//
// roads = OpenStreetMap road network
// hospitals = OpenStreetMap hospitals/clinics
// =========================================================

const OperationalOsmLayers = ({
  center,
  showRoads,
  showHospitals,
}) => {

  const [roads, setRoads] =
    useState([])

  const [hospitals, setHospitals] =
    useState([])

  const [loadingRoads, setLoadingRoads] =
    useState(false)

  const [loadingHospitals, setLoadingHospitals] =
    useState(false)


  // =======================================================
  // LOAD ROADS
  // =======================================================

  useEffect(() => {

    if (!showRoads) {
      setRoads([])
      setLoadingRoads(false)
      return
    }

    if (!center) return

    const controller =
      new AbortController()

    const [lat, lon] = center

    const south = lat - 0.12
    const north = lat + 0.12
    const west = lon - 0.12
    const east = lon + 0.12

    const query = `
      [out:json][timeout:25];

      way["highway"]
      (${south},${west},${north},${east});

      out geom;
    `


    const loadRoads = async () => {

      try {

        setLoadingRoads(true)

        const response =
          await fetch(
            OSM_API,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'text/plain',
              },
              body: query,
              signal:
                controller.signal,
            }
          )


        if (!response.ok) {
          throw new Error(
            'Unable to load road network'
          )
        }


        const data =
          await response.json()


        const roadFeatures =
          (data.elements || [])
            .filter(
              (way) =>
                way.geometry &&
                way.geometry.length > 1
            )
            .map((way) => ({
              id: way.id,

              type:
                way.tags?.highway ||
                'road',

              name:
                way.tags?.name ||
                'Unnamed road',

              coordinates:
                way.geometry.map(
                  (point) => [
                    point.lat,
                    point.lon,
                  ]
                ),
            }))


        setRoads(
          roadFeatures
        )

      } catch (error) {

        if (
          error.name !==
          'AbortError'
        ) {
          console.error(
            'OSM road layer error:',
            error
          )
        }

      } finally {

        if (
          !controller.signal.aborted
        ) {
          setLoadingRoads(false)
        }

      }
    }


    loadRoads()


    return () =>
      controller.abort()

  }, [
    center,
    showRoads,
  ])


  // =======================================================
  // LOAD HOSPITALS / CLINICS
  // =======================================================

  useEffect(() => {

    if (!showHospitals) {
      setHospitals([])
      setLoadingHospitals(false)
      return
    }

    if (!center) return

    const controller =
      new AbortController()

    const [lat, lon] = center

    const south = lat - 0.15
    const north = lat + 0.15
    const west = lon - 0.15
    const east = lon + 0.15

    const query = `
      [out:json][timeout:25];

      (
        node["amenity"="hospital"]
        (${south},${west},${north},${east});

        way["amenity"="hospital"]
        (${south},${west},${north},${east});

        node["amenity"="clinic"]
        (${south},${west},${north},${east});

        way["amenity"="clinic"]
        (${south},${west},${north},${east});
      );

      out center;
    `


    const loadHospitals =
      async () => {

        try {

          setLoadingHospitals(
            true
          )

          const response =
            await fetch(
              OSM_API,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'text/plain',
                },
                body: query,
                signal:
                  controller.signal,
              }
            )


          if (!response.ok) {
            throw new Error(
              'Unable to load hospitals'
            )
          }


          const data =
            await response.json()


          const medicalFeatures =
            (data.elements || [])
              .map((item) => {

                const latitude =
                  item.lat ??
                  item.center?.lat

                const longitude =
                  item.lon ??
                  item.center?.lon

                if (
                  latitude == null ||
                  longitude == null
                ) {
                  return null
                }

                return {
                  id: item.id,

                  name:
                    item.tags?.name ||
                    'Medical Facility',

                  type:
                    item.tags?.amenity ===
                    'hospital'
                      ? 'Hospital'
                      : 'Clinic',

                  latitude,
                  longitude,
                }
              })
              .filter(Boolean)


          setHospitals(
            medicalFeatures
          )

        } catch (error) {

          if (
            error.name !==
            'AbortError'
          ) {
            console.error(
              'OSM hospital layer error:',
              error
            )
          }

        } finally {

          if (
            !controller.signal.aborted
          ) {
            setLoadingHospitals(
              false
            )
          }

        }
      }


    loadHospitals()


    return () =>
      controller.abort()

  }, [
    center,
    showHospitals,
  ])


  // =======================================================
  // RENDER GIS LAYERS
  // =======================================================

  return (
    <>
      {/* =================================================
          ROAD NETWORK
          ================================================= */}

      {showRoads &&
        roads.map((road) => {

          const majorRoad =
            [
              'motorway',
              'trunk',
              'primary',
              'secondary',
            ].includes(
              road.type
            )


          return (
            <Polyline
              key={`road-${road.id}`}
              positions={
                road.coordinates
              }
              pathOptions={{
                color: majorRoad
                  ? '#fbbf24'
                  : '#94a3b8',

                weight: majorRoad
                  ? 3
                  : 1.5,

                opacity: majorRoad
                  ? 0.9
                  : 0.5,
              }}
            >
              <Popup>
                <div className="text-slate-900">

                  <strong>
                    {road.name}
                  </strong>

                  <br />

                  <span className="text-xs">
                    Road type:{' '}
                    {road.type}
                  </span>

                </div>
              </Popup>
            </Polyline>
          )
        })}


      {/* =================================================
          HOSPITALS / CLINICS
          ================================================= */}

      {showHospitals &&
        hospitals.map(
          (facility) => (

            <CircleMarker
              key={`medical-${facility.id}`}
              center={[
                facility.latitude,
                facility.longitude,
              ]}
              radius={7}
              pathOptions={{
                color: '#f0abfc',
                fillColor: '#d946ef',
                fillOpacity: 0.9,
                weight: 2,
              }}
            >

              <Popup>

                <div className="text-slate-900">

                  <strong>
                    {facility.name}
                  </strong>

                  <br />

                  <span className="text-xs">
                    {facility.type}
                  </span>

                </div>

              </Popup>

            </CircleMarker>

          )
        )}


      {/* =================================================
          GIS LOADING
          ================================================= */}

      {(loadingRoads ||
        loadingHospitals) && (

        <div
          className="
            absolute
            top-3
            right-3
            z-[900]
            bg-slate-950/95
            border
            border-cyan-500/30
            rounded-lg
            px-3
            py-2
            text-[9px]
            font-mono
            font-bold
            text-cyan-300
            shadow-xl
          "
        >
          LOADING GIS DATA...
        </div>

      )}

    </>
  )
}


// =========================================================
// MAIN MAP
// =========================================================

const Map = ({
  hazardZones = [],
  selectedZone,
  onSelectZone,
  activeHoveredSite,
  activeLayers = {},
}) => {


  // =======================================================
  // SELECTED SHELTER
  //
  // IMPORTANT:
  // This is retained specifically so your original
  // OSRM routing continues to work.
  // =======================================================

  const [
    selectedShelter,
    setSelectedShelter,
  ] = useState(null)


  // =======================================================
  // LAYER VISIBILITY
  // =======================================================

  const showRiskZones =
    activeLayers.riskZones !== false

  const showSettlements =
    activeLayers.settlements !== false

  const showShelters =
    activeLayers.shelters !== false

  const showRoads =
    activeLayers.roads === true

  const showHospitals =
    activeLayers.hospitals === true

  const showFloodExtent =
    activeLayers.floodExtent !== false


  // =======================================================
  // HAZARD COORDINATES
  // =======================================================

  const hazardLat =
    selectedZone?.latitude ??
    selectedZone?.lat ??
    selectedZone?.coordinates?.[1]

  const hazardLon =
    selectedZone?.longitude ??
    selectedZone?.lon ??
    selectedZone?.lng ??
    selectedZone?.coordinates?.[0]


  // =======================================================
  // MAP CENTER
  // =======================================================

  const center = useMemo(
    () => [
      hazardLat ?? 26.35,
      hazardLon ?? 92.27,
    ],
    [
      hazardLat,
      hazardLon,
    ]
  )


  // =======================================================
  // OSRM ROUTE START
  //
  // Hazard / selected settlement
  // =======================================================

  const routeStart =
    useMemo(() => {

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


  // =======================================================
  // OSRM ROUTE END
  //
  // Supports both:
  //
  // latitude / longitude
  //
  // AND
  //
  // lat / lon
  //
  // so existing shelter data continues working.
  // =======================================================

  const routeEnd =
    useMemo(() => {

      if (!selectedShelter) {
        return null
      }


      const shelterLat =
        selectedShelter.latitude ??
        selectedShelter.lat


      const shelterLon =
        selectedShelter.longitude ??
        selectedShelter.lon


      if (
        shelterLat == null ||
        shelterLon == null
      ) {
        return null
      }


      return [
        shelterLat,
        shelterLon,
      ]

    }, [
      selectedShelter,
    ])


  // =======================================================
  // ORIGINAL OSRM ROUTING HOOK
  // =======================================================

  const {
    route,
    loading,
    error,
  } = useRoute(
    routeStart,
    routeEnd
  )


  // =======================================================
  // SHELTER SELECTION
  //
  // Selecting a shelter causes useRoute() to execute
  // again and fetch the shortest driving route.
  // =======================================================

  const handleShelterClick =
    (shelter) => {

      setSelectedShelter(
        shelter
      )

    }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      zoomControl={false}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 1,
      }}
    >

      {/* =================================================
          LEAFLET ZOOM CONTROL

          Bottom-right prevents collision with:
          - Morigaon selector
          - Layers button
          ================================================= */}

      <ZoomControl
        position="bottomright"
      />


      {/* =================================================
          MAP CENTER SYNC
          ================================================= */}

      <MapViewSync
        center={center}
      />


      {/* =================================================
          SATELLITE BASEMAP
          ================================================= */}

      <TileLayer
        url={`https://api.maptiler.com/maps/hybrid-v4/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        tileSize={512}
        zoomOffset={-1}
        attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
      />


      {/* =================================================
          ASSAM DISTRICT BOUNDARIES
          ================================================= */}

      <AssamDistrictLayer
        onDistrictClick={(
          district
        ) => {
          console.log(
            'Selected district:',
            district
          )
        }}
      />


      {/* =================================================
          EXISTING HAZARD / SETTLEMENT / SHELTER SYSTEM

          IMPORTANT:
          This is where the original marker system remains.
          ================================================= */}

      <HazardMapMarkers
        hazardZones={hazardZones}
        selectedZone={selectedZone}
        shelters={shelters}
        activeLayers={activeLayers}
        onSelectZone={onSelectZone}
        activeHoveredSite={activeHoveredSite}
        selectedShelter={selectedShelter}
        onShelterSelect={handleShelterClick}
        showRiskZones={showRiskZones}
        showSettlements={showSettlements}
        showShelters={showShelters}
        showFloodExtent={showFloodExtent}
      />


      {/* =================================================
          OSM ROADS + HOSPITALS
          ================================================= */}

      <OperationalOsmLayers
        center={center}

        showRoads={
          showRoads
        }

        showHospitals={
          showHospitals
        }
      />


      {/* =================================================
          ORIGINAL OSRM ROUTE

          DO NOT REMOVE THIS.

          When a shelter is selected:

          selectedShelter
                ↓
          routeEnd
                ↓
          useRoute()
                ↓
          OSRM
                ↓
          route
                ↓
          RouteLayer

          This restores the shortest driving route.
          ================================================= */}

      {selectedShelter &&
        route && (

          <RouteLayer
            route={route}
          />

        )}


      {/* =================================================
          ROUTE CALCULATING
          ================================================= */}

      {selectedShelter &&
        loading && (

        <div
          className="
            absolute
            top-3
            left-1/2
            -translate-x-1/2
            z-[900]
            bg-slate-950/95
            border
            border-cyan-500/30
            text-cyan-300
            px-4
            py-2
            rounded-lg
            text-[9px]
            font-mono
            font-bold
            shadow-xl
          "
        >
          CALCULATING SHORTEST EVACUATION ROUTE...
        </div>

      )}


      {/* =================================================
          ROUTE ERROR
          ================================================= */}

      {selectedShelter &&
        error && (

        <div
          className="
            absolute
            top-3
            left-1/2
            -translate-x-1/2
            z-[900]
            bg-red-950/95
            border
            border-red-500/30
            text-red-300
            px-4
            py-2
            rounded-lg
            text-[9px]
            font-mono
            font-bold
            shadow-xl
            max-w-[350px]
          "
        >
          ROUTE ERROR: {error}
        </div>

      )}

    </MapContainer>
  )
}


export default Map
