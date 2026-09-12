import React, { useEffect, useState } from 'react'
import { GeoJSON, Popup } from 'react-leaflet'

const VillageLayer = () => {
    const [villages, setVillages] = useState(null)

    useEffect(() => {
        console.log("Loading Assam GeoJSON...")

        fetch("/geojson/assam_village_boundaries_wgs84.geojson")
            .then((res) => {
                console.log("Response:", res.status)

                if (!res.ok) {
                    throw new Error(`HTTP Error: ${res.status}`)
                }

                return res.json()
            })
            .then((data) => {
                console.log("GeoJSON loaded:", data)
                console.log(
                    "Number of villages:",
                    data.features?.length
                )

                setVillages(data)
            })
            .catch((error) => {
                console.error(
                    "GeoJSON loading error:",
                    error
                )
            })
    }, [])

    if (!villages) {
        return null
    }

    /*
     * Get a property from the GeoJSON feature.
     * This checks multiple possible field names so that
     * the code works even if the GeoJSON uses different
     * capitalization/naming conventions.
     */
    const getProperty = (properties, possibleNames) => {
        if (!properties) {
            return null
        }

        const propertyKeys = Object.keys(properties)

        for (const name of possibleNames) {
            const exactMatch = properties[name]

            if (
                exactMatch !== undefined &&
                exactMatch !== null &&
                exactMatch !== ""
            ) {
                return exactMatch
            }

            const matchingKey = propertyKeys.find(
                (key) =>
                    key.toLowerCase() === name.toLowerCase()
            )

            if (matchingKey) {
                const value = properties[matchingKey]

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    return value
                }
            }
        }

        return null
    }

    const formatNumber = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—"
        }

        const number = Number(value)

        if (Number.isNaN(number)) {
            return value
        }

        return number.toLocaleString()
    }

    const onEachFeature = (feature, layer) => {
        const properties = feature?.properties || {}

        /*
         * Population
         */
        const population = getProperty(properties, [
            "population",
            "Population",
            "POPULATION",
            "pop",
            "POP",
            "total_population",
            "totalPopulation",
            "TOT_P"
        ])

        /*
         * Households
         */
        const households = getProperty(properties, [
            "households",
            "household",
            "Households",
            "Household",
            "HOUSEHOLDS",
            "HOUSEHOLD",
            "total_households",
            "totalHouseholds",
            "TOT_HH"
        ])

        /*
         * Village name
         */
        const villageName = getProperty(properties, [
            "name",
            "Name",
            "NAME",
            "village",
            "Village",
            "VILLAGE",
            "village_name",
            "villageName",
            "VILL_NAME"
        ])

        /*
         * Calculate households only when the GeoJSON does
         * not provide an actual household value.
         *
         * This follows the existing RakshaGrid logic:
         * households = ceil(population / 5)
         */
        const numericPopulation =
            population !== null
                ? Number(population)
                : null

        const calculatedHouseholds =
            households === null &&
            numericPopulation !== null &&
            !Number.isNaN(numericPopulation)
                ? Math.ceil(numericPopulation / 5)
                : null

        const displayHouseholds =
            households !== null
                ? households
                : calculatedHouseholds

        /*
         * Census popup
         */
        layer.bindPopup(`
            <div style="
                width: 240px;
                font-family: Inter, system-ui, -apple-system,
                BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: #0f172a;
            ">

                <div style="
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                    color: #0f172a;
                ">
                    CENSUS INTELLIGENCE
                </div>

                <div style="
                    padding: 8px 10px;
                    margin-bottom: 8px;
                    background: #f1f5f9;
                    border-radius: 7px;
                    border-left: 3px solid #14b8a6;
                ">
                    <div style="
                        font-size: 9px;
                        font-weight: 700;
                        color: #64748b;
                        margin-bottom: 3px;
                        text-transform: uppercase;
                    ">
                        Village
                    </div>

                    <div style="
                        font-size: 12px;
                        font-weight: 800;
                        color: #0f172a;
                    ">
                        ${villageName || "Unknown Village"}
                    </div>
                </div>

                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                ">

                    <div style="
                        padding: 10px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 7px;
                    ">
                        <div style="
                            font-size: 8px;
                            font-weight: 700;
                            color: #64748b;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                        ">
                            Population
                        </div>

                        <div style="
                            font-size: 17px;
                            font-weight: 800;
                            color: #0f172a;
                        ">
                            ${formatNumber(population)}
                        </div>
                    </div>

                    <div style="
                        padding: 10px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 7px;
                    ">
                        <div style="
                            font-size: 8px;
                            font-weight: 700;
                            color: #64748b;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                        ">
                            Households
                        </div>

                        <div style="
                            font-size: 17px;
                            font-weight: 800;
                            color: #0f172a;
                        ">
                            ${formatNumber(displayHouseholds)}
                        </div>
                    </div>

                </div>

            </div>
        `)
    }

    return (
        <GeoJSON
            data={villages}
            style={{
                color: "#7dd3c7",
                weight: 1,
                fillColor: "#7dd3c7",
                fillOpacity: 0.08,
            }}
            onEachFeature={onEachFeature}
        />
    )
}

export default VillageLayer