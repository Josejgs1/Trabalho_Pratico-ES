import uuid
from typing import Literal

from pydantic import BaseModel, Field


class RecommendationAiOutput(BaseModel):
    itinerary_title: str = Field(min_length=1)
    itinerary_names: list[str] = Field(min_length=3, max_length=3)
    curator_note: str = Field(min_length=1)
    interpretability_logic: dict[str, str]


class RecommendationVenueRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    category: str
    address: str
    latitude: float
    longitude: float
    image_url: str | None
    justification: str


class RecommendationRead(BaseModel):
    itinerary_title: str
    curator_note: str
    source: Literal["ai", "popularity_fallback", "no_candidates"]
    fallback_reason: str | None = None
    venues: list[RecommendationVenueRead]
