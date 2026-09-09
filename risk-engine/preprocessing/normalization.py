"""
RakshaGrid Normalization Layer

Converts raw disaster-related measurements into a
common 0-100 risk-factor scale.

IMPORTANT:
The thresholds in this file are PROTOTYPE thresholds.

They are intended for development and demonstration.
They must eventually be calibrated using historical,
official, hazard-specific datasets.

Direction:
    Higher returned value = higher risk.
"""


# ---------------------------------------------------------
# Generic utilities
# ---------------------------------------------------------

def clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
    """
    Keep a value within a specified range.
    """

    return max(
        minimum,
        min(maximum, value)
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

    if high <= low:
        raise ValueError(
            "'high' must be greater than 'low'."
        )

    score = (
        (high - value)
        / (high - low)
    ) * 100

    return clamp(score)


# ---------------------------------------------------------
# Flood normalization
# ---------------------------------------------------------

def normalize_rainfall(
    rainfall_mm: float,
) -> float:
    """
    Prototype rainfall hazard score.

    0 mm       -> approximately 0
    150+ mm    -> 100

    These thresholds must eventually be calibrated
    using historical rainfall-impact relationships.
    """

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
    Convert river level relative to danger level
    into a 0-100 risk score.

    Below danger level -> lower score.
    At danger level    -> 100.

    This is a simplified prototype relationship.
    """

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

    0 m     -> 0
    2 m+    -> 100
    """

    if depth_m < 0:
        raise ValueError(
            "Inundation depth cannot be negative."
        )

    return linear_scale(
        depth_m,
        0,
        2,
    )


# ---------------------------------------------------------
# Exposure normalization
# ---------------------------------------------------------

def normalize_population_density(
    population_density: float,
    low_density: float = 100,
    high_density: float = 2000,
) -> float:
    """
    Convert population density into an exposure score.

    Higher population density -> higher exposure.

    Thresholds are prototype values.
    """

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
    Convert exposed population into a 0-100 score.

    Prototype reference:
        5,000+ people -> 100
    """

    if population < 0:
        raise ValueError(
            "Population cannot be negative."
        )

    return linear_scale(
        population,
        0,
        reference_population,
    )


# ---------------------------------------------------------
# Vulnerability normalization
# ---------------------------------------------------------

def normalize_vulnerability(
    vulnerability: float,
) -> float:
    """
    Normalize an already-computed vulnerability value.

    Expected input:
        0-1 OR 0-100.

    Returns:
        0-100.
    """

    if vulnerability < 0:
        raise ValueError(
            "Vulnerability cannot be negative."
        )

    if vulnerability <= 1:
        vulnerability *= 100

    if vulnerability > 100:
        raise ValueError(
            "Vulnerability must be between 0 and 1 or 0 and 100."
        )

    return vulnerability


# ---------------------------------------------------------
# Accessibility normalization
# ---------------------------------------------------------

def normalize_travel_time(
    travel_time_minutes: float,
) -> float:
    """
    Convert evacuation travel time into accessibility risk.

    Longer travel time -> higher risk.

    Prototype:
        0 minutes  -> 0
        120+ min   -> 100
    """

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

    Important:
        This function reverses the direction.

    High road accessibility = low risk.
    Low road accessibility = high risk.
    """

    if accessibility_score < 0 or accessibility_score > 100:
        raise ValueError(
            "Accessibility score must be between 0 and 100."
        )

    return 100 - accessibility_score


# ---------------------------------------------------------
# Shelter / response capacity normalization
# ---------------------------------------------------------

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

    Formula is based on the proportion of exposed
    population that can currently be accommodated.
    """

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

    # 100% coverage or more = 0 risk
    if coverage_ratio >= 1:
        return 0.0

    # No available capacity = maximum risk
    if coverage_ratio <= 0:
        return 100.0

    return clamp(
        (1 - coverage_ratio) * 100
    )


# ---------------------------------------------------------
# Composite factor helpers
# ---------------------------------------------------------

def calculate_flood_hazard_score(
    rainfall_score: float,
    river_level_score: float,
    inundation_score: float,
    historical_frequency_score: float,
) -> float:
    """
    Combine flood-specific indicators into
    one 0-100 hazard score.

    Prototype weights:
        Rainfall              25%
        River level           35%
        Inundation            30%
        Historical frequency  10%
    """

    values = [
        rainfall_score,
        river_level_score,
        inundation_score,
        historical_frequency_score,
    ]

    for value in values:

        if value < 0 or value > 100:
            raise ValueError(
                "All flood scores must be between 0 and 100."
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
    """

    for value in [
        population_score,
        density_score,
    ]:

        if value < 0 or value > 100:
            raise ValueError(
                "Exposure scores must be between 0 and 100."
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
    """

    for value in [
        travel_time_score,
        road_risk_score,
    ]:

        if value < 0 or value > 100:
            raise ValueError(
                "Accessibility scores must be between 0 and 100."
            )

    return clamp(
        travel_time_score * 0.60
        + road_risk_score * 0.40
    )