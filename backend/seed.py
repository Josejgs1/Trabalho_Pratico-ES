import json
import os
from app.core.database import SessionLocal
from app.models.venue import Venue

def seed():
    """Seeds the database with venue data from venues.json."""
    db = SessionLocal()
    # Locate the json file relative to this script
    json_file_path = os.path.join(os.path.dirname(__file__), 'venues.json')

    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            venues_data = json.load(f)

        for data in venues_data:
            # Using merge allows us to update existing records or insert new ones
            # based on the UUID provided in the JSON file.
            # GeoAlchemy2 automatically handles the WKT string for the location field.
            venue = Venue(**data)
            db.merge(venue)

        db.commit()
        print(f"Successfully seeded {len(venues_data)} venues into the database.")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()