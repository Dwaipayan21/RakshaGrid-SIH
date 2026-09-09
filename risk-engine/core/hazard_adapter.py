"""
RakshaGrid Hazard Adapter Architecture

Provides a common interface for hazard-specific
risk calculations.

Each hazard can implement its own hazard scoring logic
while sharing the common RakshaGrid H/E/V/A/C framework.
"""


from abc import ABC, abstractmethod


class HazardAdapter(ABC):
    """
    Base interface for all RakshaGrid hazard modules.
    """

    hazard_type = None

    @abstractmethod
    def calculate_hazard_score(self, settlement):
        """
        Calculate hazard intensity/risk score from
        hazard-specific indicators.

        Returns:
            float: score between 0 and 100
        """
        raise NotImplementedError

    @abstractmethod
    def get_required_indicators(self):
        """
        Return the indicators required by this hazard.
        """
        raise NotImplementedError


class FloodAdapter(HazardAdapter):
    """
    Flood hazard adapter.

    The actual flood calculations currently remain
    inside the existing normalization module.
    """

    hazard_type = "flood"

    def calculate_hazard_score(self, settlement):
        """
        Placeholder interface.

        Existing flood calculations will be connected
        here without changing the common scoring engine.
        """

        from preprocessing.normalization import (
            normalize_rainfall,
            normalize_river_level,
            normalize_inundation_depth,
            calculate_flood_hazard_score,
        )

        rainfall_score = normalize_rainfall(
            settlement["rainfall_mm"]
        )

        river_score = normalize_river_level(
            settlement["river_level_m"],
            settlement["danger_level_m"],
        )

        inundation_score = normalize_inundation_depth(
            settlement["inundation_depth_m"]
        )

        return calculate_flood_hazard_score(
            rainfall_score,
            river_score,
            inundation_score,
            settlement["historical_flood_frequency"],
        )

    def get_required_indicators(self):

        return [
            "rainfall_mm",
            "river_level_m",
            "danger_level_m",
            "inundation_depth_m",
            "historical_flood_frequency",
        ]


class LandslideAdapter(HazardAdapter):
    """
    Landslide hazard adapter.

    Calculation will be implemented after the required
    landslide datasets are integrated.
    """

    hazard_type = "landslide"

    def calculate_hazard_score(self, settlement):

        raise NotImplementedError(
            "Landslide hazard model is not implemented yet."
        )

    def get_required_indicators(self):

        return [
            "rainfall_mm",
            "slope_degrees",
            "elevation_m",
            "land_use",
            "lithology",
            "historical_landslide_frequency",
        ]


class ForestFireAdapter(HazardAdapter):
    """
    Forest fire hazard adapter.
    """

    hazard_type = "forest_fire"

    def calculate_hazard_score(self, settlement):

        raise NotImplementedError(
            "Forest fire hazard model is not implemented yet."
        )

    def get_required_indicators(self):

        return [
            "temperature_c",
            "relative_humidity",
            "wind_speed_kmph",
            "rainfall_mm",
            "forest_fuel_load",
            "historical_fire_frequency",
        ]


class EarthquakeAdapter(HazardAdapter):
    """
    Earthquake impact hazard adapter.

    Important:
    This is intended for impact/damage risk, not
    deterministic earthquake prediction.
    """

    hazard_type = "earthquake"

    def calculate_hazard_score(self, settlement):

        raise NotImplementedError(
            "Earthquake impact model is not implemented yet."
        )

    def get_required_indicators(self):

        return [
            "seismic_hazard",
            "building_vulnerability",
            "population_exposure",
            "historical_damage",
        ]