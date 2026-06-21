# TP2 — Testing Implementation Tasks

> Temporary file. Tasks to be migrated to GitHub Projects once created.
> See [ADR-005](docs/adr/adr-005-testing-strategy.md) for the full rationale behind tool and framework choices.

> Dependency notation: `→` means the task can only start after the referenced task is done.

## Setup (can run in parallel)

- **TASK-0a** — Configure backend test infrastructure: add dependencies to `requirements.txt`, create test PostgreSQL database in `docker-compose.yml`, create `conftest.py` with session and HTTP client fixtures ✅
- **TASK-0b** — Configure frontend test infrastructure: install Playwright, create `playwright.config.js`

## Documentation (golden path)

- **TASK-DOC-1** — `→ TASK-0a` — Write `docs/setup/testing-backend.md`: how to start the test DB, run pytest, fixture pattern, and a short annotated example so teammates can follow the pattern for TASK-1 through TASK-4
- **TASK-DOC-2** — `→ TASK-0b` — Write `docs/setup/testing-frontend.md`: how to install Playwright, run E2E tests, and the page-object pattern used in TASK-5 and TASK-6

## Backend

- **TASK-1** — `→ TASK-0a` — Tests for authentication endpoints (`/auth/register`, `/auth/login`) and `User` model
- **TASK-2** — `→ TASK-0a` — Tests for `Venue` endpoints (list, filter by category, details)
- **TASK-3** — `→ TASK-0a` — Tests for `Record` endpoints (create, list, average rating) and `Wishlist` (add, remove)
- **TASK-4** — `→ TASK-0a` — Tests for the recommendations service (`app/services/`) with Gemini API mocked; verify overall coverage ≥ 80% and fill gaps

## E2E

- **TASK-5** — `→ TASK-0b` — Implement E2E for user registration and login
- **TASK-6** — `→ TASK-0b, TASK-5` — Implement E2E for visit record and wishlist add
