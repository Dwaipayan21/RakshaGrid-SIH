import pandas as pd
import json

# C-14 Assam file
file = "data/DDW-1800C-14.xls"

print("Reading C-14 data...")

# Read the sheet without assuming the first rows are headers
df = pd.read_excel(
    file,
    sheet_name="Sheet1",
    header=None
)

print("Excel loaded!")
print("Rows:", len(df))
print("Columns:", len(df.columns))

# --------------------------------------------------
# IMPORTANT:
# From your inspection:
#
# Column 1 = State
# Column 2 = District Code
# Column 3 = Area Name
# Column 4 = Age-group
# Column 5 = Total
# --------------------------------------------------

# Rename the important columns
df = df.rename(columns={
    1: "state",
    2: "district_code",
    3: "area_name",
    4: "age_group",
    5: "total"
})

# Keep only the columns we need
df = df[
    ["state", "district_code", "area_name", "age_group", "total"]
]

# --------------------------------------------------
# Keep district-level rows
# District code should be present.
# We also remove rows that are clearly state-level.
# --------------------------------------------------

df["district_code"] = pd.to_numeric(
    df["district_code"],
    errors="coerce"
)

# Remove rows without a district code
df = df[df["district_code"].notna()]

# Convert population to numbers
df["total"] = pd.to_numeric(
    df["total"],
    errors="coerce"
)

# Remove invalid population rows
df = df[df["total"].notna()]

# Clean age-group text
df["age_group"] = (
    df["age_group"]
    .astype(str)
    .str.strip()
)

# --------------------------------------------------
# Show what age groups we found
# --------------------------------------------------

print("\nAGE GROUPS FOUND:")

age_groups = df["age_group"].unique()

for age in age_groups:
    print(age)

# --------------------------------------------------
# Define age categories for RakshaGrid
# --------------------------------------------------

children_groups = [
    "0-4",
    "5-9",
    "10-14"
]

working_age_groups = [
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59"
]

elderly_groups = [
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80+"
]

# --------------------------------------------------
# Create result
# --------------------------------------------------

result = {}

for district_code, district_df in df.groupby("district_code"):

    # Get district name
    district_name = district_df["area_name"].iloc[0]

    district_name = str(district_name).strip()

    # Population by age group
    age_data = dict(
        zip(
            district_df["age_group"],
            district_df["total"]
        )
    )

    # Calculate categories
    children = sum(
        age_data.get(age, 0)
        for age in children_groups
    )

    working_age = sum(
        age_data.get(age, 0)
        for age in working_age_groups
    )

    elderly = sum(
        age_data.get(age, 0)
        for age in elderly_groups
    )

    # All ages
    population = age_data.get("All ages", 0)

    result[district_name] = {
        "population": int(population),
        "children": int(children),
        "workingAge": int(working_age),
        "elderly": int(elderly),
        "source": "Census 2011 C-14"
    }

# --------------------------------------------------
# Save JSON
# --------------------------------------------------

output_file = "data/metadata/assam_age_population.json"

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(
        result,
        f,
        indent=2,
        ensure_ascii=False
    )

print("\n--------------------------------")
print("SUCCESS!")
print("--------------------------------")

print("Created:", output_file)
print("Districts:", len(result))

print("\nSample data:")

for district, data in list(result.items())[:5]:
    print(district, "=>", data)