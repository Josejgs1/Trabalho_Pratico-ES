import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Venue
from app.schemas import VenueRead
from app.services import venue as venue_service

from geoalchemy2.shape import to_shape


router = APIRouter(prefix="/venues", tags=["venues"])


def venue_to_schema(v: Venue) -> VenueRead:
    point = to_shape(v.location)

    return VenueRead(
        id=v.id,
        name=v.name,
        description=v.description,
        category=v.category,
        address=v.address,
        latitude=point.y,
        longitude=point.x,
        phone=v.phone,
        website=v.website,
        image_url=v.image_url,
        created_at=v.created_at,
        updated_at=v.updated_at,
    )


@router.get("/", response_model=list[VenueRead])
def list_venues(
    name: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
) -> list[VenueRead]:
    """
    List venues with optional filters (name and/or category).
    """

    venues = venue_service.get_venues(db, name=name, category=category)

    return [venue_to_schema(v) for v in venues]


@router.get("/{venue_id}", response_model=VenueRead)
def get_venue(
    venue_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> VenueRead:
    """
    Get a single venue by ID.
    """

    venue = venue_service.get_venue_by_id(db, venue_id)

    if venue is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found.",
        )

    return venue_to_schema(venue)