import json
import os
from app.core.database import SessionLocal

from app.models.user import User
from app.models.venue import Venue
from app.models.record import Record


def seed():
    """Seeds the database with users, venues and records data from JSON files."""

    db = SessionLocal()
    base_dir = os.path.dirname(__file__)

    users_file = os.path.join(base_dir, "users.json")
    venues_file = os.path.join(base_dir, "venues.json")
    records_file = os.path.join(base_dir, "records.json")

    try:
        # --------------------
        # USERS
        # --------------------
        with open(users_file, "r", encoding="utf-8") as f:
            users_data = json.load(f)

        for data in users_data:
            user = User(**data)
            db.merge(user)

        print(f"Loaded {len(users_data)} users")

        # --------------------
        # VENUES
        # --------------------
        with open(venues_file, "r", encoding="utf-8") as f:
            venues_data = json.load(f)

        for data in venues_data:
            venue = Venue(**data)
            db.merge(venue)

        print(f"Loaded {len(venues_data)} venues")

        # --------------------
        # RECORDS (DEVE SER O ÚLTIMO)
        # --------------------
        with open(records_file, "r", encoding="utf-8") as f:
            records_data = json.load(f)

        for data in records_data:
            record = Record(**data)
            db.merge(record)

        print(f"Loaded {len(records_data)} records")

        # --------------------
        # COMMIT FINAL
        # --------------------
        db.commit()
        print("Seed completed successfully.")

    except Exception as e:
        print(f"Error during seed: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    seed()