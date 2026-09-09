"""
RakshaGrid Risk Engine API

Exposes the Python risk engine through HTTP so that
the Node/Express backend can consume risk assessments.

Architecture:

    Backend
       |
       | HTTP
       v
    FastAPI
       |
       v
    Settlement Validation
       |
       v
    Hazard Dispatcher
       |
       v
    Hazard Adapter
       |
       v
    H/E/V/A/C Risk Engine
"""


from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from jsonschema import Draft202012Validator

from core.hazard_dispatcher import (
    get_hazard_adapter,
    get_supported_hazards,
)

from inference.batch_processor import (
    process_settlement,
)


# =========================================================
# Project paths
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

SCHEMA_FILE = (
    BASE_DIR
    / "data"
    / "metadata"
    / "settlement_schema.json"
)


# =========================================================
# Load settlement schema
# =========================================================

with open(
    SCHEMA_FILE,
    "r",
    encoding="utf-8",
) as file:

    SETTLEMENT_SCHEMA = (
        __import__("json").load(file)
    )


SETTLEMENT_VALIDATOR = (
    Draft202012Validator(
        SETTLEMENT_SCHEMA
    )
)


# =========================================================
# FastAPI application
# =========================================================

app = FastAPI(
    title="RakshaGrid Risk Engine",
    description=(
        "Multi-hazard disaster risk assessment "
        "engine for RakshaGrid."
    ),
    version="1.0.0",
)


# =========================================================
# Request model
# =========================================================

class RiskAssessmentRequest(
    BaseModel
):
    """
    Generic settlement request.

    The actual settlement fields are validated
    against settlement_schema.json so that the
    schema remains the source of truth.
    """

    settlement: dict[str, Any] = Field(
        ...
    )


# =========================================================
# Health endpoint
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "UP",
        "service": "RakshaGrid Risk Engine",
        "version": "1.0.0",
    }


# =========================================================
# Supported hazards
# =========================================================

@app.get("/hazards")
def supported_hazards():

    return {
        "hazards": get_supported_hazards()
    }


# =========================================================
# Risk assessment endpoint
# =========================================================

@app.post("/api/v1/risk/assess")
def assess_risk(
    request: RiskAssessmentRequest,
):

    settlement = request.settlement

    # -----------------------------------------------------
    # Validate settlement against project schema
    # -----------------------------------------------------

    validation_errors = sorted(
        SETTLEMENT_VALIDATOR.iter_errors(
            settlement
        ),
        key=lambda error: list(
            error.path
        ),
    )

    if validation_errors:

        errors = []

        for error in validation_errors:

            field = ".".join(
                str(item)
                for item in error.path
            )

            errors.append(
                {
                    "field": field,
                    "message": error.message,
                }
            )

        raise HTTPException(
            status_code=422,
            detail={
                "message": (
                    "Settlement validation failed."
                ),
                "errors": errors,
            },
        )

    # -----------------------------------------------------
    # Verify hazard adapter
    # -----------------------------------------------------

    hazard_type = settlement.get(
        "hazard_type"
    )

    try:

        adapter = get_hazard_adapter(
            hazard_type
        )

    except (
        ValueError,
        KeyError,
        AttributeError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail={
                "message": str(error),
            },
        )

    # -----------------------------------------------------
    # Process risk
    # -----------------------------------------------------

    try:

        result = process_settlement(
            settlement
        )

    except NotImplementedError as error:

        raise HTTPException(
            status_code=501,
            detail={
                "message": str(error),
                "hazard": hazard_type,
            },
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail={
                "message": (
                    "Risk assessment failed."
                ),
                "error": str(error),
            },
        )

    # -----------------------------------------------------
    # API response
    # -----------------------------------------------------

    return {
        "status": "success",

        "hazard": adapter.hazard_type,

        "result": result,
    }