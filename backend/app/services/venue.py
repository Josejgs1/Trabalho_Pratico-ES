import uuid

from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import cast, func, select, or_
from sqlalchemy.orm import Session

from app.models import Record, User, Venue
from app.schemas import VenueRead, VenueReviewRead, VenueReviewSummaryRead

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
    return [_to_read(row) for row in db.execute(stmt).all()]


def get_by_id(db: Session, venue_id: uuid.UUID) -> VenueRead | None:
    stmt = select(Venue, ST_X(_geom), ST_Y(_geom)).where(Venue.id == venue_id)
    row = db.execute(stmt).first()
    return _to_read(row) if row else None


def get_review_summary(db: Session, venue_id: uuid.UUID) -> VenueReviewSummaryRead:
    stats_stmt = select(
        func.avg(Record.rating),
        func.count(Record.id),
    ).where(Record.venue_id == venue_id)
    average_rating, review_count = db.execute(stats_stmt).one()

    reviews_stmt = (
        select(Record, User.name)
        .join(User, Record.user_id == User.id)
        .where(Record.venue_id == venue_id)
        .order_by(Record.created_at.desc())
    )
    reviews = [
        VenueReviewRead(
            id=record.id,
            user_name=user_name,
            rating=record.rating,
            comment=record.comment,
            visit_date=record.visit_date,
            created_at=record.created_at,
        )
        for record, user_name in db.execute(reviews_stmt).all()
    ]

    return VenueReviewSummaryRead(
        venue_id=venue_id,
        average_rating=round(float(average_rating), 1)
        if average_rating is not None
        else None,
        review_count=review_count,
        reviews=reviews,
    )
