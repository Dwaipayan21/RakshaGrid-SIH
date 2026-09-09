"""
RakshaGrid Batch Risk Processor

Pipeline:

    Load settlement data
            ↓
        Validate
            ↓
     Select Hazard Adapter
            ↓
      Normalize inputs
            ↓
       Calculate H/E/V/A/C
            ↓
       Calculate risk
            ↓
       Rank settlements
            ↓
      Save risk results

Current implementation:
    Flood adapter is fully operational.

IMPORTANT:
The settlement dataset currently contains prototype/sample data.
"""

from pathlib import Path
import json

from jsonschema import Draft202012Validator

from core.scoring import calculate_risk

from core.hazard_dispatcher import (
    get_hazard_adapter,
)

from preprocessing.normalization import (
    normalize_population,
    normalize_population_density,
    normalize_vulnerability,
    normalize_travel_time,
    normalize_road_accessibility,
    normalize_shelter_capacity,
    calculate_exposure_score,
    calculate_accessibility_score,
)


# =========================================================
# Project paths
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "settlements.json"
)

SCHEMA_FILE = (
    BASE_DIR
    / "data"
    / "metadata"
    / "settlement_schema.json"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "risk_results.json"
)


# =========================================================
# Load JSON
# =========================================================

def load_json(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


# =========================================================
# Validate settlements
# =========================================================

def validate_settlements(settlements):

    schema = load_json(
        SCHEMA_FILE
    )

    validator = Draft202012Validator(
        schema
    )

    errors_found = False

    print("\nValidating settlement data...")
    print("-" * 70)

    for settlement in settlements:

        settlement_name = settlement.get(
            "settlement_name",
            "UNKNOWN",
        )

        errors = sorted(
            validator.iter_errors(settlement),
            key=lambda error: list(error.path),
        )

        if errors:

            errors_found = True

            print(
                f"INVALID: {settlement_name}"
            )

            for error in errors:

                field = ".".join(
                    str(item)
                    for item in error.path
                )

                if field:

                    print(
                        f"  - {field}: {error.message}"
                    )

                else:

                    print(
                        f"  - {error.message}"
                    )

        else:

            print(
                f"VALID:   {settlement_name}"
            )

    print("-" * 70)

    if errors_found:

        raise ValueError(
            "Settlement validation failed. "
            "Risk processing has been stopped."
        )

    print(
        "All settlement records passed validation."
    )


# =========================================================
# Process one settlement
# =========================================================

def process_settlement(settlement):

    # -----------------------------------------------------
    # Select hazard-specific adapter
    # -----------------------------------------------------

    hazard_type = settlement[
        "hazard_type"
    ]

    hazard_adapter = get_hazard_adapter(
        hazard_type
    )

    # -----------------------------------------------------
    # Calculate hazard score
    #
    # The adapter owns hazard-specific logic.
    # -----------------------------------------------------

    hazard_score = (
        hazard_adapter.calculate_hazard_score(
            settlement
        )
    )

    # -----------------------------------------------------
    # Exposure
    # -----------------------------------------------------

    population_score = normalize_population(
        settlement["population"]
    )

    density_score = normalize_population_density(
        settlement["population_density"]
    )

    exposure_score = calculate_exposure_score(
        population_score,
        density_score,
    )

    # -----------------------------------------------------
    # Vulnerability
    # -----------------------------------------------------

    vulnerability_score = normalize_vulnerability(
        settlement["vulnerability_score"]
    )

    # -----------------------------------------------------
    # Accessibility
    # -----------------------------------------------------

    travel_time_score = normalize_travel_time(
        settlement["travel_time_minutes"]
    )

    road_risk_score = normalize_road_accessibility(
        settlement["road_accessibility"]
    )

    accessibility_score = calculate_accessibility_score(
        travel_time_score,
        road_risk_score,
    )

    # -----------------------------------------------------
    # Shelter capacity
    # -----------------------------------------------------

    capacity_score = normalize_shelter_capacity(
        settlement["shelter_capacity"],
        settlement["population"],
    )

    # -----------------------------------------------------
    # Common RakshaGrid risk calculation
    # -----------------------------------------------------

    result = calculate_risk(
        hazard=hazard_score,
        exposure=exposure_score,
        vulnerability=vulnerability_score,
        accessibility=accessibility_score,
        capacity=capacity_score,
    )

    # -----------------------------------------------------
    # Structured result
    # -----------------------------------------------------

    return {
        "settlement_id": settlement[
            "settlement_id"
        ],

        "settlement_name": settlement[
            "settlement_name"
        ],

        "state": settlement[
            "state"
        ],

        "district": settlement[
            "district"
        ],

        "latitude": settlement[
            "latitude"
        ],

        "longitude": settlement[
            "longitude"
        ],

        "hazard_type": hazard_type,

        "risk_score": round(
            result.score,
            2,
        ),

        "priority": result.priority,

        "factors": {
            "hazard": round(
                hazard_score,
                2,
            ),

            "exposure": round(
                exposure_score,
                2,
            ),

            "vulnerability": round(
                vulnerability_score,
                2,
            ),

            "accessibility": round(
                accessibility_score,
                2,
            ),

            "capacity": round(
                capacity_score,
                2,
            ),
        },

        "explanations": result.explanations,
    }


# =========================================================
# Process all settlements
# =========================================================

def process_all():

    settlements = load_json(
        INPUT_FILE
    )

    if not isinstance(
        settlements,
        list,
    ):

        raise ValueError(
            "Settlement input must be a JSON array."
        )

    if len(settlements) == 0:

        raise ValueError(
            "Settlement dataset is empty."
        )

    # -----------------------------------------------------
    # Validate BEFORE risk processing.
    # -----------------------------------------------------

    validate_settlements(
        settlements
    )

    # -----------------------------------------------------
    # Process
    # -----------------------------------------------------

    results = []

    for settlement in settlements:

        result = process_settlement(
            settlement
        )

        results.append(
            result
        )

    # -----------------------------------------------------
    # Highest risk first
    # -----------------------------------------------------

    results.sort(
        key=lambda item: item["risk_score"],
        reverse=True,
    )

    # -----------------------------------------------------
    # Assign ranking
    # -----------------------------------------------------

    for index, result in enumerate(
        results,
        start=1,
    ):

        result["rank"] = index

    return results


# =========================================================
# Save results
# =========================================================

def save_results(results):

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            results,
            file,
            indent=2,
            ensure_ascii=False,
        )


# =========================================================
# Main
# =========================================================

def main():

    print("=" * 70)
    print("RAKSHA​GRID - VALIDATE → ADAPT → PROCESS → RANK")
    print("=" * 70)

    try:

        results = process_all()

    except Exception as error:

        print("\nPROCESSING STOPPED")
        print("-" * 70)

        print(
            f"Reason: {error}"
        )

        return

    save_results(
        results
    )

    print(
        f"\nProcessed settlements: {len(results)}"
    )

    print("\nRisk Ranking")
    print("-" * 70)

    for result in results:

        print(
            f"{result['rank']:>2}. "
            f"{result['settlement_name']:<25} "
            f"Score: {result['risk_score']:>6.2f} "
            f"Priority: {result['priority']} "
            f"Hazard: {result['hazard_type']}"
        )

    print("-" * 70)

    print(
        "\nRisk results saved to:"
    )

    print(
        OUTPUT_FILE
    )


if __name__ == "__main__":
    main()