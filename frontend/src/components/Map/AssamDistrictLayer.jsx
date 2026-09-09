import React, { useEffect, useState, useMemo } from "react";
import { GeoJSON, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import districtPopulationData from "../../data/districtPopulation.json";

// Fallback logic to extract district name from GeoJSON feature properties
const getDistrictName = (properties) => {
  if (!properties) return "Unknown District";
  return (
    properties.district ||
    properties.DISTRICT ||
    properties.District ||
    properties.NAME ||
    properties.Name ||
    properties.NAME_2 ||
    properties.DT_NAME ||
    properties.DTNAME ||
    properties.dtname ||
    properties.district_name ||
    properties.DIST_NAME ||
    "Unknown District"
  );
};

// Helper to format district name into Title Case for labels
const formatDistrictDisplayName = (name) => {
  if (!name || name === "Unknown District") return "Unknown District";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Safe lookup helper for district statistics
const getDistrictStats = (districtName) => {
  if (!districtName) return null;

  if (districtPopulationData[districtName]) {
    return districtPopulationData[districtName];
  }

  const cleanName = districtName.trim().toLowerCase();
  const matchedKey = Object.keys(districtPopulationData).find(
    (k) => k.trim().toLowerCase() === cleanName
  );
  if (matchedKey) {
    return districtPopulationData[matchedKey];
  }

  return null;
};

// Map Zoom Tracker hook component
const MapZoomTracker = ({ onZoomChange }) => {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
};

const AssamDistrictLayer = ({ onDistrictClick }) => {
  const [districtData, setDistrictData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(10);

  useEffect(() => {
    fetch("/geojson/assam_district_boundaries.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load Assam district GeoJSON");
        }
        return response.json();
      })
      .then((data) => {
        console.log("ASSAM GEOJSON:", data);
        setDistrictData(data);
      })
      .catch((error) => {
        console.error("Error loading Assam district data:", error);
      });
  }, []);

  // Compute centers and label metadata for each district feature
  const districtLabels = useMemo(() => {
    if (!districtData?.features) return [];

    return districtData.features
      .map((feature, idx) => {
        const rawName = getDistrictName(feature.properties);
        const displayName = formatDistrictDisplayName(rawName);
        const stats = getDistrictStats(rawName) || getDistrictStats(displayName);

        try {
          const bounds = L.geoJSON(feature).getBounds();
          if (bounds && bounds.isValid()) {
            const center = bounds.getCenter();
            return {
              id: `district-label-${idx}-${rawName}`,
              rawName,
              displayName,
              center: [center.lat, center.lng],
              stats,
            };
          }
        } catch (e) {
          console.warn("Could not calculate bounds for district:", rawName, e);
        }
        return null;
      })
      .filter(Boolean);
  }, [districtData]);

  // Default neutral style for district administrative boundaries
  const defaultStyle = {
    color: "#94a3b8",
    weight: 1.5,
    fillColor: "#ffffff",
    fillOpacity: 0.03,
  };

  const getFeatureStyle = (featureName) => {
    if (featureName === selectedDistrict) {
      return {
        color: "#f59e0b",
        weight: 2.5,
        fillColor: "#f59e0b",
        fillOpacity: 0.18,
      };
    }
    if (featureName === hoveredDistrict) {
      return {
        color: "#cdb5e1",
        weight: 2.5,
        fillColor: "#ffffff",
        fillOpacity: 0.12,
      };
    }
    return defaultStyle;
  };

  // Helper to create Leaflet divIcon for district labels
  // Unselected districts: PLAIN TEXT ONLY (No card, no box container)
  // Selected district: bg-amber-50 details card
  const createLabelIcon = (displayName, stats, isSelected) => {
    const popStr =
      stats?.population != null && typeof stats.population === "number"
        ? stats.population.toLocaleString()
        : "N/A";
    const areaStr =
      stats?.area != null && typeof stats.area === "number"
        ? `${stats.area.toLocaleString()} km²`
        : "N/A";
    const densityStr =
      stats?.density != null && typeof stats.density === "number"
        ? `${stats.density.toLocaleString()}/km²`
        : "N/A";

    const html = isSelected
      ? `
        <div class="district-details-card-amber">
          <div class="district-details-title">${displayName}</div>
          <div class="district-details-stat"><span>Population:</span> <strong>${popStr}</strong></div>
          <div class="district-details-stat"><span>Area:</span> <strong>${areaStr}</strong></div>
          <div class="district-details-stat"><span>Density:</span> <strong>${densityStr}</strong></div>
        </div>
      `
      : `
        <div class="plain-district-name-text">
          ${displayName}
        </div>
      `;

    return L.divIcon({
      html,
      className: "custom-district-label-container",
      iconSize: isSelected ? [135, 72] : [90, 20],
      iconAnchor: isSelected ? [67, 36] : [45, 10],
    });
  };

  if (!districtData) {
    return null;
  }

  return (
    <>
      <MapZoomTracker onZoomChange={setZoomLevel} />

      <GeoJSON
        key={`geojson-${selectedDistrict}-${hoveredDistrict}`}
        data={districtData}
        style={(feature) => {
          const districtName = getDistrictName(feature?.properties);
          return getFeatureStyle(districtName);
        }}
        onEachFeature={(feature, layer) => {
          const districtName = getDistrictName(feature.properties);

          layer.on({
            click: () => {
              console.log("Selected district:", districtName);
              setSelectedDistrict(districtName);
              if (onDistrictClick) {
                onDistrictClick(districtName);
              }
            },
            mouseover: (e) => {
              setHoveredDistrict(districtName);
              e.target.setStyle({
                weight: 1.5,
                color: "#cbd5e1",
                fillOpacity: 0.04,
              });
            },
            mouseout: (e) => {
              setHoveredDistrict(null);
              e.target.setStyle(getFeatureStyle(districtName));
            },
          });
        }}
      />

      {/* District labels: plain text for unselected, amber details card when clicked */}
      {districtLabels.map((lbl) => {
        const isSelected = selectedDistrict === lbl.rawName;

        return (
          <Marker
            key={lbl.id}
            position={lbl.center}
            interactive={false}
            icon={createLabelIcon(lbl.displayName, lbl.stats, isSelected)}
          />
        );
      })}
    </>
  );
};

export default AssamDistrictLayer;