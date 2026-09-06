import { useEffect } from "react"
import { useMap } from "react-leaflet"

const Recenter = ({ loc }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([loc.lat, loc.lon])
  }, [loc])
  return null
}

export default Recenter