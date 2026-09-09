"""
RakshaGrid End-to-End Pipeline Tests

Tests:

1. Valid settlement dataset is processed.
2. Results are correctly ranked.
3. Invalid settlement data is rejected.
4. Invalid data does not enter risk processing.
"""

import copy

import pytest

from inference.batch_processor import (
    load_json,
    process_all,
    validate_settlements,
    INPUT_FILE,
)


# =========================================================
# Test 1: Valid dataset processing
# =========================================================

def test_valid_dataset_processing():

    results = process_all()

    assert len(results) == 5

    for result in results:

        assert "settlement_id" in result
        assert "settlement_name" in result
        assert "risk_score" in result
        assert "priority" in result
        assert "factors" in result
        assert "explanations" in result


# =========================================================
# Test 2: Results are sorted by risk
# =========================================================

def test_results_are_ranked_descending():

    results = process_all()

    scores = [
        result["risk_score"]
        for result in results
    ]

    assert scores == sorted(
        scores,
        reverse=True,
    )


# =========================================================
# Test 3: Ranking numbers are sequential
# =========================================================

def test_ranking_is_sequential():

    results = process_all()

    ranks = [
        result["rank"]
        for result in results
    ]

    assert ranks == [1, 2, 3, 4, 5]


# =========================================================
# Test 4: Invalid settlement is rejected
# =========================================================

def test_invalid_settlement_is_rejected():

    settlements = load_json(
        INPUT_FILE
    )

    invalid_settlements = copy.deepcopy(
        settlements
    )

    # Deliberately corrupt one record.
    invalid_settlements[0].pop(
        "population"
    )

    with pytest.raises(ValueError):

        validate_settlements(
            invalid_settlements
        )


# =========================================================
# Test 5: Invalid coordinate is rejected
# =========================================================

def test_invalid_coordinate_is_rejected():

    settlements = load_json(
        INPUT_FILE
    )

    invalid_settlements = copy.deepcopy(
        settlements
    )

    # Invalid latitude.
    invalid_settlements[0]["latitude"] = 150

    with pytest.raises(ValueError):

        validate_settlements(
            invalid_settlements
        )


# =========================================================
# Test 6: Negative population is rejected
# =========================================================

def test_negative_population_is_rejected():

    settlements = load_json(
        INPUT_FILE
    )

    invalid_settlements = copy.deepcopy(
        settlements
    )

    invalid_settlements[0]["population"] = -500

    with pytest.raises(ValueError):

        validate_settlements(
            invalid_settlements
        )