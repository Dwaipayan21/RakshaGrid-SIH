"""
RakshaGrid hazard profiles.

These profiles define how hazard-specific measurements
will eventually be converted into a common 0-100
Hazard Intensity score.

The actual conversion functions will be connected
to real datasets later.
"""


HAZARD_PROFILES = {

    "flood": {
        "name": "Flood",
        "indicators": [
            "rainfall",
            "river_level",
            "inundation_depth",
            "historical_flood_frequency",
        ],
    },

    "landslide": {
        "name": "Landslide",
        "indicators": [
            "rainfall",
            "slope",
            "elevation",
            "soil_or_lithology",
            "historical_landslides",
        ],
    },

    "forest_fire": {
        "name": "Forest Fire",
        "indicators": [
            "temperature",
            "humidity",
            "wind_speed",
            "rainfall",
            "fuel_load",
            "historical_fire_activity",
        ],
    },

    "earthquake": {
        "name": "Earthquake",
        "indicators": [
            "ground_shaking",
            "magnitude",
            "depth",
            "distance_from_epicenter",
            "building_vulnerability",
        ],
    },

    "lightning": {
        "name": "Lightning",
        "indicators": [
            "lightning_probability",
            "thunderstorm_activity",
            "atmospheric_instability",
        ],
    },

    "cyclone": {
        "name": "Cyclone",
        "indicators": [
            "cyclone_distance",
            "wind_speed",
            "rainfall",
            "storm_surge",
            "forecast_track_uncertainty",
        ],
    },

    "extreme_rainfall": {
        "name": "Extreme Rainfall",
        "indicators": [
            "rainfall_intensity",
            "rainfall_accumulation",
            "forecast_probability",
        ],
    },

    "thunderstorm": {
        "name": "Thunderstorm",
        "indicators": [
            "storm_probability",
            "wind_speed",
            "rainfall",
            "lightning_probability",
        ],
    },

    "heatwave": {
        "name": "Heat Wave",
        "indicators": [
            "maximum_temperature",
            "minimum_temperature",
            "heat_index",
            "temperature_anomaly",
        ],
    },

    "coldwave": {
        "name": "Cold Wave",
        "indicators": [
            "minimum_temperature",
            "temperature_anomaly",
            "wind_chill",
        ],
    },

    "drought": {
        "name": "Drought",
        "indicators": [
            "rainfall_deficit",
            "soil_moisture",
            "vegetation_stress",
            "water_availability",
        ],
    },

    "cloudburst": {
        "name": "Cloudburst",
        "indicators": [
            "short_duration_rainfall",
            "rainfall_intensity",
            "terrain_slope",
        ],
    },

    "storm_surge": {
        "name": "Storm Surge",
        "indicators": [
            "surge_height",
            "cyclone_intensity",
            "coastal_elevation",
            "distance_from_coast",
        ],
    },

    "tsunami": {
        "name": "Tsunami",
        "indicators": [
            "wave_height",
            "arrival_time",
            "coastal_elevation",
            "distance_from_coast",
        ],
    },
}


def get_hazard_profile(
    hazard_type: str
) -> dict:

    hazard_type = hazard_type.lower().strip()

    if hazard_type not in HAZARD_PROFILES:
        raise ValueError(
            f"Unsupported hazard type: {hazard_type}"
        )

    return HAZARD_PROFILES[hazard_type]