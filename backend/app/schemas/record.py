import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RecordCreate(BaseModel):
    user_id: uuid.UUID
    venue_id: uuid.UUID
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: str | None = Field(None, max_length=1000)
    visit_date: datetime | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if not (1 <= value <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return value


class RecordUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: str | None = Field(None, max_length=1000)
    visit_date: datetime | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if value is not None and not (1 <= value <= 5):
            raise ValueError("Rating must be between 1 and 5")
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