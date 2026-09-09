import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import HazardMapMarkers from "../Dashboard/HazardMapMarkers";
import AssamDistrictLayer from "./AssamDistrictLayer";
import useRoute from "../../hooks/useRoute";
import RouteLayer from "./RouteLayer";
import shelters from "../../data/shelters";

const Map = ({
  hazardZones,
  selectedZone,
  onSelectZone,
  activeHoveredSite,
}) => {
  const [selectedShelter, setSelectedShelter] = useState(null);

  // Get hazard coordinates
  const hazardLat =
    selectedZone?.latitude ??
    selectedZone?.lat ??
    selectedZone?.coordinates?.[1];

  const hazardLon =
    selectedZone?.longitude ??
    selectedZone?.lon ??
    selectedZone?.lng ??
    selectedZone?.coordinates?.[0];

  // Keep route coordinates stable
  const routeStart = useMemo(() => {
    if (hazardLat == null || hazardLon == null) {
      return null;
    }

    return [hazardLat, hazardLon];
  }, [hazardLat, hazardLon]);

  const routeEnd = useMemo(() => {
    if (!selectedShelter) {
      return null;
    }

    return [
      selectedShelter.latitude,
      selectedShelter.longitude,
    ];
  }, [selectedShelter]);

  // Get route
  const { route, loading, error } = useRoute(
    routeStart,
    routeEnd
  );

  const center = [
    hazardLat ?? 26.35,
    hazardLon ?? 92.27,
  ];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
        zIndex: 1,
      }}
    >
      <TileLayer
        url={`https://api.maptiler.com/maps/hybrid-v4/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        tileSize={512}
        zoomOffset={-1}
        attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
      />

      <AssamDistrictLayer
        onDistrictClick={(district) => {
          console.log("Selected district:", district);
        }}
      />

      <HazardMapMarkers
        hazardZones={hazardZones}
        selectedZone={selectedZone}
        onSelectZone={onSelectZone}
        activeHoveredSite={activeHoveredSite}
      />

      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          position={[
            shelter.latitude,
            shelter.longitude,
          ]}
          eventHandlers={{
            click: () => {
              console.log("Shelter clicked:", shelter.name);
              console.log(
                "Route start:",
                hazardLat,
                hazardLon
              );
              console.log(
                "Route end:",
                shelter.latitude,
                shelter.longitude
              );

              setSelectedShelter(shelter);
            },
          }}
        >
          <Popup>
            <strong>{shelter.name}</strong>
            <br />
            Type: {shelter.type}
            <br />
            Capacity: {shelter.capacity}
            <br />
            Available: {shelter.availableCapacity}
            <br />
            Status: {shelter.status}
          </Popup>
        </Marker>
      ))}

      {selectedShelter && route && (
        <RouteLayer route={route} />
      )}

      {selectedShelter && loading && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            background: "white",
            padding: "10px 14px",
            borderRadius: "8px",
          }}
        >
          Calculating route...
        </div>
      )}

      {selectedShelter && error && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            background: "#fff1f1",
            color: "#d00000",
            padding: "10px 14px",
            borderRadius: "8px",
          }}
        >
          Route error: {error}
        </div>
      )}
    </MapContainer>
  );
};

export default Map;