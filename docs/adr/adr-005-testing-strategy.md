[← Back to Index](../INDEX.md)

# ADR-005: Testing Strategy (TP2)

## Status
Accepted

## Date
2026-06-16

## Context
TP2 requires the team to add automated tests to the existing KULTI codebase with the following constraints:

- Unit and/or integration tests with at least **80% coverage**
- Exactly **4 end-to-end (E2E) tests**
- The professor suggested Cypress or Playwright for E2E

The stack is FastAPI (Python) on the backend and React + Vite on the frontend.

## Decision

### Backend: pytest + httpx
- `pytest` is the standard test runner in the Python ecosystem
- `httpx AsyncClient` is the officially recommended way to test FastAPI endpoints
- `pytest-cov` produces the coverage report required for the presentation
- `pytest-asyncio` enables async test isolation via transaction rollback per test

New dependencies to add to `requirements.txt`:
```
pytest==8.3.5
pytest-asyncio==0.24.0
pytest-cov==6.0.0
httpx==0.28.1
```

### Frontend/E2E: Playwright
- Preferred over Cypress due to better stability with Mapbox (heavy canvas-based rendering)
- Native multi-browser support (Chromium, Firefox, WebKit)
- `--ui` mode makes live demonstration in the classroom straightforward
- Integrates directly with Vite

New dev dependencies:
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

## Rationale
- Both choices are the idiomatic, well-documented options for their respective stacks
- They avoid introducing unfamiliar tooling that would slow down a short-deadline delivery
- Playwright's stability advantage over Cypress is significant given the Mapbox dependency

## Consequences
- A `conftest.py` must be created with fixtures for the test database session and HTTP client
- The Gemini API calls must be mocked with `unittest.mock.patch` to keep tests deterministic and offline
- Coverage must be run before the presentation: `pytest --cov=app --cov-report=term-missing --cov-fail-under=80`
- Focus modules for coverage: `app/api/`, `app/services/`; Pydantic schema validation is exercised naturally through endpoint tests
- 4 E2E flows to implement: user registration, login + map load, visit record, wishlist add

## See Also
- [Golden Path](../guidelines/golden-path.md) — project structure and tech stack
- [AI Suggestions Behavior](../guidelines/ai-suggestions-behavior.md) — Gemini integration to be mocked in tests
