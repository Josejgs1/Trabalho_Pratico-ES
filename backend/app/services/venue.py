from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Venue
import uuid


def get_venue_by_id(db: Session, venue_id: uuid.UUID) -> Venue | None:
    """Fetch a single venue by ID."""
    return db.query(Venue).filter(Venue.id == venue_id).first()


def get_venues(db: Session, name: str | None = None, category: str | None = None) -> list[Venue]:
    """
    Fetch venues filtered by name and/or category.
    If no filters are provided, returns all venues.
    """

    query = db.query(Venue)

    if name:
        query = query.filter(Venue.name.ilike(f"%{name}%"))

    if category:
        query = query.filter(Venue.category.ilike(f"%{category}%"))

    return query.all()