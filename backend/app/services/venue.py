import uuid

from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import cast, select
from sqlalchemy.orm import Session

from app.models import Venue
from app.schemas import VenueRead

_geom = cast(Venue.location, Geometry)


def _to_read(row) -> VenueRead:
    venue, lon, lat = row
    return VenueRead(
        id=venue.id,
        name=venue.name,
        description=venue.description,
        category=venue.category,
        address=venue.address,
        latitude=lat,
        longitude=lon,
        phone=venue.phone,
        website=venue.website,
        image_url=venue.image_url,
        created_at=venue.created_at,
        updated_at=venue.updated_at,
    )


def list_all(db: Session) -> list[VenueRead]:
    stmt = select(Venue, ST_X(_geom), ST_Y(_geom))
    return [_to_read(row) for row in db.execute(stmt).all()]


def get_by_id(db: Session, venue_id: uuid.UUID) -> VenueRead | None:
    stmt = select(Venue, ST_X(_geom), ST_Y(_geom)).where(Venue.id == venue_id)
    row = db.execute(stmt).first()
    return _to_read(row) if row else None
