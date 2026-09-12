import React, {
  useMemo,
  useState,
  useEffect,
} from 'react'

import {
  MapContainer,
  TileLayer,
  ZoomControl,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import HazardMapMarkers from '../Dashboard/HazardMapMarkers'

import AssamDistrictLayer from './AssamDistrictLayer'

import useRoute from '../../hooks/useRoute'

import RouteLayer from './RouteLayer'

import shelters from '../../data/shelters'

import Recenter from './Recenter'


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

  // =========================================================
  // SELECTED SHELTER
  // =========================================================

  const [
    selectedShelter,
    setSelectedShelter,
  ] = useState(null)


  // =========================================================
  // CLEAR SELECTED SHELTER WHEN SHELTER LAYER IS OFF
  // =========================================================

  useEffect(() => {

    if (!mapLayers?.shelters) {

      setSelectedShelter(null)

    }

  }, [
    mapLayers?.shelters,
  ])


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
  // RECENTER TARGETS
  // =========================================================

  const hazardLoc = useMemo(() => {

    if (
      hazardLat == null ||
      hazardLon == null
    ) {
      return null
    }

    return {
      lat: hazardLat,
      lon: hazardLon,
    }

  }, [
    hazardLat,
    hazardLon,
  ])


  const shelterLoc = useMemo(() => {

    if (!selectedShelter) {
      return null
    }

    return {
      lat: selectedShelter.latitude,
      lon: selectedShelter.longitude,
    }

  }, [
    selectedShelter,
  ])


  // =========================================================
  // MAP CENTER
  // =========================================================

  const center = [
    hazardLat ?? 26.35,
    hazardLon ?? 92.27,
  ]


  // =========================================================
  // CENSUS DATA
  //
  // IMPORTANT:
  //
  // These values come from the selected hazard zone.
  //
  // Population:
  //     selectedZone.population
  //
  // Households:
  //     selectedZone.households
  //
  // If households is unavailable, use the same existing
  // RakshaGrid fallback:
  //
  //     Math.ceil(population / 5)
  // =========================================================

  const censusPopulation =
    selectedZone?.population != null
      ? Number(selectedZone.population)
      : null


  const censusHouseholds =
    selectedZone?.households != null
      ? Number(selectedZone.households)
      : censusPopulation != null
        ? Math.ceil(
            censusPopulation / 5
          )
        : null


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


      {/* =====================================================
          MAP
          ===================================================== */}

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
            RECENTER ON HAZARD ZONE SELECTION
            =================================================== */}

        <Recenter
          loc={hazardLoc}
          zoom={14}
        />


        {/* ===================================================
            RECENTER ON SHELTER / SAFE ZONE SELECTION
            =================================================== */}

        <Recenter
          loc={shelterLoc}
          zoom={15}
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
            ALL HAZARD / SETTLEMENT / SHELTER MARKERS
          
            IMPORTANT:
          
            HazardMapMarkers now owns the shelter markers.
          
            This prevents the OLD shelter marker system from
            rendering a second popup.
            =================================================== */}

        <HazardMapMarkers

          hazardZones={
            hazardZones
          }

          selectedZone={
            selectedZone
          }

          shelters={
            shelters
          }

          activeLayers={
            mapLayers
          }

          onSelectZone={
            onSelectZone
          }

          activeHoveredSite={
            activeHoveredSite
          }

          selectedShelter={
            selectedShelter
          }

          onShelterSelect={
            (shelter) => {

              console.log(
                'Shelter selected:',
                shelter?.name
              )

              console.log(
                'Route start:',
                hazardLat,
                hazardLon
              )

              console.log(
                'Route end:',
                shelter?.latitude,
                shelter?.longitude
              )

              setSelectedShelter(
                shelter
              )

            }
          }

        />


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


      {/* =====================================================
          CENSUS DEBUG INFORMATION
          
          This is intentionally hidden.
          
          It allows us to verify the actual values in the
          browser console without changing the UI.
          ===================================================== */}

      {/*
        console.log(
          'Census population:',
          censusPopulation
        )

        console.log(
          'Census households:',
          censusHouseholds
        )
      */}


    </div>

  )

}


export default Map