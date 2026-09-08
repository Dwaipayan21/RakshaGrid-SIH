import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

const AssamDistrictLayer = ({ onDistrictClick }) => {
  const [districtData, setDistrictData] = useState(null);

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

        // Check the first district's properties
        if (data.features?.length > 0) {
          console.log(
            "FIRST DISTRICT PROPERTIES:",
            data.features[0].properties
          );
        }

        setDistrictData(data);
      })
      .catch((error) => {
        console.error("Error loading Assam district data:", error);
      });
  }, []);

  const districtStyle = {
    color: "#38bdf8",
    weight: 2,
    fillColor: "#0f172a",
    fillOpacity: 0.08,
  };

  if (!districtData) {
    return null;
  }

  return (
    <GeoJSON
      data={districtData}
      style={districtStyle}
      onEachFeature={(feature, layer) => {

        // Show EVERYTHING inside properties
        console.log("DISTRICT PROPERTIES:", feature.properties);

        const properties = feature.properties || {};

        // Try common district-name fields
        const districtName =
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
          "Unknown District";

        layer.bindTooltip(districtName);

        layer.on({
          click: () => {
            console.log("Selected district:", districtName);

            if (onDistrictClick) {
              onDistrictClick(districtName);
            }
          },

          mouseover: (e) => {
            e.target.setStyle({
              weight: 3,
              color: "#67e8f9",
              fillOpacity: 0.18,
            });
          },

          mouseout: (e) => {
            e.target.setStyle(districtStyle);
          },
        });
      }}
    />
  );
};

export default AssamDistrictLayer;