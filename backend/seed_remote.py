"""Seed a remote PostgreSQL database (e.g., Neon) using bulk inserts.

Usage:
    cd backend
    source venv/bin/activate
    DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" python seed_remote.py
"""

import json
import os
import sys

import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("ERROR: Set DATABASE_URL environment variable.")

conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
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

# --- Records ---
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
