import pandas as pd
import json
import os

# Census Excel file
file = "data/DDW_PCA0000_2011_Indiastatedist.xlsx"

print("Reading Census data...")

# Read only the columns we need
df = pd.read_excel(
    file,
    usecols=[
        "State",
        "District",
        "Level",
        "Name",
        "TOT_P",
        "TOT_M",
        "TOT_F"
    ]
)

print("Excel loaded successfully!")
print("Total rows:", len(df))

# Assam State Code = 18
assam = df[
    (df["State"] == 18) &
    (df["Level"].astype(str).str.upper() == "DISTRICT")
].copy()

print("\nAssam district rows found:", len(assam))

print("\nAssam districts:")
print(assam[["District", "Name", "TOT_P"]].to_string(index=False))

# Create JSON
result = {}

for _, row in assam.iterrows():

    district_name = str(row["Name"]).strip()

    result[district_name] = {
        "population": int(row["TOT_P"]),
        "male": int(row["TOT_M"]),
        "female": int(row["TOT_F"]),
        "source": "Census 2011"
    }

# Output path
output_file = "data/metadata/assam_population.json"

# Make sure metadata directory exists
os.makedirs("data/metadata", exist_ok=True)

# Write JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("\n--------------------------------")
print("SUCCESS!")
print("--------------------------------")
print(f"Created: {output_file}")
print(f"Districts extracted: {len(result)}")