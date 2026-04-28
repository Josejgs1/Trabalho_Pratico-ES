import uuid

from sqlalchemy.orm import Session

from app.models import Wishlist


def add(db: Session, user_id: uuid.UUID, venue_id: uuid.UUID) -> Wishlist:
    item = Wishlist(user_id=user_id, venue_id=venue_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove(db: Session, user_id: uuid.UUID, venue_id: uuid.UUID) -> bool:
    item = db.query(Wishlist).filter_by(user_id=user_id, venue_id=venue_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def list_by_user(db: Session, user_id: uuid.UUID) -> list[Wishlist]:
    return db.query(Wishlist).filter_by(user_id=user_id).all()


def is_wishlisted(db: Session, user_id: uuid.UUID, venue_id: uuid.UUID) -> bool:
    return db.query(Wishlist).filter_by(user_id=user_id, venue_id=venue_id).first() is not None
