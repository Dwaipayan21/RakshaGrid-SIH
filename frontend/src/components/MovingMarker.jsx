import { Marker, Popup, useMapEvent } from "react-leaflet"
import { Icon } from "leaflet"

const MovingMarker = ({ handleLoc, loc }) => {
  useMapEvent('click', (event) => {
    handleLoc({ lat: event.latlng.lat, lon: event.latlng.lng })
  })

  if (!loc) return null

  return (
    <Marker
      position={[loc.lat, loc.lon]}
      icon={
        new Icon({
          iconUrl: '/assets/pointer.svg',
          iconSize: [20, 35],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      }
    >
      <Popup>
        <div className="flex flex-col">
          <span>lat: {loc.lat.toFixed(2)}</span>
          <span>lon: {loc.lon.toFixed(2)}</span>
        </div>
      </Popup>
    </Marker>
  )
}

export default MovingMarker