import uuid
from sqlalchemy.orm import Session
from app.models import Record
from app.schemas import RecordCreate, RecordUpdate


def create_record(
    db: Session,
    record_in: RecordCreate,
    user_id: uuid.UUID,
) -> Record:
    """Create a new record."""

    record = Record(
        **record_in.model_dump(),
        user_id=user_id, 
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_record_by_id(db: Session, record_id: uuid.UUID) -> Record | None:
    """Fetch a single record by ID."""
    return db.query(Record).filter(Record.id == record_id).first()


def get_records(
    db: Session,
    user_id: uuid.UUID,
    venue_id: uuid.UUID | None = None,
) -> list[Record]:
    """
    Fetch records filtered by user (always) and optionally by venue.
    """

    query = db.query(Record).filter(Record.user_id == user_id)

    if venue_id:
        query = query.filter(Record.venue_id == venue_id)

    return query.all()


def update_record(
    db: Session,
    record: Record,
    record_in: RecordUpdate,
) -> Record:
    """Update an existing record."""

    update_data = record_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return record