import React, { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'

const VillageLayer = () => {
    const [villages, setVillages] = useState(null)

    useEffect(() => {
        console.log("Loadinf assam geojson");

        fetch("/geojson/assam_village_boundaries_wgs84.geojson")
            .then((res) => {
                console.log("Response: ",res.status);

                if(!res.ok){
                    throw new Error(`HTTP Error : ${res.status}`);
                }

                return res.json();
            })
            .then((data) => {
                console.log("GeoJOSN loaded:",data);
                console.log("Number of villages: ",data.features?.length);

                setVillages(data)})
                .catch((error) => {
                    console.error("Geojson loading error : ", error);
                })
    }, []);

    if(!villages) return null;

    return villages ? (
        <GeoJSON
            data={villages}
            style={{
                color: "#7dd3c7",
                weight: 1,
                fillColor: "#7dd3c7",
                fillOpacity: 0.08,
            }}
        />
    ) : null
}

export default VillageLayer