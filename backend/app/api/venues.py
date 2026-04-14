from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import VenueRead
from app.services import venue as venue_service

router = APIRouter(prefix="/venues", tags=["venues"])


@router.get("", response_model=list[VenueRead])
def list_venues(db: Session = Depends(get_db)) -> list[VenueRead]:
    return venue_service.list_venues(db)
