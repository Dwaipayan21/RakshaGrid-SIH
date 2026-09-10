import React, { useEffect, useState, useMemo } from "react";
import { GeoJSON, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import assamAgePopulationData from "../../data/assam_age_population.json";

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

// assam_age_population.json keys look like "District - Kokrajhar (01)" or
// "State - ASSAM (18)". This strips the prefix/suffix down to just the
// district name ("Kokrajhar"), and returns null for the state-level entry
// so it doesn't get treated as a district.
const parseAgeDataKey = (rawKey) => {
  const match = rawKey.match(/^District\s*-\s*(.+?)\s*\(\d+\)\s*$/i);
  return match ? match[1].trim() : null;
};

// Build a normalized (lowercased) lookup table once: "kokrajhar" -> stats.
// Doing this up front means every district-name variant coming off the
// GeoJSON (mixed case, "Kamrup Metro" vs "Kamrup Metropolitan", etc.) only
// needs a single case-insensitive comparison instead of hardcoded aliases.
const buildAgeDataLookup = (rawData) => {
  const lookup = {};
  Object.entries(rawData).forEach(([key, value]) => {
    const districtName = parseAgeDataKey(key);
    if (districtName) {
      lookup[districtName.toLowerCase()] = value;
    }
  });
  return lookup;
};

const AGE_DATA_LOOKUP = buildAgeDataLookup(assamAgePopulationData);

// Safe lookup helper for district age/population statistics.
// Tries an exact case-insensitive match first, then falls back to a
// contains-match either direction (handles "Kamrup" vs "Kamrup Metropolitan"
// style mismatches between the GeoJSON and the census data).
const getDistrictStats = (districtName) => {
  if (!districtName) return null;
  const clean = districtName.trim().toLowerCase();

  if (AGE_DATA_LOOKUP[clean]) {
    return AGE_DATA_LOOKUP[clean];
  }

  const partialKey = Object.keys(AGE_DATA_LOOKUP).find(
    (k) => k.includes(clean) || clean.includes(k)
  );
  return partialKey ? AGE_DATA_LOOKUP[partialKey] : null;
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
  const [selectedClickPosition, setSelectedClickPosition] = useState(null);
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

  // Event listener to capture close button clicks on district detail cards
  useEffect(() => {
    const handleCardClick = (e) => {
      const closeBtn = e.target.closest(".district-details-close");
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setSelectedDistrict(null);
        setSelectedClickPosition(null);
        return;
      }

      const card = e.target.closest(".district-details-card-amber");
      if (card) {
        e.stopPropagation();
      }
    };

    document.addEventListener("click", handleCardClick, true);
    return () => {
      document.removeEventListener("click", handleCardClick, true);
    };
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
  // Selected district: bg-amber-50 details card showing the age-bracket
  // breakdown from assam_age_population.json, plus a blank Area row
  // reserved for a future data source.
  const createLabelIcon = (displayName, stats, isSelected) => {
    const fmt = (val) =>
      val != null && typeof val === "number" ? val.toLocaleString() : "N/A";

    const popStr = fmt(stats?.population);
    const childrenStr = fmt(stats?.children);
    const workingAgeStr = fmt(stats?.workingAge);
    const elderlyStr = fmt(stats?.elderly);

    const html = isSelected
      ? `
        <div class="district-details-card-amber">
          <button class="district-details-close" type="button">×</button>
          <div class="district-details-title">${displayName}</div>
          <div class="district-details-stat"><span>Population:</span> <strong>${popStr}</strong></div>
          <div class="district-details-stat"><span>Children:</span> <strong>${childrenStr}</strong></div>
          <div class="district-details-stat"><span>Working Age:</span> <strong>${workingAgeStr}</strong></div>
          <div class="district-details-stat"><span>Elderly:</span> <strong>${elderlyStr}</strong></div>
          <div class="district-details-stat district-details-stat-pending"><span>Area:</span> <strong>Fetching...</strong></div>
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
      // Taller now that there are 5 stat rows instead of 3
      iconSize: isSelected ? [150, 108] : [90, 20],
      iconAnchor: isSelected ? [75, 54] : [45, 10],
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
            click: (e) => {
              console.log("Selected district:", districtName);
              console.log("Clicked position:", e.latlng);

              setSelectedDistrict(districtName);

              setSelectedClickPosition([e.latlng.lat, e.latlng.lng]);

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
            position={
              isSelected && selectedClickPosition
                ? selectedClickPosition
                : lbl.center
            }
            interactive={isSelected}
            eventHandlers={{
              click: (e) => {
                const target = e.originalEvent?.target;

                if (target?.closest?.(".district-details-close")) {
                  setSelectedDistrict(null);
                  setSelectedClickPosition(null);
                }
              },
            }}
            icon={createLabelIcon(lbl.displayName, lbl.stats, isSelected)}
          />
        );
      })}
    </>
  );
};

export default AssamDistrictLayer;