import json
import uuid
from collections import Counter
from socket import timeout as SocketTimeout
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_X, ST_Y
from pydantic import ValidationError
from sqlalchemy import cast, desc, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Record, Venue, Wishlist
from app.schemas import (
    RecommendationAiOutput,
    RecommendationRead,
    RecommendationVenueRead,
    VenueRead,
)

GEMINI_TIMEOUT_SECONDS = 12
MAX_AI_CANDIDATES = 20
RECOMMENDATION_SIZE = 3

_geom = cast(Venue.location, Geometry)

SYSTEM_INSTRUCTION = """
You are the Personal Curator for KULTI, a specialized platform for art galleries
and museums in Brazil. Design a cohesive 3-venue cultural itinerary using only
the supplied venue dataset. Return only valid raw JSON, with all user-facing text
in Brazilian Portuguese.
""".strip()


class RecommendationAiError(Exception):
    pass


def _venue_select():
    return select(Venue, ST_X(_geom), ST_Y(_geom))


def _to_venue_read(row) -> VenueRead:
    venue, lon, lat = row
    return VenueRead(
        id=venue.id,
        name=venue.name,
        description=venue.description,
        category=venue.category,
        address=venue.address,
        latitude=lat,
        longitude=lon,
        phone=venue.phone,
        website=venue.website,
        image_url=venue.image_url,
        created_at=venue.created_at,
        updated_at=venue.updated_at,
    )


def _load_record_venues(db: Session, user_id: uuid.UUID) -> list[VenueRead]:
    stmt = (
        _venue_select()
        .join(Record, Record.venue_id == Venue.id)
        .where(Record.user_id == user_id)
    )
    return [_to_venue_read(row) for row in db.execute(stmt).all()]


def _load_wishlist_venues(db: Session, user_id: uuid.UUID) -> list[VenueRead]:
    stmt = (
        _venue_select()
        .join(Wishlist, Wishlist.venue_id == Venue.id)
        .where(Wishlist.user_id == user_id)
    )
    return [_to_venue_read(row) for row in db.execute(stmt).all()]


def _preferred_categories(
    record_venues: list[VenueRead],
    wishlist_venues: list[VenueRead],
) -> list[str]:
    counts = Counter(
        venue.category
        for venue in [*record_venues, *wishlist_venues]
        if venue.category
    )
    return [category for category, _count in counts.most_common()]


def _exclude_blocked(stmt, blocked_ids: set[uuid.UUID]):
    if not blocked_ids:
        return stmt
    return stmt.where(Venue.id.notin_(blocked_ids))


def _load_candidate_venues(
    db: Session,
    blocked_ids: set[uuid.UUID],
    categories: list[str],
    limit: int = MAX_AI_CANDIDATES,
) -> list[VenueRead]:
    stmt = _exclude_blocked(_venue_select(), blocked_ids)
    if categories:
        stmt = stmt.where(Venue.category.in_(categories))
    stmt = stmt.order_by(Venue.name).limit(limit)
    return [_to_venue_read(row) for row in db.execute(stmt).all()]


def _load_popular_venues(
    db: Session,
    blocked_ids: set[uuid.UUID],
    limit: int = RECOMMENDATION_SIZE,
) -> list[VenueRead]:
    popularity = (
        select(
            Record.venue_id.label("venue_id"),
            func.count(Record.id).label("visit_count"),
        )
        .group_by(Record.venue_id)
        .subquery()
    )
    stmt = (
        _venue_select()
        .join(popularity, popularity.c.venue_id == Venue.id)
        .order_by(desc(popularity.c.visit_count), Venue.name)
        .limit(limit)
    )
    stmt = _exclude_blocked(stmt, blocked_ids)
    return [_to_venue_read(row) for row in db.execute(stmt).all()]


def _load_available_venues(
    db: Session,
    blocked_ids: set[uuid.UUID],
    limit: int,
) -> list[VenueRead]:
    stmt = _exclude_blocked(_venue_select(), blocked_ids)
    stmt = stmt.order_by(Venue.name).limit(limit)
    return [_to_venue_read(row) for row in db.execute(stmt).all()]


def _candidate_payload(venues: list[VenueRead]) -> list[dict[str, str | None]]:
    return [
        {
            "name": venue.name,
            "category": venue.category,
            "description": venue.description,
        }
        for venue in venues
    ]


def _context_payload(
    record_venues: list[VenueRead],
    wishlist_venues: list[VenueRead],
    categories: list[str],
) -> dict[str, list[dict[str, str]] | list[str]]:
    return {
        "visited_venues": [
            {"name": venue.name, "category": venue.category}
            for venue in record_venues
        ],
        "wishlist": [
            {"name": venue.name, "category": venue.category}
            for venue in wishlist_venues
        ],
        "preferences": categories,
    }


def _build_prompt(
    record_venues: list[VenueRead],
    wishlist_venues: list[VenueRead],
    categories: list[str],
    candidates: list[VenueRead],
) -> str:
    return f"""
Analyze the following dataset and construct a curated itinerary.

Data Source:
- Origin: User History/Wishlist

User Context:
{json.dumps(_context_payload(record_venues, wishlist_venues, categories), ensure_ascii=False)}

Available Candidate Pool:
{json.dumps(_candidate_payload(candidates), ensure_ascii=False)}

Objective:
Select exactly 3 venues from the Available Candidate Pool that form a coherent
and engaging thematic itinerary.

Strict Constraints:
1. Do NOT include venues already visited by the user.
2. Do NOT include venues already in the user's wishlist.
3. Venue names must match EXACTLY as provided, including case.
4. Return ONLY valid raw JSON.
5. All user-facing text must be in Brazilian Portuguese.
6. Use this exact schema:
{{
  "itinerary_title": "Título criativo em pt-BR para o roteiro",
  "itinerary_names": ["Exact Venue Name 1", "Exact Venue Name 2", "Exact Venue Name 3"],
  "curator_note": "Explicação coesa em 1-2 frases em pt-BR",
  "interpretability_logic": {{
    "venue_1_choice": "Justificativa do primeiro local",
    "venue_2_choice": "Justificativa do segundo local",
    "venue_3_choice": "Justificativa do terceiro local"
  }}
}}
""".strip()


def _call_gemini(prompt: str) -> RecommendationAiOutput:
    api_key = settings.GEMINI_API_KEY.strip()
    if not api_key or api_key == "your_gemini_api_key":
        raise RecommendationAiError("Gemini API key is not configured.")

    model = quote(settings.GEMINI_MODEL, safe="")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={quote(api_key, safe='')}"
    )
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "response_mime_type": "application/json",
        },
    }
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
