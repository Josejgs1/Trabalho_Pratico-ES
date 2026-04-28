import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WishlistCreate(BaseModel):
    venue_id: uuid.UUID


class WishlistRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    venue_id: uuid.UUID
    created_at: datetime
