"""
RakshaGrid Settlement Schema Validator

Validates settlement records against the canonical
settlement schema before they enter the risk engine.
"""

from pathlib import Path
import json

from jsonschema import Draft202012Validator


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

SCHEMA_FILE = (
    BASE_DIR
    / "data"
    / "metadata"
    / "settlement_schema.json"
)

SETTLEMENT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "settlements.json"
)


# ---------------------------------------------------------
# Load JSON
# ---------------------------------------------------------

def load_json(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


# ---------------------------------------------------------
# Validate one settlement
# ---------------------------------------------------------

def validate_settlement(
    settlement,
    validator,
):

    errors = sorted(
        validator.iter_errors(settlement),
        key=lambda error: list(error.path),
    )

    return errors


# ---------------------------------------------------------
# Main
# ---------------------------------------------------------

def main():

    print("=" * 70)
    print("RAKSHAGRID - SETTLEMENT SCHEMA VALIDATOR")
    print("=" * 70)

    schema = load_json(
        SCHEMA_FILE
    )

    settlements = load_json(
        SETTLEMENT_FILE
    )

    validator = Draft202012Validator(
        schema
    )

    valid_count = 0
    invalid_count = 0

    for settlement in settlements:

        errors = validate_settlement(
            settlement,
            validator,
        )

        settlement_name = settlement.get(
            "settlement_name",
            "UNKNOWN",
        )

        if errors:

            invalid_count += 1

            print(
                f"\nINVALID: {settlement_name}"
            )

            for error in errors:

                print(
                    f"  - {error.message}"
                )

        else:

            valid_count += 1

            print(
                f"VALID:   {settlement_name}"
            )

    print("\n" + "-" * 70)

    print(
        f"Valid settlements   : {valid_count}"
    )

    print(
        f"Invalid settlements : {invalid_count}"
    )

    if invalid_count == 0:

        print(
            "\nSchema validation PASSED."
        )

    else:

        print(
            "\nSchema validation FAILED."
        )


if __name__ == "__main__":
    main()