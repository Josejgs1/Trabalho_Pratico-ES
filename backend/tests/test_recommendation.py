"""Tests for recommendation endpoints with Gemini mocked."""

import uuid
from unittest.mock import patch

import pytest
from geoalchemy2.elements import WKTElement

from app.core.security import create_access_token, hash_password
from app.models import Record, User, Venue, Wishlist
from app.schemas import RecommendationAiOutput
from app.services.recommendation import RecommendationAiError


RECOMMENDATIONS_URL = "/recommendations"


def _make_venue(db, *, name: str, category: str = "Arte") -> Venue:
    venue = Venue(
        id=uuid.uuid4(),
        name=name,
        description=f"{name} description",
        category=category,
        address=f"{name} address",
        location=WKTElement("POINT(-43.9 -19.9)", srid=4326),
    )
    db.add(venue)
    db.flush()
    return venue


def _make_user_context(db) -> tuple[dict[str, str], uuid.UUID]:
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        name="Recommendation Tester",
        email=f"recommendations-{user_id}@test.com",
        password_hash=hash_password("securepassword"),
    )
    db.add(user)
    db.flush()
    return {"Authorization": f"Bearer {create_access_token(str(user.id))}"}, user.id


def _ai_output(*names: str) -> RecommendationAiOutput:
    return RecommendationAiOutput(
        itinerary_title="Roteiro de Arte",
        itinerary_names=list(names),
        curator_note="Um roteiro em português conectando os espaços escolhidos.",
        interpretability_logic={
            "venue_1_choice": "Primeira escolha alinhada ao histórico.",
            "venue_2_choice": "Segunda escolha complementa o percurso.",
            "venue_3_choice": "Terceira escolha fecha o roteiro.",
        },
    )


@pytest.mark.asyncio
async def test_recommendations_return_ai_source_when_gemini_succeeds(client, db):
    auth_headers, user_id = _make_user_context(db)
    visited = _make_venue(db, name="Museu Visitado", category="Arte")
    wishlisted = _make_venue(db, name="Galeria Salva", category="Arte")
    candidate_a = _make_venue(db, name="Atelie A", category="Arte")
    candidate_b = _make_venue(db, name="Atelie B", category="Arte")
    candidate_c = _make_venue(db, name="Atelie C", category="Arte")

    db.add(Record(user_id=user_id, venue_id=visited.id, rating=5))
    db.add(Wishlist(user_id=user_id, venue_id=wishlisted.id))
    db.flush()

    with patch(
        "app.services.recommendation._call_gemini",
        return_value=_ai_output(candidate_a.name, candidate_b.name, candidate_c.name),
    ) as gemini:
        resp = await client.get(RECOMMENDATIONS_URL, headers=auth_headers)

    assert resp.status_code == 200
    body = resp.json()
    assert body["source"] == "ai"
    assert [venue["name"] for venue in body["venues"]] == [
        candidate_a.name,
        candidate_b.name,
        candidate_c.name,
    ]
    assert visited.name not in [venue["name"] for venue in body["venues"]]
    assert wishlisted.name not in [venue["name"] for venue in body["venues"]]
    gemini.assert_called_once()


