import uuid

from geoalchemy2 import Geography, Geometry
from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import cast, func, or_, select
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


def list_all(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    radius_meters: float | None = None,
) -> list[VenueRead]:
    stmt = select(Venue, ST_X(_geom), ST_Y(_geom))
    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Venue.name.ilike(term),
                Venue.address.ilike(term),
                Venue.category.ilike(term),
                Venue.description.ilike(term),
            )
        )
    if category:
        stmt = stmt.where(Venue.category == category)
    if (
        latitude is not None
        and longitude is not None
        and radius_meters is not None
    ):
        point = cast(
            func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326),
            Geography,
        )
        stmt = stmt.where(func.ST_DWithin(Venue.location, point, radius_meters))
        stmt = stmt.order_by(func.ST_Distance(Venue.location, point))
    return [_to_read(row) for row in db.execute(stmt).all()]


def get_by_id(db: Session, venue_id: uuid.UUID) -> VenueRead | None:
    stmt = select(Venue, ST_X(_geom), ST_Y(_geom)).where(Venue.id == venue_id)
    row = db.execute(stmt).first()
    return _to_read(row) if row else None
