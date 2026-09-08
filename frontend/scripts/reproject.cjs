const fs = require("fs");
const proj4 = require("proj4");

const inputFile = "./public/geojson/assam_village_boundaries.GeoJSON";
const outputFile = "./public/geojson/assam_village_boundaries_wgs84.geojson";

// EPSG:7755 - WGS 84 / India NSF LCC
proj4.defs(
    "EPSG:7755",
    "+proj=lcc " +
    "+lat_0=24 " +
    "+lon_0=80 " +
    "+lat_1=12.472955 " +
    "+lat_2=35.1728044444444 " +
    "+x_0=4000000 " +
    "+y_0=4000000 " +
    "+datum=WGS84 " +
    "+units=m " +
    "+no_defs " +
    "+type=crs"
);

const sourceCRS = "EPSG:7755";
const targetCRS = "EPSG:4326";

console.log("Reading GeoJSON...");

const geojson = JSON.parse(
    fs.readFileSync(inputFile, "utf8")
);

console.log(`Found ${geojson.features.length} features.`);

function transformCoordinates(coords) {
    if (typeof coords[0] === "number") {
        return proj4(
            sourceCRS,
            targetCRS,
            coords
        );
    }

    return coords.map(transformCoordinates);
}

for (let i = 0; i < geojson.features.length; i++) {
    const feature = geojson.features[i];

    if (feature.geometry && feature.geometry.coordinates) {
        feature.geometry.coordinates =
            transformCoordinates(feature.geometry.coordinates);
    }

    if (i % 1000 === 0) {
        console.log(`Processed ${i}/${geojson.features.length}`);
    }
}

// GeoJSON should no longer advertise the old projected CRS
delete geojson.crs;

console.log("Writing converted GeoJSON...");

fs.writeFileSync(
    outputFile,
    JSON.stringify(geojson)
);

console.log("DONE!");
console.log(`Output: ${outputFile}`);