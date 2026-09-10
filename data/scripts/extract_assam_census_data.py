import json
import re
from pathlib import Path

import pandas as pd


# ============================================================
# FILE LOCATIONS
# ============================================================

ROOT = Path(__file__).resolve().parents[2]

PCA_FILE = ROOT / "data" / "DDW_PCA0000_2011_Indiastatedist.xlsx"
AGE_FILE = ROOT / "data" / "DDW-1800C-14.xls"

OUTPUT_FILE = (
    ROOT
    / "data"
    / "metadata"
    / "assam_population_complete.json"
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def clean(value):
    if pd.isna(value):
        return ""
    return str(value).strip()


def to_int(value):
    if pd.isna(value):
        return 0

    try:
        return int(float(value))
    except:
        return 0


def district_name(value):
    """
    Converts:

    District - Kokrajhar (01)
             ↓
    Kokrajhar
    """

    name = clean(value)

    name = re.sub(
        r"^\s*district\s*-\s*",
        "",
        name,
        flags=re.IGNORECASE
    )

    name = re.sub(
        r"\s*\(\d+\)\s*$",
        "",
        name
    )

    return name.strip().title()


# ============================================================
# 1. POPULATION DATA
# ============================================================

print("\nReading population data...")

if not PCA_FILE.exists():
    raise FileNotFoundError(
        f"Population file not found:\n{PCA_FILE}"
    )

pca = pd.read_excel(
    PCA_FILE,
    sheet_name=0
)

pca.columns = [
    clean(column)
    for column in pca.columns
]

print("Population Excel loaded.")

# Check required columns

if "Name" not in pca.columns:
    raise ValueError(
        "Column 'Name' not found in population Excel."
    )

if "TOT_P" not in pca.columns:
    raise ValueError(
        "Column 'TOT_P' not found in population Excel."
    )


# ============================================================
# KEEP DISTRICT ROWS
# ============================================================

pca["name_clean"] = pca["Name"].apply(clean)

pca = pca[
    pca["name_clean"].str.contains(
        "District -",
        case=False,
        na=False
    )
].copy()

pca["district"] = pca["name_clean"].apply(
    district_name
)

pca["TOT_P"] = pd.to_numeric(
    pca["TOT_P"],
    errors="coerce"
)

pca = pca[
    pca["TOT_P"].notna()
].copy()


population_data = {}

for _, row in pca.iterrows():

    name = row["district"]

    population_data[name] = {
        "population": to_int(row["TOT_P"])
    }

    if "TOT_M" in pca.columns:
        population_data[name]["male"] = to_int(
            row["TOT_M"]
        )

    if "TOT_F" in pca.columns:
        population_data[name]["female"] = to_int(
            row["TOT_F"]
        )


print(
    "Population districts found:",
    len(population_data)
)


# ============================================================
# 2. AGE DATA
# ============================================================

print("\nReading C-14 age data...")

if not AGE_FILE.exists():
    raise FileNotFoundError(
        f"Age file not found:\n{AGE_FILE}"
    )

age = pd.read_excel(
    AGE_FILE,
    sheet_name="Sheet1",
    header=None
)

print("C-14 Excel loaded.")

# According to your inspected file:
#
# Column 3 = Area Name
# Column 4 = Age-group
# Column 5 = Total

age = age.rename(
    columns={
        3: "area_name",
        4: "age_group",
        5: "total"
    }
)

age["area_name"] = age["area_name"].apply(clean)
age["age_group"] = age["age_group"].apply(clean)

age["total"] = pd.to_numeric(
    age["total"],
    errors="coerce"
)


# ============================================================
# KEEP DISTRICT ROWS
# ============================================================

age = age[
    age["area_name"].str.contains(
        "District -",
        case=False,
        na=False
    )
].copy()

age = age[
    age["total"].notna()
].copy()

age["district"] = age["area_name"].apply(
    district_name
)


# ============================================================
# AGE GROUPS
# ============================================================

children_groups = {
    "0-4",
    "5-9",
    "10-14"
}

working_groups = {
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59"
}

elderly_groups = {
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80+"
}


# ============================================================
# CALCULATE AGE DATA
# ============================================================

age_data = {}

for district, rows in age.groupby("district"):

    values = {}

    for _, row in rows.iterrows():

        group = clean(
            row["age_group"]
        )

        values[group] = to_int(
            row["total"]
        )

    children = sum(
        values.get(group, 0)
        for group in children_groups
    )

    working_age = sum(
        values.get(group, 0)
        for group in working_groups
    )

    elderly = sum(
        values.get(group, 0)
        for group in elderly_groups
    )

    all_ages = values.get(
        "All ages",
        0
    )

    age_data[district] = {
        "population_c14": all_ages,
        "children": children,
        "workingAge": working_age,
        "elderly": elderly
    }


print(
    "Age districts found:",
    len(age_data)
)


# ============================================================
# 3. MERGE
# ============================================================

print("\nMerging data...")


final_data = {}

for district in sorted(
    population_data.keys()
):

    if district not in age_data:

        print(
            "WARNING: No age data for:",
            district
        )

        continue

    population = population_data[district]
    age_info = age_data[district]


    # Check population consistency

    if (
        age_info["population_c14"] !=
        population["population"]
    ):

        print(
            "\nWARNING: Population mismatch"
        )

        print(
            district,
            "PCA:",
            population["population"],
            "C14:",
            age_info["population_c14"]
        )


    final_data[district] = {

        "population":
            population["population"],

        "children":
            age_info["children"],

        "workingAge":
            age_info["workingAge"],

        "elderly":
            age_info["elderly"],

        "source":
            "Census 2011"
    }


    # Add male/female if available

    if "male" in population:

        final_data[district]["male"] = (
            population["male"]
        )

    if "female" in population:

        final_data[district]["female"] = (
            population["female"]
        )


# ============================================================
# 4. SAVE JSON
# ============================================================

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        final_data,
        file,
        indent=2,
        ensure_ascii=False
    )


# ============================================================
# DONE
# ============================================================

print("\n===================================")
print("SUCCESS!")
print("===================================")

print(
    "Created:",
    OUTPUT_FILE
)

print(
    "Districts:",
    len(final_data)
)


# Show Morigaon if available

if "Morigaon" in final_data:

    print("\nMorigaon:")

    print(
        json.dumps(
            final_data["Morigaon"],
            indent=2
        )
    )