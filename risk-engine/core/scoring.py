"""
RakshaGrid Risk Scoring Engine

Core explainable risk scoring logic.

Priority Score:
    0.40 * Hazard
  + 0.20 * Exposure
  + 0.15 * Vulnerability
  + 0.10 * Accessibility
  + 0.15 * Capacity

All input factors are expected on a 0-100 scale.
"""

from dataclasses import dataclass
from typing import Dict


# ---------------------------------------------------------
# Risk weights
# ---------------------------------------------------------

WEIGHTS = {
    "hazard": 0.40,
    "exposure": 0.20,
    "vulnerability": 0.15,
    "accessibility": 0.10,
    "capacity": 0.15,
}


# ---------------------------------------------------------
# Priority thresholds
# ---------------------------------------------------------

PRIORITY_THRESHOLDS = {
    "P1": 75,
    "P2": 50,
    "P3": 25,
}


# ---------------------------------------------------------
# Result object
# ---------------------------------------------------------

@dataclass
class RiskResult:
    score: float
    priority: str
    factors: Dict[str, float]
    contributions: Dict[str, float]
    explanations: list[str]

    def to_dict(self) -> dict:
        """
        Convert the result into a JSON-compatible dictionary.
        """

        return {
            "score": round(self.score, 2),
            "priority": self.priority,
            "factors": {
                key: round(value, 2)
                for key, value in self.factors.items()
            },
            "contributions": {
                key: round(value, 2)
                for key, value in self.contributions.items()
            },
            "explanations": self.explanations,
        }


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

def validate_factor(name: str, value: float) -> float:
    """
    Validate and normalize a risk factor.

    Every factor must lie between 0 and 100.
    """

    if not isinstance(value, (int, float)):
        raise TypeError(
            f"{name} must be a number."
        )

    if value < 0 or value > 100:
        raise ValueError(
            f"{name} must be between 0 and 100."
        )

    return float(value)


# ---------------------------------------------------------
# Priority classification
# ---------------------------------------------------------

def classify_priority(score: float) -> str:
    """
    Convert a numerical score into P1-P4 priority.
    """

    if score >= PRIORITY_THRESHOLDS["P1"]:
        return "P1"

    if score >= PRIORITY_THRESHOLDS["P2"]:
        return "P2"

    if score >= PRIORITY_THRESHOLDS["P3"]:
        return "P3"

    return "P4"


# ---------------------------------------------------------
# Explanation generation
# ---------------------------------------------------------

def generate_explanations(
    hazard: float,
    exposure: float,
    vulnerability: float,
    accessibility: float,
    capacity: float,
) -> list[str]:

    explanations = []

    if hazard >= 75:
        explanations.append(
            "Very high hazard intensity."
        )
    elif hazard >= 50:
        explanations.append(
            "High hazard intensity."
        )
    elif hazard >= 25:
        explanations.append(
            "Moderate hazard intensity."
        )

    if exposure >= 75:
        explanations.append(
            "Very high population or asset exposure."
        )
    elif exposure >= 50:
        explanations.append(
            "High population or asset exposure."
        )

    if vulnerability >= 75:
        explanations.append(
            "Very high settlement vulnerability."
        )
    elif vulnerability >= 50:
        explanations.append(
            "High settlement vulnerability."
        )

    if accessibility >= 75:
        explanations.append(
            "Poor accessibility or evacuation connectivity."
        )
    elif accessibility >= 50:
        explanations.append(
            "Limited accessibility or evacuation connectivity."
        )

    if capacity >= 75:
        explanations.append(
            "Very limited response or shelter capacity."
        )
    elif capacity >= 50:
        explanations.append(
            "Limited response or shelter capacity."
        )

    if not explanations:
        explanations.append(
            "No major risk factor exceeded the configured warning thresholds."
        )

    return explanations


# ---------------------------------------------------------
# Main risk calculation
# ---------------------------------------------------------

def calculate_risk(
    hazard: float,
    exposure: float,
    vulnerability: float,
    accessibility: float,
    capacity: float,
) -> RiskResult:
    """
    Calculate the RakshaGrid priority score.

    Formula:

        Score =
            0.40H +
            0.20E +
            0.15V +
            0.10A +
            0.15C
    """

    hazard = validate_factor(
        "hazard",
        hazard
    )

    exposure = validate_factor(
        "exposure",
        exposure
    )

    vulnerability = validate_factor(
        "vulnerability",
        vulnerability
    )

    accessibility = validate_factor(
        "accessibility",
        accessibility
    )

    capacity = validate_factor(
        "capacity",
        capacity
    )

    factors = {
        "hazard": hazard,
        "exposure": exposure,
        "vulnerability": vulnerability,
        "accessibility": accessibility,
        "capacity": capacity,
    }

    contributions = {
        name: value * WEIGHTS[name]
        for name, value in factors.items()
    }

    score = sum(
        contributions.values()
    )

    priority = classify_priority(
        score
    )

    explanations = generate_explanations(
        hazard,
        exposure,
        vulnerability,
        accessibility,
        capacity,
    )

    return RiskResult(
        score=score,
        priority=priority,
        factors=factors,
        contributions=contributions,
        explanations=explanations,
    )