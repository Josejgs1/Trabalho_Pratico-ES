from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import cast, select
from sqlalchemy.orm import Session

from geoalchemy2 import Geometry

from app.models import Venue
from app.schemas import VenueRead


def list_venues(db: Session) -> list[VenueRead]:
    geom = cast(Venue.location, Geometry)
    stmt = select(
        Venue,
        ST_X(geom).label("longitude"),
        ST_Y(geom).label("latitude"),
    )
    rows = db.execute(stmt).all()
    return [
        VenueRead(
            id=venue.id,
            name=venue.name,
            description=venue.description,
            category=venue.category,
            address=venue.address,
            latitude=latitude,
            longitude=longitude,
            phone=venue.phone,
            website=venue.website,
            image_url=venue.image_url,
            created_at=venue.created_at,
            updated_at=venue.updated_at,
        )
        for venue, longitude, latitude in rows
    ]
