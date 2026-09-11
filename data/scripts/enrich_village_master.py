import pandas as pd
from pathlib import Path

# ============================================================
# RakshaGrid - Village Master Preparation
# ============================================================

ROOT = Path(__file__).resolve().parents[2]

INPUT = ROOT / "data" / "processed" / "village_master.csv"
OUTPUT = ROOT / "data" / "processed" / "village_master_enriched.csv"

print("Loading village master...")
df = pd.read_csv(INPUT)

# ------------------------------------------------------------
# Standardise important Census fields
# ------------------------------------------------------------

rename_map = {
    "State": "state",
    "District": "district",
    "Subdistt": "subdistrict",

    # IMPORTANT:
    # Town/Village contains the official Census village code
    "Town/Village": "census_village_code",

    # Name contains the actual village name
    "Name": "village_name",

    "Ward": "ward",
    "Level": "level",
    "TRU": "rural_urban",
    "No_HH": "households",
    "TOT_P": "population",
}

df = df.rename(columns=rename_map)

# ------------------------------------------------------------
# Keep village records only
# ------------------------------------------------------------

df = df[
    df["level"]
    .astype(str)
    .str.upper()
    .eq("VILLAGE")
].copy()

# ------------------------------------------------------------
# Clean text fields
# ------------------------------------------------------------

text_columns = [
    "state",
    "district",
    "subdistrict",
    "village_name",
    "rural_urban",
]

for col in text_columns:
    if col in df.columns:
        df[col] = (
            df[col]
            .astype(str)
            .str.strip()
            .replace({"nan": ""})
        )

# ------------------------------------------------------------
# Clean Census village code
# ------------------------------------------------------------

df["census_village_code"] = (
    df["census_village_code"]
    .astype(str)
    .str.replace(r"\.0$", "", regex=True)
    .str.strip()
)

# ------------------------------------------------------------
# Numeric fields
# ------------------------------------------------------------

if "population" in df.columns:
    df["population"] = pd.to_numeric(
        df["population"],
        errors="coerce"
    ).fillna(0).astype(int)

if "households" in df.columns:
    df["households"] = pd.to_numeric(
        df["households"],
        errors="coerce"
    ).fillna(0).astype(int)

# ------------------------------------------------------------
# RakshaGrid internal village ID
#
# IMPORTANT:
# census_village_code is the official Census village code.
# rakshagrid_village_id is our own application identifier.
# ------------------------------------------------------------

df["rakshagrid_village_id"] = (
    "AS-"
    + df["census_village_code"]
)

# ------------------------------------------------------------
# Validation
# ------------------------------------------------------------

print()
print("========================================")
print("RAKSHA GRID VILLAGE MASTER VALIDATION")
print("========================================")

print(f"Total villages: {len(df):,}")

print(
    "Missing village names:",
    df["village_name"].eq("").sum()
)

print(
    "Missing Census village codes:",
    df["census_village_code"].eq("").sum()
)

print(
    "Duplicate Census village codes:",
    df["census_village_code"].duplicated().sum()
)

print(
    "Duplicate RakshaGrid village IDs:",
    df["rakshagrid_village_id"].duplicated().sum()
)

print()
print("District counts:")

print(
    df["district"]
    .value_counts()
    .to_string()
)

print()
print(
    "Total population:",
    f"{df['population'].sum():,}"
)

print(
    "Total households:",
    f"{df['households'].sum():,}"
)

# ------------------------------------------------------------
# Show sample records
# ------------------------------------------------------------

print()
print("Sample village records:")
print()

print(
    df[
        [
            "district",
            "subdistrict",
            "census_village_code",
            "village_name",
            "population",
            "households",
            "rakshagrid_village_id",
        ]
    ]
    .head(10)
    .to_string(index=False)
)

# ------------------------------------------------------------
# Save enriched dataset
# ------------------------------------------------------------

df.to_csv(
    OUTPUT,
    index=False
)

print()
print("========================================")
print("ENRICHED DATASET CREATED")
print("========================================")
print(OUTPUT)