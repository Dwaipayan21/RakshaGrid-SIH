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
    "Town/Village": "village_name",
    "Ward": "ward",
    "Level": "level",
    "TRU": "rural_urban",
    "No_HH": "households",
    "TOT_P": "population",
}

df = df.rename(columns=rename_map)

# Keep village records only
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
# Numeric fields
# ------------------------------------------------------------

if "population" in df.columns:
    df["population"] = pd.to_numeric(
        df["population"], errors="coerce"
    ).fillna(0).astype(int)

if "households" in df.columns:
    df["households"] = pd.to_numeric(
        df["households"], errors="coerce"
    ).fillna(0).astype(int)

# ------------------------------------------------------------
# Temporary stable RakshaGrid village key
#
# IMPORTANT:
# This is NOT the official Census village code.
# It is only an internal deterministic key until the
# official Census location code is joined.
# ------------------------------------------------------------

df["rakshagrid_village_id"] = (
    "AS-"
    + df["district"].str.upper().str.replace(" ", "_")
    + "-"
    + df["subdistrict"].str.upper().str.replace(" ", "_")
    + "-"
    + df["village_name"].str.upper().str.replace(" ", "_")
)

# ------------------------------------------------------------
# Validation
# ------------------------------------------------------------

print()
print("========================================")
print("RAKSHAGRID VILLAGE MASTER VALIDATION")
print("========================================")
print(f"Total villages: {len(df):,}")
print(f"Missing village names: {df['village_name'].eq('').sum():,}")
print(
    "Duplicate internal IDs:",
    df["rakshagrid_village_id"].duplicated().sum()
)

print()
print("District counts:")
print(df["district"].value_counts().to_string())

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
# Save
# ------------------------------------------------------------

df.to_csv(OUTPUT, index=False)

print()
print(f"Created:")
print(OUTPUT)