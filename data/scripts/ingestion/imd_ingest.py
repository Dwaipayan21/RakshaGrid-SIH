from pathlib import Path
from datetime import datetime, timezone
import json
import requests


# Project root
BASE_DIR = Path(__file__).resolve().parents[3]

# Raw weather data directory
RAW_WEATHER_DIR = BASE_DIR / "data" / "raw" / "weather"

RAW_WEATHER_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# Official IMD API endpoints
IMD_APIS = {
    "district_rainfall":
        "https://mausam.imd.gov.in/api/districtwise_rainfall_api.php",

    "district_warning":
        "https://mausam.imd.gov.in/api/warnings_district_api.php",

    "state_rainfall":
        "https://mausam.imd.gov.in/api/statewise_rainfall_api.php"
}


def fetch_api(api_name, url):
    print(f"\nFetching: {api_name}")
    print(f"URL: {url}")

    try:
        response = requests.get(
            url,
            timeout=30
        )

        response.raise_for_status()

        print(f"HTTP Status: {response.status_code}")

        try:
            data = response.json()

        except ValueError:
            print("Response is not JSON.")
            data = response.text

        return data

    except requests.RequestException as error:
        print(f"Request failed: {error}")
        return None


def save_raw_data(api_name, data):

    if data is None:
        print(f"No data received for {api_name}")
        return

    timestamp = datetime.now(
        timezone.utc
    ).strftime("%Y%m%dT%H%M%SZ")

    output_file = (
        RAW_WEATHER_DIR /
        f"{api_name}_{timestamp}.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            indent=2,
            ensure_ascii=False
        )

    print(f"Saved: {output_file}")


def main():

    print("=" * 60)
    print("RAKSHAGRID - IMD DATA INGESTION")
    print("=" * 60)

    for api_name, url in IMD_APIS.items():

        data = fetch_api(
            api_name,
            url
        )

        save_raw_data(
            api_name,
            data
        )

    print("\nIMD ingestion completed.")


if __name__ == "__main__":
    main()