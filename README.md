# RakshaGrid-SIH

## Team Work Division

This project is divided into six major areas so that each team member
can work independently according to their expertise.

------------------------------------------------------------------------

## 👨‍💻 Member 1 --- Frontend Developer

**Folder:** `frontend/`

### Responsibilities

-   Build the complete user interface.
-   Create the landing page and main dashboard.
-   Build maps, charts, cards, tables, forms and navigation.
-   Display hazard zones, carrying capacity and relocation information.
-   Connect frontend screens with backend APIs.
-   Make the UI responsive and clean.

### Main Technologies

-   React / JavaScript
-   HTML / CSS
-   Tailwind CSS or other UI library
-   Maps and chart libraries

### Deliverable

A complete frontend that can consume backend APIs and clearly present
the project's results.

------------------------------------------------------------------------

## ⚙️ Member 2 --- Backend Developer

**Folder:** `backend/`

### Responsibilities

-   Build the backend server and REST APIs.
-   Handle user/admin authentication if required.
-   Create API endpoints for:
    -   Habitation data
    -   Hazard information
    -   Risk scores
    -   Carrying capacity
    -   Relocation requirements
    -   Reports/results
-   Connect the application with the database.
-   Validate requests and handle errors.
-   Integrate the risk-engine/ML service with the backend.

### Main Technologies

-   Node.js
-   Express.js
-   MongoDB
-   JWT authentication if required

### Deliverable

A stable backend API that connects the frontend, database and
risk-engine.

------------------------------------------------------------------------

## 🤖 Member 3 --- Risk Engine / ML Developer

**Folder:** `risk-engine/`

### Responsibilities

-   Develop the hazard/risk assessment logic.
-   Process habitation and hazard-related input data.
-   Build risk scoring/classification logic.
-   Identify high-risk / red-zone areas.
-   Develop prediction or classification models where required.
-   Calculate risk levels for vulnerable habitations.
-   Expose the ML/risk functionality so the backend can use it.

### Main Technologies

-   Python
-   Pandas
-   NumPy
-   Scikit-learn
-   FastAPI/Flask if a separate ML API is required

### Deliverable

A working risk engine that receives data and returns meaningful risk
scores/classes.

------------------------------------------------------------------------

## 🗺️ Member 4 --- GIS / Data Processing Developer

**Folder:** `data/`

### Responsibilities

-   Collect and organize geographical and hazard-related datasets.
-   Clean and preprocess raw data.
-   Prepare location-based habitation data.
-   Work with latitude/longitude and geographic boundaries.
-   Prepare map layers and GeoJSON data where required.
-   Support red-zone identification using spatial information.
-   Make processed datasets available to the risk engine and backend.

### Main Technologies

-   Python
-   Pandas
-   GeoPandas
-   GeoJSON
-   GIS tools
-   QGIS if required

### Deliverable

Clean, structured and usable geographic/hazard datasets for the rest of
the system.

------------------------------------------------------------------------

## 📊 Member 5 --- Carrying Capacity & Relocation Module Developer

**Main Area:** Carrying Capacity + Relocation Logic

### Responsibilities

-   Design the carrying-capacity assessment.
-   Calculate whether an area can safely accommodate relocated people.
-   Consider factors such as:
    -   Population
    -   Available land
    -   Water availability
    -   Healthcare
    -   Roads/transport
    -   Schools/basic facilities
    -   Shelter capacity
    -   Other available resources
-   Develop relocation priority logic.
-   Recommend suitable relocation areas.
-   Provide the backend with structured relocation results.

### Main Technologies

-   Python / JavaScript
-   Data analysis
-   Mathematical/scoring models
-   MongoDB integration where required

### Deliverable

A module that determines carrying capacity and produces practical
relocation recommendations.

------------------------------------------------------------------------

## 🧪 Member 6 --- Integration, Testing & DevOps Developer

**Main Area:** Complete System Integration

### Responsibilities

-   Connect frontend, backend, risk engine and data modules.
-   Test API communication.
-   Test complete user workflows.
-   Find and fix integration bugs.
-   Maintain GitHub branches and pull requests.
-   Manage environment variables and deployment configuration.
-   Test the application before final submission.
-   Help all team members resolve integration issues.

### Main Technologies

-   Git / GitHub
-   Postman
-   Node.js
-   Docker if required
-   Deployment platform as selected by the team

### Deliverable

A fully integrated, tested and deployable application.

------------------------------------------------------------------------

# Folder Ownership

  -----------------------------------------------------------------------
  Folder                  Primary Owner           Purpose
  ----------------------- ----------------------- -----------------------
  `frontend/`             Member 1                User interface

  `backend/`              Member 2                APIs, server & database

  `risk-engine/`          Member 3                Risk/ML processing

  `data/`                 Member 4                GIS & dataset
                                                  processing

  Carrying Capacity /     Member 5                Capacity & relocation
  Relocation                                      decisions

  Integration / Testing   Member 6                Connect and test
                                                  everything
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Important Team Rule

Each member should primarily work inside their assigned area.

Before modifying another member's major module:

1.  Discuss the change with that member.
2.  Create a separate Git branch.
3.  Commit changes with a clear message.
4.  Create a Pull Request.
5.  Test the changes before merging.

### Suggested Branch Names

``` text
feature/frontend
feature/backend
feature/risk-engine
feature/data
feature/relocation
feature/integration
```

### Commit Example

``` bash
git add .
git commit -m "Add risk zone classification API"
git push origin feature/risk-engine
```

------------------------------------------------------------------------

# Overall System Flow

``` text
                 DATA
                  │
                  ▼
        ┌──────────────────┐
        │ Data Processing  │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │   Risk Engine    │
        │   / ML Module    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │     Backend      │
        │ APIs + Database  │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │     Frontend     │
        │ Dashboard + Map  │
        └──────────────────┘
                 │
                 ▼
       Risk Zones + Capacity
       + Relocation Results
```

------------------------------------------------------------------------

# Final Goal

The team should deliver one integrated platform that can:

-   Identify hazard-prone/red-zone habitations.
-   Assess the risk level of vulnerable areas.
-   Estimate carrying capacity of safer areas.
-   Identify immediate relocation needs.
-   Recommend suitable relocation areas.
-   Present the results through a clear and interactive dashboard.

**Work independently by module, but keep interfaces/API contracts
consistent so that all six modules can be integrated into one working
system.**
