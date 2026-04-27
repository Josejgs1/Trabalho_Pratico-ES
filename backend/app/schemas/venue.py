import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VenueCreate(BaseModel):
    name: str
    description: str | None = None
    category: str
    address: str
    latitude: float
    longitude: float
    phone: str | None = None
    website: str | None = None
    image_url: str | None = None


class VenueUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    website: str | None = None
    image_url: str | None = None


class VenueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    name: str
    description: str | None
    category: str
    address: str
    latitude: float
    longitude: float
    phone: str | None
    website: str | None
    image_url: str | None
    created_at: datetime
    updated_at: datetime
