"""
RakshaGrid Normalization Layer

Converts raw disaster-related measurements into a
common 0-100 risk-factor scale.

Design principles:
    - Higher returned value = higher risk.
    - All normalized values are bounded to 0-100.
    - Invalid numeric values are rejected explicitly.
    - Existing RakshaGrid factor architecture is preserved.

Current calibration:
    The numerical reference ranges are prototype ranges.
    They should be calibrated further against authoritative,
    historical Assam hazard and impact datasets.

Risk factors:
    H = Hazard
    E = Exposure
    V = Vulnerability
    A = Accessibility
    C = Capacity
"""


import math


# =========================================================
# Generic validation utilities
# =========================================================

def _validate_numeric(
    value: float,
    field_name: str,
) -> float:
    """
    Validate that a value is numeric and finite.

    NaN and infinite values are rejected because allowing
    them into a weighted risk calculation can silently
    corrupt the final score.
    """

    if isinstance(value, bool):

        raise ValueError(
            f"{field_name} must be numeric."
        )

    try:

        numeric_value = float(value)

    except (
        TypeError,
        ValueError,
    ):

        raise ValueError(
            f"{field_name} must be numeric."
        )

    if not math.isfinite(
        numeric_value
    ):

        raise ValueError(
            f"{field_name} must be finite."
        )

    return numeric_value


def clamp(
    value: float,
    minimum: float = 0,
    maximum: float = 100,
) -> float:
    """
    Keep a value within a specified range.
    """

    value = _validate_numeric(
        value,
        "value",
    )

    minimum = _validate_numeric(
        minimum,
        "minimum",
    )

    maximum = _validate_numeric(
        maximum,
        "maximum",
    )

    if maximum < minimum:

        raise ValueError(
            "'maximum' must be greater than or equal "
            "to 'minimum'."
        )

    return max(
        minimum,
        min(maximum, value),
    )


def linear_scale(
    value: float,
    low: float,
    high: float,
) -> float:
    """
    Linearly map a raw value to 0-100.

    Values below 'low' become 0.
    Values above 'high' become 100.
    """

    value = _validate_numeric(
        value,
        "value",
    )

    low = _validate_numeric(
        low,
        "low",
    )

    high = _validate_numeric(
        high,
        "high",
    )

    if high <= low:

        raise ValueError(
            "'high' must be greater than 'low'."
        )

    score = (
        (value - low)
        / (high - low)
    ) * 100

    return clamp(score)


def inverse_linear_scale(
    value: float,
    low: float,
    high: float,
) -> float:
    """
    Inverse linear scale.

    Used when a higher raw value means LOWER risk.

    Example:
        More shelter capacity -> lower capacity risk.
    """

    value = _validate_numeric(
        value,
        "value",
    )

    low = _validate_numeric(
        low,
        "low",
    )

    high = _validate_numeric(
        high,
        "high",
    )

    if high <= low:

        raise ValueError(
            "'high' must be greater than 'low'."
        )

    score = (
        (high - value)
        / (high - low)
    ) * 100

    return clamp(score)


# =========================================================
# Flood normalization
# =========================================================

def normalize_rainfall(
    rainfall_mm: float,
) -> float:
    """
    Convert rainfall into flood-risk score.

    Prototype calibration:
        0 mm       -> 0
        150+ mm    -> 100

    Higher rainfall produces higher flood hazard risk.
    """

    rainfall_mm = _validate_numeric(
        rainfall_mm,
        "Rainfall",
    )

    if rainfall_mm < 0:

        raise ValueError(
            "Rainfall cannot be negative."
        )

    return linear_scale(
        rainfall_mm,
        0,
        150,
    )


