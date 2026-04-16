from sqlalchemy.orm import Session
from app.models import Venue


def get_venues_by_category(db: Session, category: str) -> list[Venue]:
    """Fetch venues filtered by category."""
    return db.query(Venue).filter(Venue.category == category).all()


def get_all_venues(db: Session) -> list[Venue]:
    """Fetch all venues."""
    return db.query(Venue).all()


def get_venue_by_name(db: Session, venue_name: str) -> list[Venue]:
    """Fetch venues by name."""
    return db.query(Venue).filter(Venue.id == venue_name).all()