import { useEffect } from "react"
import { useMap } from "react-leaflet"

const Recenter = ({ loc, zoom = 12 }) => {
  const map = useMap()
  useEffect(() => {
    if (loc && loc.lat && loc.lon) {
      map.flyTo([loc.lat, loc.lon], zoom, {
        duration: 1.5,
      })
    }
  }, [loc, zoom, map])
  return null
}

export default Recenter