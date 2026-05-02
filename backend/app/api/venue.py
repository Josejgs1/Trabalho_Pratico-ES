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


@router.get("", response_model=list[VenueRead])
def list_venues(
    search: SearchFilter = None,
    category: CategoryFilter = None,
    db: Session = Depends(get_db),
) -> list[VenueRead]:
    return venue_service.list_all(
        db,
        search=search,
        category=category,
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
