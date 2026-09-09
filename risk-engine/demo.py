"""
RakshaGrid Risk Engine Demo

Demonstrates:

Raw measurements
        ↓
Normalization
        ↓
H/E/V/A/C
        ↓
Priority Score
        ↓
P1-P4
"""

from core.scoring import calculate_risk
from core.hazard_profiles import get_hazard_profile

from preprocessing.normalization import (
    normalize_rainfall,
    normalize_river_level,
    normalize_inundation_depth,
    normalize_population,
    normalize_population_density,
    normalize_vulnerability,
    normalize_travel_time,
    normalize_road_accessibility,
    normalize_shelter_capacity,
    calculate_flood_hazard_score,
    calculate_exposure_score,
    calculate_accessibility_score,
)


def main():

    print("=" * 70)
    print("RAKSHAGRID - END-TO-END RISK ENGINE")
    print("=" * 70)

    # -----------------------------------------------------
    # 1. Hazard
    # -----------------------------------------------------

    hazard_profile = get_hazard_profile("flood")

    print(
        f"\nHazard Type: {hazard_profile['name']}"
    )

    # -----------------------------------------------------
    # 2. Raw flood measurements
    # -----------------------------------------------------

    rainfall_mm = 110
    river_level_m = 8.2
    danger_level_m = 9.0
    inundation_depth_m = 1.1
    historical_frequency = 70

    # -----------------------------------------------------
    # 3. Normalize flood measurements
    # -----------------------------------------------------

    rainfall_score = normalize_rainfall(
        rainfall_mm
    )

    river_score = normalize_river_level(
        river_level_m,
        danger_level_m
    )

    inundation_score = normalize_inundation_depth(
        inundation_depth_m
    )

    hazard_score = calculate_flood_hazard_score(
        rainfall_score,
        river_score,
        inundation_score,
        historical_frequency
    )

    # -----------------------------------------------------
    # 4. Exposure
    # -----------------------------------------------------

    population = 4200
    population_density = 1450

    population_score = normalize_population(
        population
    )

    density_score = normalize_population_density(
        population_density
    )

    exposure_score = calculate_exposure_score(
        population_score,
        density_score
    )

    # -----------------------------------------------------
    # 5. Vulnerability
    # -----------------------------------------------------

    vulnerability_score = normalize_vulnerability(
        78
    )

    # -----------------------------------------------------
    # 6. Accessibility
    # -----------------------------------------------------

    travel_time = 75

    road_accessibility = 40

    travel_time_score = normalize_travel_time(
        travel_time
    )

    road_risk_score = normalize_road_accessibility(
        road_accessibility
    )

    accessibility_score = calculate_accessibility_score(
        travel_time_score,
        road_risk_score
    )

    # -----------------------------------------------------
    # 7. Shelter capacity
    # -----------------------------------------------------

    shelter_capacity = 1800

    capacity_score = normalize_shelter_capacity(
        shelter_capacity,
        population
    )

    # -----------------------------------------------------
    # 8. Print normalized factors
    # -----------------------------------------------------

    print("\nNormalized Indicators")
    print("-" * 70)

    print(
        f"Rainfall Score             : {rainfall_score:.2f}"
    )

    print(
        f"River Level Score          : {river_score:.2f}"
    )

    print(
        f"Inundation Score           : {inundation_score:.2f}"
    )

    print(
        f"Flood Hazard Score         : {hazard_score:.2f}"
    )

    print(
        f"Population Exposure Score  : {population_score:.2f}"
    )

    print(
        f"Density Exposure Score     : {density_score:.2f}"
    )

    print(
        f"Exposure Score              : {exposure_score:.2f}"
    )

    print(
        f"Vulnerability Score         : {vulnerability_score:.2f}"
    )

    print(
        f"Accessibility Score         : {accessibility_score:.2f}"
    )

    print(
        f"Capacity Risk Score         : {capacity_score:.2f}"
    )

    # -----------------------------------------------------
    # 9. Final RakshaGrid score
    # -----------------------------------------------------

    result = calculate_risk(
        hazard=hazard_score,
        exposure=exposure_score,
        vulnerability=vulnerability_score,
        accessibility=accessibility_score,
        capacity=capacity_score,
    )

    # -----------------------------------------------------
    # 10. Final result
    # -----------------------------------------------------

    print("\nFinal Risk Assessment")
    print("-" * 70)

    print(
        f"Priority Score : {result.score:.2f}"
    )

    print(
        f"Priority Class : {result.priority}"
    )

    print("\nExplanation:")

    for explanation in result.explanations:

        print(
            f"  - {explanation}"
        )

    print("\nComplete Result:")
    print(
        result.to_dict()
    )


if __name__ == "__main__":
    main()