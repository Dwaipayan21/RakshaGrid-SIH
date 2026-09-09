"""
RakshaGrid Multi-Hazard Dispatcher Tests

These tests verify that:

1. Flood settlements are routed through the Flood adapter.
2. Hazard type is taken from settlement data.
3. The common risk engine remains hazard-agnostic.
4. Unsupported hazards fail safely.
"""

import pytest

from core.hazard_dispatcher import (
    get_hazard_adapter,
)


# =========================================================
# Sample flood settlement
# =========================================================

FLOOD_SETTLEMENT = {

    "settlement_id":
        "TEST-FLOOD-001",

    "settlement_name":
        "Test Flood Settlement",

    "state":
        "Assam",

    "district":
        "Morigaon",

    "hazard_type":
        "flood",

    "latitude":
        26.25,

    "longitude":
        92.34,

    "rainfall_mm":
        120.0,

    "river_level_m":
        10.5,

    "danger_level_m":
        9.5,

    "inundation_depth_m":
        1.2,

    "historical_flood_frequency":
        8,

    "population":
        5000,

    "population_density":
        1200,

    "vulnerability_score":
        78,

    "travel_time_minutes":
        45,

    "road_accessibility":
        40,

    "shelter_capacity":
        2000,
}


# =========================================================
# Test 1
# Flood adapter is selected
# =========================================================

def test_flood_adapter_is_selected():

    adapter = get_hazard_adapter(
        "flood"
    )

    assert adapter is not None

    assert adapter.hazard_type == "flood"


# =========================================================
# Test 2
# Hazard names are case-insensitive
# =========================================================

def test_hazard_name_is_case_insensitive():

    adapter = get_hazard_adapter(
        "FLOOD"
    )

    assert adapter is not None

    assert adapter.hazard_type == "flood"


# =========================================================
# Test 3
# Flood adapter calculates a valid score
# =========================================================

def test_flood_adapter_calculates_score():

    adapter = get_hazard_adapter(
        FLOOD_SETTLEMENT["hazard_type"]
    )

    score = (
        adapter.calculate_hazard_score(
            FLOOD_SETTLEMENT
        )
    )

    assert isinstance(
        score,
        (int, float),
    )

    assert 0 <= score <= 100


# =========================================================
# Test 4
# Unsupported hazard is rejected
# =========================================================

def test_unsupported_hazard_is_rejected():

    with pytest.raises(
        (ValueError, KeyError)
    ):

        get_hazard_adapter(
            "volcano"
        )


# =========================================================
# Test 5
# Empty hazard is rejected
# =========================================================

def test_empty_hazard_is_rejected():

    with pytest.raises(
        (ValueError, KeyError)
    ):

        get_hazard_adapter(
            ""
        )