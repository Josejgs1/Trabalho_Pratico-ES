import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import VenueRead
from app.services import venue as venue_service

router = APIRouter(prefix="/venues", tags=["venues"])

SearchFilter = Annotated[str | None, Query(max_length=255)]
CategoryFilter = Annotated[str | None, Query(max_length=100)]
LatitudeFilter = Annotated[float | None, Query(ge=-90, le=90)]
LongitudeFilter = Annotated[float | None, Query(ge=-180, le=180)]
RadiusFilter = Annotated[
    float | None,
    Query(alias="radiusMeters", gt=0, le=50000),
]


def _has_partial_location(*values: float | None) -> bool:
    return any(value is not None for value in values) and not all(
        value is not None for value in values
    )


@router.get("", response_model=list[VenueRead])
def list_venues(
    search: SearchFilter = None,
    category: CategoryFilter = None,
    latitude: LatitudeFilter = None,
    longitude: LongitudeFilter = None,
    radius_meters: RadiusFilter = None,
    db: Session = Depends(get_db),
) -> list[VenueRead]:
    if _has_partial_location(latitude, longitude, radius_meters):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "latitude, longitude, and radiusMeters "
                "must be provided together."
            ),
        )

    return venue_service.list_all(
        db,
        search=search,
        category=category,
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
    )


@router.get("/{venue_id}", response_model=VenueRead)
def get_venue(venue_id: uuid.UUID, db: Session = Depends(get_db)) -> VenueRead:
    venue = venue_service.get_by_id(db, venue_id)
    if venue is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found.",
        )
    return venue
