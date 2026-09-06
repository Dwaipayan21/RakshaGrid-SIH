import React, { useState } from 'react'
import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import MovingMarker from './MovingMarker'
import Recenter from './Recenter'

const Map = ({ isDark }) => {
  const [loc, setLoc] = useState({ lat: 26.2006, lon: 92.9376 }) // for assam (for india 22.9734, 78.6569)

  const handleLoc = (loc) => {
    setLoc(loc);
  }

  return (
    <MapContainer
      center={[loc.lat, loc.lon]}
      zoom={8}
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
      <MovingMarker handleLoc={handleLoc} loc={loc} />
      <Recenter loc={loc} />
    </MapContainer>
  )
}

export default Map