[← Back to Index](../INDEX.md)

# Backend Testing Guide

How to run the test suite and how to write new tests for the KULTI backend.

## Prerequisites

- Docker running (for the test database)
- Python venv set up inside `backend/`

## 1. Start the test database

```bash
docker compose up db-test -d
```

This starts a throwaway PostGIS instance on port **5433** (separate from the dev DB on 5432). Data is stored in `tmpfs` — the container starts clean on every restart.

## 2. Activate the virtual environment

```bash
cd backend
source .venv/bin/activate   # or: python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Run the tests

```bash
# all tests with verbose output
pytest -v

# with coverage report
pytest -v --cov=app --cov-report=term-missing

# single file
pytest -v tests/test_auth.py
```

The minimum required coverage is **80%** (`--cov-fail-under=80`).

---

## How tests are structured

```
backend/
├── pytest.ini          # asyncio_mode = auto, testpaths, pythonpath
└── tests/
    ├── conftest.py     # shared fixtures (DB session, HTTP client)
    ├── test_auth.py    # reference: auth endpoints
    └── test_venue.py   # reference: venue endpoints
```

Each new task gets its own file: `test_record.py`, `test_wishlist.py`, `test_recommendation.py`.

---

## Key fixtures (from `conftest.py`)

| Fixture | Scope | What it gives you |
|---------|-------|-------------------|
| `setup_database` | session | Creates all tables once; drops them at the end |
| `db` | function | A DB session wrapped in a transaction that is **rolled back** after each test — no manual cleanup needed |
| `client` | function | An async HTTPX client wired to the FastAPI app; `get_db` is overridden to use the same `db` session |

---

## Writing a new test — the pattern

Every test follows the same three-step structure:

```python
@pytest.mark.asyncio
async def test_something(client, db):
    # 1. Arrange — seed data directly through the DB session
    user = User(name="Bob", email="bob@test.com", password_hash=hash_password("pass"))
    db.add(user)
    db.flush()

    # 2. Act — call the endpoint
    resp = await client.get("/some/endpoint", headers={"Authorization": f"Bearer {token}"})

    # 3. Assert — check status code and response body
    assert resp.status_code == 200
    assert resp.json()["email"] == "bob@test.com"
```

Key rules:
- **Seed via `db`, not via HTTP** — inserting directly is faster and keeps tests independent.
- **Use `db.flush()` instead of `db.commit()`** — keeps the data inside the rollback boundary so the transaction is cleaned up automatically.
- **Mock external services** — use `unittest.mock.patch` for any call to the Gemini API so tests are offline and deterministic. See `test_recommendation.py` (TASK-4) for the pattern.

---

## See Also

- [ADR-005](../adr/adr-005-testing-strategy.md) — rationale for pytest + httpx
- [Backend Setup](backend-setup.md) — venv and dependency installation
- [Frontend Testing Guide](testing-frontend.md) — Playwright E2E setup