def normalize_river_level(
    level: float,
    danger_level: float,
) -> float:
    """
    Convert river level relative to the supplied
    danger level into a 0-100 flood-risk score.

    The danger level is treated as the operational
    reference supplied for that river/location.

    Therefore:
        level <= 0            -> 0
        level == danger level -> 100
        level > danger level  -> 100

    Values above the danger level remain maximum risk
    because the factor is already saturated at the
    defined danger threshold.
    """

    level = _validate_numeric(
        level,
        "River level",
    )

    danger_level = _validate_numeric(
        danger_level,
        "Danger level",
    )

    if danger_level <= 0:

        raise ValueError(
            "Danger level must be positive."
        )

    if level < 0:

        raise ValueError(
            "River level cannot be negative."
        )

    return linear_scale(
        level,
        0,
        danger_level,
    )


def normalize_inundation_depth(
    depth_m: float,
) -> float:
    """
    Convert flood inundation depth into a 0-100 score.

    Prototype calibration:
        0 m     -> 0
        2 m+    -> 100
    """

    depth_m = _validate_numeric(
        depth_m,
        "Inundation depth",
    )

    if depth_m < 0:

        raise ValueError(
            "Inundation depth cannot be negative."
        )

    return linear_scale(
        depth_m,
        0,
        2,
    )


def normalize_historical_flood_frequency(
    frequency_score: float,
) -> float:
    """
    Normalize historical flood frequency.

    The current Risk Engine expects the historical
    frequency feature to be supplied as a 0-100
    normalized historical-risk score.

    This function deliberately does NOT assume that
    an integer such as '8' means eight flood events.
    Event counts and risk scores are different quantities
    and must not be silently conflated.

    Future calibration can replace this with a
    location-specific frequency-to-risk transformation
    once authoritative historical village-level event
    counts are available.
    """

    frequency_score = _validate_numeric(
        frequency_score,
        "Historical flood frequency",
    )

    if frequency_score < 0:

        raise ValueError(
            "Historical flood frequency cannot be negative."
        )

    if frequency_score > 100:

        raise ValueError(
            "Historical flood frequency score "
            "must be between 0 and 100."
        )

    return frequency_score


# =========================================================
# Exposure normalization
# =========================================================

def normalize_population_density(
    population_density: float,
    low_density: float = 100,
    high_density: float = 2000,
) -> float:
    """
    Convert population density into exposure risk.

    Higher population density -> higher exposure.

    Current reference range:
        100 persons/km² -> 0
        2000+ persons/km² -> 100
    """

    population_density = _validate_numeric(
        population_density,
        "Population density",
    )

    if population_density < 0:

        raise ValueError(
            "Population density cannot be negative."
        )

    return linear_scale(
        population_density,
        low_density,
        high_density,
    )


def normalize_population(
    population: int,
    reference_population: int = 5000,
) -> float:
    """
    Convert exposed population into exposure risk.

    Current reference:
        0 people       -> 0
        5000+ people   -> 100
    """

    population = _validate_numeric(
        population,
        "Population",
    )

    reference_population = _validate_numeric(
        reference_population,
        "Reference population",
    )

    if population < 0:

        raise ValueError(
            "Population cannot be negative."
        )

    if reference_population <= 0:

        raise ValueError(
            "Reference population must be positive."
        )

    return linear_scale(
        population,
        0,
        reference_population,
    )


# =========================================================
# Vulnerability normalization
# =========================================================

def normalize_vulnerability(
    vulnerability: float,
) -> float:
    """
    Normalize an already-computed vulnerability value.

    Accepted input:
        0-1
        OR
        0-100

    Returns:
        0-100
    """

    vulnerability = _validate_numeric(
        vulnerability,
        "Vulnerability",
    )

    if vulnerability < 0:

        raise ValueError(
            "Vulnerability cannot be negative."
        )

    if vulnerability <= 1:

        vulnerability *= 100

    if vulnerability > 100:

        raise ValueError(
            "Vulnerability must be between "
            "0 and 1 or 0 and 100."
        )

    return vulnerability


# =========================================================
# Accessibility normalization
# =========================================================

