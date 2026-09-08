import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Recenter from './Recenter'
import HazardMapMarkers from './Dashboard/HazardMapMarkers'
import VillageLayer from './VillageLayer'
import AssamDistrictLayer from "./AssamDistrictLayer";

const Map = ({ hazardZones, selectedZone, onSelectZone, activeHoveredSite }) => {
  const centerLoc = selectedZone
    ? { lat: selectedZone.lat, lon: selectedZone.lon }
    : { lat: 26.2419, lon: 92.2011 }

  return (
    <MapContainer
      center={[centerLoc.lat, centerLoc.lon]}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 1,
      }}
    >
      <TileLayer
        url={`https://api.maptiler.com/maps/hybrid-v4/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        tileSize={512}
        zoomOffset={-1}
        attribution='&copy; MapTiler &copy; OpenStreetMap contributors'
      />
      <AssamDistrictLayer
        onDistrictClick={(district) => {
          console.log("Selected district:", district);
        }}
      />
      {/* <VillageLayer /> */}
      <HazardMapMarkers
        hazardZones={hazardZones}
        selectedZone={selectedZone}
        onSelectZone={onSelectZone}
        activeHoveredSite={activeHoveredSite}
      />
      
      <Recenter loc={centerLoc} zoom={12} />
    </MapContainer>
  )
}

export default Map