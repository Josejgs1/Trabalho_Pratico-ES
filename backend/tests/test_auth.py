"""
Reference tests for authentication endpoints.

Covers:
- POST /auth/register  — happy path, duplicate email
- POST /auth/login     — valid credentials, wrong password, unknown email
- GET  /auth/me        — authenticated user, missing token

These tests are meant to show teammates the testing pattern:
  1. Arrange: build a payload dict.
  2. Act: call `await client.post(...)`.
  3. Assert: check status code and JSON fields.
"""

import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"
ME_URL = "/auth/me"

USER_PAYLOAD = {
    "name": "Alice Test",
    "email": "alice@test.com",
    "password": "securepassword",
}


async def _register_and_login(client) -> str:
    """Register a user and return a valid Bearer token."""
    await client.post(REGISTER_URL, json=USER_PAYLOAD)
    resp = await client.post(
        LOGIN_URL,
        json={"email": USER_PAYLOAD["email"], "password": USER_PAYLOAD["password"]},
    )
    return resp.json()["access_token"]


# ---------------------------------------------------------------------------
# /auth/register
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_register_success(client):
    resp = await client.post(REGISTER_URL, json=USER_PAYLOAD)

    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == USER_PAYLOAD["email"]
    assert body["name"] == USER_PAYLOAD["name"]
    assert "id" in body
    # Password must never be returned
    assert "password" not in body
    assert "password_hash" not in body


@pytest.mark.asyncio
async def test_register_normalizes_email(client):
    payload = {**USER_PAYLOAD, "email": "  ALICE@Test.COM  "}
    resp = await client.post(REGISTER_URL, json=payload)

    assert resp.status_code == 201
    assert resp.json()["email"] == "alice@test.com"


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_409(client):
    await client.post(REGISTER_URL, json=USER_PAYLOAD)
    resp = await client.post(REGISTER_URL, json=USER_PAYLOAD)

    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_missing_required_fields_returns_422(client):
    resp = await client.post(REGISTER_URL, json={"email": "x@x.com"})  # no name/password

    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# /auth/login
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post(REGISTER_URL, json=USER_PAYLOAD)
    resp = await client.post(
        LOGIN_URL,
        json={"email": USER_PAYLOAD["email"], "password": USER_PAYLOAD["password"]},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == USER_PAYLOAD["email"]


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client):
    await client.post(REGISTER_URL, json=USER_PAYLOAD)
    resp = await client.post(
        LOGIN_URL,
        json={"email": USER_PAYLOAD["email"], "password": "wrongpassword"},
    )

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email_returns_401(client):
    resp = await client.post(
        LOGIN_URL,
        json={"email": "nobody@test.com", "password": "whatever"},
    )

    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# /auth/me
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_me_returns_current_user(client):
    token = await _register_and_login(client)
    resp = await client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})

    assert resp.status_code == 200
    assert resp.json()["email"] == USER_PAYLOAD["email"]


@pytest.mark.asyncio
async def test_me_without_token_returns_401(client):
    resp = await client.get(ME_URL)

    assert resp.status_code == 401
