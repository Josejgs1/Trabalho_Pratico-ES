"""Tests for Record endpoints (POST, GET /, GET /{id}, PUT /{id})."""

import uuid
import pytest
from geoalchemy2.elements import WKTElement
from app.models.venue import Venue


REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"
RECORDS_URL = "/records"

_USER = {"name": "Record Tester", "email": "records@test.com", "password": "securepassword"}


@pytest.fixture()
async def auth_headers(client) -> dict[str, str]:
    await client.post(REGISTER_URL, json=_USER)
    resp = await client.post(LOGIN_URL, json={"email": _USER["email"], "password": _USER["password"]})
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture()
def venue(db) -> Venue:
    v = Venue(
        id=uuid.uuid4(),
        name="Museu Test",
        category="History",
        address="Rua X, 1",
        location=WKTElement("POINT(-43.9 -19.9)", srid=4326),
    )
    db.add(v)
    db.flush()
    return v


# POST /records/

@pytest.mark.asyncio
async def test_create_record(client, db, auth_headers, venue):
    payload = {"venue_id": str(venue.id), "rating": 4, "comment": "Great museum"}
    resp = await client.post(f"{RECORDS_URL}/", json=payload, headers=auth_headers)

    assert resp.status_code == 201
    body = resp.json()
    assert body["venue_id"] == str(venue.id)
    assert body["rating"] == 4
    assert body["comment"] == "Great museum"


@pytest.mark.asyncio
async def test_create_record_invalid_rating(client, db, auth_headers, venue):
    payload = {"venue_id": str(venue.id), "rating": 6}
    resp = await client.post(f"{RECORDS_URL}/", json=payload, headers=auth_headers)

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_record_duplicate_returns_409(client, db, auth_headers, venue):
    payload = {"venue_id": str(venue.id), "rating": 3}
    await client.post(f"{RECORDS_URL}/", json=payload, headers=auth_headers)
    resp = await client.post(f"{RECORDS_URL}/", json=payload, headers=auth_headers)

    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_create_record_requires_auth(client):
    resp = await client.post(f"{RECORDS_URL}/", json={"venue_id": str(uuid.uuid4()), "rating": 3})

    assert resp.status_code == 401


# GET /records/

@pytest.mark.asyncio
async def test_list_records(client, db, auth_headers, venue):
    await client.post(f"{RECORDS_URL}/", json={"venue_id": str(venue.id), "rating": 5}, headers=auth_headers)
    resp = await client.get(f"{RECORDS_URL}/", headers=auth_headers)

    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_list_records_filter_by_venue(client, db, auth_headers, venue):
    await client.post(f"{RECORDS_URL}/", json={"venue_id": str(venue.id), "rating": 4}, headers=auth_headers)
    resp = await client.get(f"{RECORDS_URL}/", params={"venue_id": str(venue.id)}, headers=auth_headers)

    assert resp.status_code == 200
    assert all(r["venue_id"] == str(venue.id) for r in resp.json())


# GET /records/{id}

@pytest.mark.asyncio
async def test_get_record_by_id(client, db, auth_headers, venue):
    create_resp = await client.post(f"{RECORDS_URL}/", json={"venue_id": str(venue.id), "rating": 3}, headers=auth_headers)
    record_id = create_resp.json()["id"]

    resp = await client.get(f"{RECORDS_URL}/{record_id}", headers=auth_headers)

    assert resp.status_code == 200
    assert resp.json()["id"] == record_id


@pytest.mark.asyncio
async def test_get_record_not_found(client, auth_headers):
    resp = await client.get(f"{RECORDS_URL}/{uuid.uuid4()}", headers=auth_headers)

    assert resp.status_code == 404


# PUT /records/{id}

@pytest.mark.asyncio
async def test_update_record(client, db, auth_headers, venue):
    create_resp = await client.post(f"{RECORDS_URL}/", json={"venue_id": str(venue.id), "rating": 2}, headers=auth_headers)
    record_id = create_resp.json()["id"]

    resp = await client.put(f"{RECORDS_URL}/{record_id}", json={"rating": 5, "comment": "Updated"}, headers=auth_headers)

    assert resp.status_code == 200
    assert resp.json()["rating"] == 5
    assert resp.json()["comment"] == "Updated"


@pytest.mark.asyncio
async def test_update_record_invalid_rating(client, db, auth_headers, venue):
    create_resp = await client.post(f"{RECORDS_URL}/", json={"venue_id": str(venue.id), "rating": 3}, headers=auth_headers)
    record_id = create_resp.json()["id"]

    resp = await client.put(f"{RECORDS_URL}/{record_id}", json={"rating": 0}, headers=auth_headers)

    assert resp.status_code == 422
