"""
Tests for RakshaGrid hazard adapter architecture.
"""


import pytest

from core.hazard_dispatcher import (
    get_hazard_adapter,
    get_supported_hazards,
)


def test_supported_hazards():

    hazards = get_supported_hazards()

    assert "flood" in hazards
    assert "landslide" in hazards
    assert "forest_fire" in hazards
    assert "earthquake" in hazards


def test_flood_adapter():

    adapter = get_hazard_adapter(
        "flood"
    )

    assert adapter.hazard_type == "flood"


def test_landslide_adapter():

    adapter = get_hazard_adapter(
        "landslide"
    )

    assert adapter.hazard_type == "landslide"


def test_forest_fire_adapter():

    adapter = get_hazard_adapter(
        "forest_fire"
    )

    assert adapter.hazard_type == "forest_fire"


def test_earthquake_adapter():

    adapter = get_hazard_adapter(
        "earthquake"
    )

    assert adapter.hazard_type == "earthquake"


def test_unsupported_hazard():

    with pytest.raises(ValueError):

        get_hazard_adapter(
            "volcano"
        )


def test_hazard_name_is_case_insensitive():

    adapter = get_hazard_adapter(
        "FLOOD"
    )

    assert adapter.hazard_type == "flood"