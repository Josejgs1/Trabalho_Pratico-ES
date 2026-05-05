# Database Seeding (Neon / Remote PostgreSQL)

## Overview

The project includes seed data in `backend/users.json`, `backend/venues.json`, and `backend/records.json`. Locally, `seed.py` uses SQLAlchemy's `merge()` to populate the database. However, this approach **does not work reliably against a remote database** (e.g., Neon) due to:

1. **Row-level locks from `merge()`** — each call issues a `SELECT` then `INSERT/UPDATE`, which holds locks and conflicts with other connections (e.g., the running backend on Render).
2. **Network latency** — individual INSERT round-trips over the internet are extremely slow for 28k+ records.

## Recommended Method: `psycopg2` with `execute_values`

The fastest and most reliable approach is using `psycopg2.extras.execute_values` for bulk inserts, bypassing SQLAlchemy entirely. This sends batches of rows in a single network round-trip.

### Prerequisites

```bash
cd backend
source venv/bin/activate
pip install psycopg2-binary  # if not already installed
```

### Script

```python
import json
import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = "postgresql://<user>:<password>@<host>/<db>?sslmode=require"

conn = psycopg2.connect(DATABASE_URL, connect_timeout=5)
cur = conn.cursor()

# --- Venues ---
with open("venues.json") as f:
    venues = json.load(f)

values = [
    (v["id"], v["name"], v.get("description"), v["category"], v["address"],
     v["location"], v.get("phone"), v.get("website"), v.get("image_url"))
    for v in venues
]
execute_values(cur, """
    INSERT INTO venues (id, name, description, category, address, location, phone, website, image_url)
    VALUES %s ON CONFLICT (id) DO NOTHING
""", values, template="(%s, %s, %s, %s, %s, ST_GeogFromText(%s), %s, %s, %s)")
conn.commit()
print(f"Venues: {len(venues)} done")

# --- Users ---
with open("users.json") as f:
    users = json.load(f)

values = [
    (u["id"], u["name"], u["email"], u["password_hash"],
     u.get("is_active", True), u.get("created_at"), u.get("updated_at"))
    for u in users
]
execute_values(cur, """
    INSERT INTO users (id, name, email, password_hash, is_active, created_at, updated_at)
    VALUES %s ON CONFLICT (id) DO NOTHING
""", values)
conn.commit()
print(f"Users: {len(users)} done")

# --- Records (in batches of 1000) ---
with open("records.json") as f:
    records = json.load(f)

batch_size = 1000
for i in range(0, len(records), batch_size):
    batch = records[i:i + batch_size]
    values = [
        (r["id"], r["user_id"], r["venue_id"], r["rating"],
         r.get("comment"), r["visit_date"], r["created_at"], r["updated_at"])
        for r in batch
    ]
    execute_values(cur, """
        INSERT INTO records (id, user_id, venue_id, rating, comment, visit_date, created_at, updated_at)
        VALUES %s ON CONFLICT (id) DO NOTHING
    """, values)
    conn.commit()
    print(f"Records: {min(i + batch_size, len(records))}/{len(records)}")

conn.close()
print("Seed complete!")
```

### Usage

```bash
cd backend
source venv/bin/activate
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" python seed_remote.py
```

## Troubleshooting

### Inserts hang indefinitely

Another connection is holding a lock (e.g., a previous failed seed attempt or the running backend). Fix:

```python
import psycopg2
conn = psycopg2.connect(DATABASE_URL, connect_timeout=5)
conn.autocommit = True
cur = conn.cursor()
cur.execute("""
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = current_database()
      AND pid != pg_backend_pid()
      AND state != 'idle'
""")
print(f"Terminated {cur.rowcount} blocking connections")
conn.close()
```

Then retry the seed.

### `merge()` hangs with SQLAlchemy + geoalchemy2

The `Venue` model uses a `Geography` column. SQLAlchemy's `merge()` issues a SELECT per row which, combined with geoalchemy2's type handling and remote latency, makes it impractical for bulk operations. Use raw SQL as shown above.