def normalize_travel_time(
    travel_time_minutes: float,
) -> float:
    """
    Convert evacuation travel time into accessibility risk.

    Longer travel time -> higher risk.

    Prototype reference:
        0 minutes   -> 0
        120+ min    -> 100
    """

    travel_time_minutes = _validate_numeric(
        travel_time_minutes,
        "Travel time",
    )

    if travel_time_minutes < 0:

        raise ValueError(
            "Travel time cannot be negative."
        )

    return linear_scale(
        travel_time_minutes,
        0,
        120,
    )


def normalize_road_accessibility(
    accessibility_score: float,
) -> float:
    """
    Convert a 0-100 road accessibility score into
    accessibility RISK.

    High road accessibility = low risk.
    Low road accessibility = high risk.
    """

    accessibility_score = _validate_numeric(
        accessibility_score,
        "Road accessibility",
    )

    if (
        accessibility_score < 0
        or accessibility_score > 100
    ):

        raise ValueError(
            "Accessibility score must be "
            "between 0 and 100."
        )

    return 100 - accessibility_score


# =========================================================
# Shelter / response capacity normalization
# =========================================================

def normalize_shelter_capacity(
    available_capacity: int,
    exposed_population: int,
) -> float:
    """
    Convert shelter capacity into capacity risk.

    More available shelter capacity
        -> lower risk.

    Less available shelter capacity
        -> higher risk.

    The score is based on the proportion of exposed
    population that can currently be accommodated.
    """

    available_capacity = _validate_numeric(
        available_capacity,
        "Available shelter capacity",
    )

    exposed_population = _validate_numeric(
        exposed_population,
        "Exposed population",
    )

    if available_capacity < 0:

        raise ValueError(
            "Available capacity cannot be negative."
        )

    if exposed_population <= 0:

        return 0.0

    coverage_ratio = (
        available_capacity
        / exposed_population
    )

    # Full coverage or surplus capacity.
    if coverage_ratio >= 1:

        return 0.0

    # No available capacity.
    if coverage_ratio <= 0:

        return 100.0

    return clamp(
        (1 - coverage_ratio) * 100
    )


# =========================================================
# Composite factor helpers
# =========================================================

def calculate_flood_hazard_score(
    rainfall_score: float,
    river_level_score: float,
    inundation_score: float,
    historical_frequency_score: float,
) -> float:
    """
    Combine flood-specific indicators into one
    0-100 hazard score.

    Current weights:
        Rainfall              25%
        River level           35%
        Inundation            30%
        Historical frequency  10%

    These weights are intentionally preserved so that
    the existing Risk Engine remains compatible with
    the current architecture and tests.
    """

    values = [
        rainfall_score,
        river_level_score,
        inundation_score,
        historical_frequency_score,
    ]

    for value in values:

        value = _validate_numeric(
            value,
            "Flood score",
        )

        if value < 0 or value > 100:

            raise ValueError(
                "All flood scores must be "
                "between 0 and 100."
            )

    score = (
        rainfall_score * 0.25
        + river_level_score * 0.35
        + inundation_score * 0.30
        + historical_frequency_score * 0.10
    )

    return clamp(score)


def calculate_exposure_score(
    population_score: float,
    density_score: float,
) -> float:
    """
    Combine population-related exposure indicators.

    Population contribution = 60%
    Density contribution    = 40%
    """

    for value in [
        population_score,
        density_score,
    ]:

        value = _validate_numeric(
            value,
            "Exposure score",
        )

        if value < 0 or value > 100:

            raise ValueError(
                "Exposure scores must be "
                "between 0 and 100."
            )

    return clamp(
        population_score * 0.60
        + density_score * 0.40
    )


def calculate_accessibility_score(
    travel_time_score: float,
    road_risk_score: float,
) -> float:
    """
    Combine accessibility risk indicators.

    Travel-time contribution = 60%
    Road-risk contribution  = 40%
    """

    for value in [
        travel_time_score,
        road_risk_score,
    ]:

        value = _validate_numeric(
            value,
            "Accessibility score",
        )

        if value < 0 or value > 100:

            raise ValueError(
                "Accessibility scores must be "
                "between 0 and 100."
            )

    return clamp(
        travel_time_score * 0.60
        + road_risk_score * 0.40
    )