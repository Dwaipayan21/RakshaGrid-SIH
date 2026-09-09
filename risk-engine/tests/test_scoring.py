import pytest

from core.scoring import (
    calculate_risk,
    classify_priority,
)


def test_p1_risk():

    result = calculate_risk(
        hazard=100,
        exposure=100,
        vulnerability=100,
        accessibility=100,
        capacity=100,
    )

    assert result.score == 100
    assert result.priority == "P1"


def test_p4_risk():

    result = calculate_risk(
        hazard=0,
        exposure=0,
        vulnerability=0,
        accessibility=0,
        capacity=0,
    )

    assert result.score == 0
    assert result.priority == "P4"


def test_priority_thresholds():

    assert classify_priority(75) == "P1"
    assert classify_priority(74.99) == "P2"

    assert classify_priority(50) == "P2"
    assert classify_priority(49.99) == "P3"

    assert classify_priority(25) == "P3"
    assert classify_priority(24.99) == "P4"


def test_invalid_factor():

    with pytest.raises(ValueError):

        calculate_risk(
            hazard=101,
            exposure=50,
            vulnerability=50,
            accessibility=50,
            capacity=50,
        )


def test_weighted_score():

    result = calculate_risk(
        hazard=100,
        exposure=50,
        vulnerability=50,
        accessibility=50,
        capacity=50,
    )

    expected = (
        100 * 0.40
        + 50 * 0.20
        + 50 * 0.15
        + 50 * 0.10
        + 50 * 0.15
    )

    assert result.score == expected