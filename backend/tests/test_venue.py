"""
Reference tests for venue endpoints.

Covers:
- GET /venues          — list all, filter by category, search by name
- GET /venues/{id}     — detail for existing venue, 404 for unknown id

All venue endpoints require authentication.  The `auth_headers` fixture handles
registration + login so individual tests stay focused on venue behaviour.

Venue rows are inserted directly through the DB session (no venue-creation
endpoint exists in this project) using the same pattern teammates should follow
when seeding data for other resource tests.
"""

import uuid
import pytest
from geoalchemy2.elements import WKTElement
from app.models.venue import Venue


# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"
VENUES_URL = "/venues"

_USER = {
    "name": "Venue Tester",
    "email": "venues@test.com",
    "password": "securepassword",
}


@pytest.fixture()
async def auth_headers(client) -> dict[str, str]:
    """Register a user and return Authorization headers."""
    await client.post(REGISTER_URL, json=_USER)
    resp = await client.post(
        LOGIN_URL, json={"email": _USER["email"], "password": _USER["password"]}
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _make_venue(db, *, name: str, category: str, lat: float = -19.9, lon: float = -43.9) -> Venue:
    """Insert a Venue row directly into the test DB and return the ORM object."""
    venue = Venue(
        id=uuid.uuid4(),
        name=name,
        category=category,
        address="Test Address, 123",
        location=WKTElement(f"POINT({lon} {lat})", srid=4326),
    )
    db.add(venue)
    db.flush()  # assigns server defaults without committing
    return venue


# ---------------------------------------------------------------------------
# GET /venues  — list & filter
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_venues_returns_all(client, db, auth_headers):
    _make_venue(db, name="Museu Histórico", category="History")
    _make_venue(db, name="Galeria Moderna", category="Contemporary Art")

    resp = await client.get(VENUES_URL, headers=auth_headers)

    assert resp.status_code == 200
    names = [v["name"] for v in resp.json()]
    assert "Museu Histórico" in names
    assert "Galeria Moderna" in names


@pytest.mark.asyncio
async def test_list_venues_filter_by_category(client, db, auth_headers):
    _make_venue(db, name="Museu Histórico", category="History")
    _make_venue(db, name="Galeria Moderna", category="Contemporary Art")

    resp = await client.get(
        VENUES_URL, params={"category": "History"}, headers=auth_headers
    )

    assert resp.status_code == 200
    results = resp.json()
    assert all(v["category"] == "History" for v in results)
    assert any(v["name"] == "Museu Histórico" for v in results)


@pytest.mark.asyncio
async def test_list_venues_search_by_name(client, db, auth_headers):
    _make_venue(db, name="Pinacoteca do Estado", category="Fine Art")
    _make_venue(db, name="Museu de Arte Moderna", category="Contemporary Art")

    resp = await client.get(
        VENUES_URL, params={"search": "Pinacoteca"}, headers=auth_headers
    )

    assert resp.status_code == 200
    results = resp.json()
    assert len(results) >= 1
    assert results[0]["name"] == "Pinacoteca do Estado"


@pytest.mark.asyncio
async def test_list_venues_requires_auth(client):
    resp = await client.get(VENUES_URL)

    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# GET /venues/{id}  — detail
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_venue_detail(client, db, auth_headers):
    venue = _make_venue(db, name="Casa das Artes", category="History", lat=-19.9, lon=-43.9)

    resp = await client.get(f"{VENUES_URL}/{venue.id}", headers=auth_headers)

    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == str(venue.id)
    assert body["name"] == "Casa das Artes"
    assert body["category"] == "History"
    # latitude and longitude are returned from the Geography column
    assert isinstance(body["latitude"], float)
    assert isinstance(body["longitude"], float)


@pytest.mark.asyncio
async def test_get_venue_not_found_returns_404(client, auth_headers):
    resp = await client.get(f"{VENUES_URL}/{uuid.uuid4()}", headers=auth_headers)

    assert resp.status_code == 404
