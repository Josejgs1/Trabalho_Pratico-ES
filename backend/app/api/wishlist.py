import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models import User
from app.schemas import WishlistCreate, WishlistRead
from app.services import wishlist as wishlist_service

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


@router.post("/", response_model=WishlistRead, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    body: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WishlistRead:
    try:
        item = wishlist_service.add(db, current_user.id, body.venue_id)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already in wishlist.")
    return WishlistRead.model_validate(item)


@router.delete("/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    venue_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    removed = wishlist_service.remove(db, current_user.id, venue_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in wishlist.")


@router.get("/", response_model=list[WishlistRead])
def list_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[WishlistRead]:
    items = wishlist_service.list_by_user(db, current_user.id)
    return [WishlistRead.model_validate(i) for i in items]


@router.get("/{venue_id}/status")
def check_wishlist(
    venue_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return {"wishlisted": wishlist_service.is_wishlisted(db, current_user.id, venue_id)}
