# Database Schema

SQLite is created automatically via SQLAlchemy models at first startup
(`Backend/app/database.py`, `Backend/app/models.py`). Location: `Backend/data/agriscan.db`.

```
users                       farms
────────────────────       ────────────────────────
id TEXT (PK)                id INTEGER (PK)
name TEXT                   user_id TEXT (FK → users.id)
role TEXT  farmer|officer   name TEXT
region TEXT                 crop TEXT
                            latitude REAL
diagnoses                   longitude REAL
────────────────────────    area_hectares REAL
id TEXT (PK)
user_id TEXT (FK→users)     disease_classes
farm_id INTEGER (FK→farms)  ────────────────────────
crop TEXT                   class_id TEXT (PK)
disease TEXT                crop TEXT
class_id TEXT               disease TEXT
confidence REAL 0..1        label TEXT
severity INTEGER 0..100     healthy BOOLEAN
severity_label TEXT         description TEXT
temperature REAL
humidity REAL
rainfall_mm REAL
weather_cached BOOLEAN
latitude REAL
longitude REAL
image_url TEXT
created_at DATETIME         knowledge_base_entries
sync_status TEXT            ────────────────────────
review_status TEXT          class_id TEXT (PK)
is_demo_sample BOOLEAN      crop TEXT, disease TEXT
                            pathogen TEXT
expert_reviews
────────────────────────
id INTEGER (PK)
diagnosis_id TEXT (FK)
decision TEXT   confirmed|incorrect|more_info
note TEXT
reviewed_at DATETIME

knowledge_base_entries
────────────────────────
class_id TEXT (PK)
crop TEXT, disease TEXT
pathogen TEXT
symptoms JSON
immediate_actions JSON
prevention JSON
chemical_guidance JSON
organic JSON
contact_advice TEXT

knowledge_versions
                            ────────────────────────
sync_records                artifact TEXT (PK)
────────────────────────    version TEXT
id INTEGER (PK)
device_id TEXT              environmental_observations
diagnosis_id TEXT (FK)      ────────────────────────
status TEXT                 id INTEGER (PK)
synced_at DATETIME          region TEXT, latitude/longitude REAL
                            temperature/humidity/rainfall_mm REAL
outbreak_points             observed_at DATETIME
────────────────────────
id INTEGER (PK)
latitude REAL, longitude REAL
crop TEXT, condition TEXT
severity INTEGER
region TEXT, occurred_at DATETIME
case_id TEXT (FK → diagnoses.id)
```

## Conventions

- `created_at` / `occurred_at` / timestamps stored as naive UTC.
- `sync_status`: `pending|synced` (client-side offline queue counterpart lives in
  IndexedDB; the server always stores synced rows).
- `review_status`: `none | needs_review | confirmed | incorrect | more_info`.
- `severity_label`: `Mild | Moderate | Severe` (0–100 numeric too).
- Demo data: `Backend/scripts/generate_demo_data.py` (deterministic, seed 42; idempotent
  unless `--force`).