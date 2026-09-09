"""
RakshaGrid Hazard Dispatcher

Selects the appropriate hazard adapter based on
the requested hazard type.
"""


from core.hazard_adapter import (
    FloodAdapter,
    LandslideAdapter,
    ForestFireAdapter,
    EarthquakeAdapter,
)


HAZARD_ADAPTERS = {
    "flood": FloodAdapter,
    "landslide": LandslideAdapter,
    "forest_fire": ForestFireAdapter,
    "earthquake": EarthquakeAdapter,
}


def get_hazard_adapter(hazard_type):
    """
    Return the adapter associated with a hazard type.
    """

    hazard_type = hazard_type.lower().strip()

    adapter_class = HAZARD_ADAPTERS.get(
        hazard_type
    )

    if adapter_class is None:

        supported = ", ".join(
            sorted(HAZARD_ADAPTERS.keys())
        )

        raise ValueError(
            f"Unsupported hazard type: "
            f"{hazard_type}. "
            f"Supported hazards: {supported}"
        )

    return adapter_class()


def get_supported_hazards():

    return sorted(
        HAZARD_ADAPTERS.keys()
    )