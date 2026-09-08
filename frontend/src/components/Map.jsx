import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Recenter from './Recenter'
import HazardMapMarkers from './Dashboard/HazardMapMarkers'
import VillageLayer from './VillageLayer'

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
        attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
      />
      <VillageLayer />
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