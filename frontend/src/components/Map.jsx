import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Recenter from './Recenter'
import HazardMapMarkers from './Dashboard/HazardMapMarkers'

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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