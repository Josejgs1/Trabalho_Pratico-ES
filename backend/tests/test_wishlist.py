"""Tests for Wishlist endpoints (POST, DELETE, GET /, GET /{venue_id}/status)."""

import uuid
import pytest
from geoalchemy2.elements import WKTElement
from app.models.venue import Venue


REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"
WISHLISTS_URL = "/wishlists"

_USER = {"name": "Wishlist Tester", "email": "wishlists@test.com", "password": "securepassword"}


@pytest.fixture()
async def auth_headers(client) -> dict[str, str]:
    await client.post(REGISTER_URL, json=_USER)
    resp = await client.post(LOGIN_URL, json={"email": _USER["email"], "password": _USER["password"]})
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture()
def venue(db) -> Venue:
    v = Venue(
        id=uuid.uuid4(),
        name="Galeria Test",
        category="Contemporary Art",
        address="Rua Y, 2",
        location=WKTElement("POINT(-43.9 -19.9)", srid=4326),
    )
    db.add(v)
    db.flush()
    return v


# POST /wishlists/

@pytest.mark.asyncio
async def test_add_to_wishlist(client, db, auth_headers, venue):
    resp = await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(venue.id)}, headers=auth_headers)

    assert resp.status_code == 201
    body = resp.json()
    assert body["venue_id"] == str(venue.id)


@pytest.mark.asyncio
async def test_add_duplicate_returns_409(client, db, auth_headers, venue):
    await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(venue.id)}, headers=auth_headers)
    resp = await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(venue.id)}, headers=auth_headers)

    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_add_requires_auth(client):
    resp = await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(uuid.uuid4())})

    assert resp.status_code == 401


# GET /wishlists/

@pytest.mark.asyncio
async def test_list_wishlist(client, db, auth_headers, venue):
    await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(venue.id)}, headers=auth_headers)
    resp = await client.get(f"{WISHLISTS_URL}/", headers=auth_headers)

    assert resp.status_code == 200
    assert len(resp.json()) >= 1
    assert any(w["venue_id"] == str(venue.id) for w in resp.json())


# DELETE /wishlists/{venue_id}

@pytest.mark.asyncio
async def test_remove_from_wishlist(client, db, auth_headers, venue):
    await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(venue.id)}, headers=auth_headers)
    resp = await client.delete(f"{WISHLISTS_URL}/{venue.id}", headers=auth_headers)

    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_remove_not_in_wishlist_returns_404(client, auth_headers):
    resp = await client.delete(f"{WISHLISTS_URL}/{uuid.uuid4()}", headers=auth_headers)

    assert resp.status_code == 404


# GET /wishlists/{venue_id}/status

@pytest.mark.asyncio
async def test_check_wishlist_status_true(client, db, auth_headers, venue):
    await client.post(f"{WISHLISTS_URL}/", json={"venue_id": str(venue.id)}, headers=auth_headers)
    resp = await client.get(f"{WISHLISTS_URL}/{venue.id}/status", headers=auth_headers)

    assert resp.status_code == 200
    assert resp.json()["wishlisted"] is True


@pytest.mark.asyncio
async def test_check_wishlist_status_false(client, auth_headers):
    resp = await client.get(f"{WISHLISTS_URL}/{uuid.uuid4()}/status", headers=auth_headers)

    assert resp.status_code == 200
    assert resp.json()["wishlisted"] is False
