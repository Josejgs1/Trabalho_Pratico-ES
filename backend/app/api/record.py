import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.models import Record, User
from app.schemas import RecordCreate, RecordRead, RecordUpdate
from app.services import record as record_service
from app.api.auth import get_current_user

router = APIRouter(prefix="/records", tags=["records"])


def check_record_owner(record: Record, user: User) -> None:
    if record.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to access this record.",
        )


@router.post("/", response_model=RecordRead, status_code=status.HTTP_201_CREATED)
def create_record(
    record_in: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecordRead:
    """
    Create a new record (user visit).
    """

    if not record_in.venue_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O museu é obrigatório.",
        )

    if record_in.rating < 1 or record_in.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nota deve estar entre 1 e 5.",
        )

    try:
        record = record_service.create_record(
            db,
            record_in,
            user_id=current_user.id,
        )

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Você já avaliou esse museu.",
        )

    return RecordRead.model_validate(record)


@router.get("/", response_model=list[RecordRead])
def list_records(
    venue_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RecordRead]:
    """
    List records for the current user, optionally filtered by venue.
    """

    records = record_service.get_records(
        db,
        user_id=current_user.id,
        venue_id=venue_id,
    )

    return [RecordRead.model_validate(r) for r in records]


@router.get("/{record_id}", response_model=RecordRead)
def get_record(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecordRead:
    """
    Get a single record by ID.
    """

    record = record_service.get_record_by_id(db, record_id)

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found.",
        )

    check_record_owner(record, current_user)

    return RecordRead.model_validate(record)


@router.put("/{record_id}", response_model=RecordRead)
def update_record(
    record_id: uuid.UUID,
    record_in: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecordRead:
    """
    Update a record.
    """

    record = record_service.get_record_by_id(db, record_id)

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada.",
        )

    check_record_owner(record, current_user)

    update_data = record_in.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização.",
        )

    if "rating" in update_data:
        if update_data["rating"] < 1 or update_data["rating"] > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A nota deve estar entre 1 e 5.",
            )

    try:
        record = record_service.update_record(db, record, record_in)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não foi possível atualizar a avaliação devido a uma restrição no banco de dados.",
        )

    return RecordRead.model_validate(record)