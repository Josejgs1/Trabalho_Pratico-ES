import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RecordCreate(BaseModel):
    venue_id: uuid.UUID
    rating: int
    comment: str | None = Field(None, max_length=1000)
    visit_date: datetime | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if not (1 <= value <= 5):
            raise ValueError("A nota deve estar entre 1 e 5.")
        return value


class RecordUpdate(BaseModel):
    rating: int | None 
    comment: str | None = Field(None, max_length=1000)
    visit_date: datetime | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if not (1 <= value <= 5):
            raise ValueError("A nota deve estar entre 1 e 5.")
        return value


class RecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    venue_id: uuid.UUID
    rating: int
    comment: str | None
    visit_date: datetime | None
    created_at: datetime
    updated_at: datetime
