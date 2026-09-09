import { GeoJSON } from "react-leaflet";

const RouteLayer = ({ route }) => {
  if (!route?.geometry) return null;

  return (
    <GeoJSON
      data={route.geometry}
      style={{
        color: "#00e5ff",
        weight: 6,
        opacity: 0.9,
      }}
    />
  );
};

export default RouteLayer;