import json

# Input files
population_file = "data/metadata/assam_population.json"
age_file = "data/metadata/assam_age_population.json"

# Output file
output_file = "data/metadata/assam_population_complete.json"

# Load population data
with open(population_file, "r", encoding="utf-8") as f:
    population_data = json.load(f)

# Load age data
with open(age_file, "r", encoding="utf-8") as f:
    age_data = json.load(f)

# Merge the data
merged_data = {}

# Go through every district in population data
for district, data in population_data.items():

    merged_data[district] = {
        "population": data.get("population", 0),
        "male": data.get("male", 0),
        "female": data.get("female", 0),

        # Get age information
        "children": age_data.get(district, {}).get("children", 0),
        "workingAge": age_data.get(district, {}).get("workingAge", 0),
        "elderly": age_data.get(district, {}).get("elderly", 0),

        "source": "Census 2011"
    }

# Save merged JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(merged_data, f, indent=2, ensure_ascii=False)

print("--------------------------------")
print("SUCCESS!")
print("--------------------------------")
print("Created:", output_file)
print("Districts:", len(merged_data))