# KULTI — AI Assistant Instructions

> This file is for AI coding assistants. For human-readable docs, see [INDEX.md](INDEX.md).

## Rules

1. All code, comments, commits, and documentation must be written in **English**.
2. Before writing or modifying any documentation, read [Golden Path](guidelines/golden-path.md) for conventions.
3. Before making architectural decisions, check existing [ADRs](adr/) for prior decisions.
4. When adding new documentation, add a corresponding entry to [INDEX.md](INDEX.md).
5. Follow the project structure defined in the Golden Path — do not create files outside the established directories without justification.
6. Commit messages must be a **single line** in the imperative mood (≤ 72 chars). No multi-line bodies.
7. Before opening a pull request, read `.github/pull_request_template.md` and fill every section. Use `gh pr create --body "..."` (or `--body-file`) to submit the completed description in one step — do not open the PR with an empty description and update it later. After the PR is created: (a) identify the related GitHub issue number from the task context or branch name, (b) find its project item ID with `gh api graphql` querying `user.projectV2(number: 3).items`, and (c) update its status to **Code Review** using `updateProjectV2ItemFieldValue`. Do not skip this step even if the PR does not use `Closes #N` syntax.
8. Before creating or modifying any file inside `backend/tests/`, read [Backend Testing Guide](guidelines/testing-backend.md) and follow the fixture pattern and conventions defined there.
9. Before creating or modifying any file inside `frontend/src/tests/`, read [Frontend Unit Testing Guide](guidelines/testing-frontend-unit.md) and follow the mock patterns and conventions defined there.
10. Before creating or modifying any file inside `frontend/e2e/`, read [E2E Testing Guide](guidelines/testing-e2e.md) and follow the accessible selector patterns and conventions defined there.

## Documentation Map

### Setup & Infrastructure
- `docs/SETUP.md` — Getting started guide (prerequisites, env vars, first run)
- `docs/setup/backend-setup.md` — Python venv, dependencies, running FastAPI
- `docs/setup/auth-api.md` — Authentication endpoints and request/response examples
- `docs/setup/venues-api.md` — Venue listing, detail, search, and filter endpoints
- `docs/setup/docker-setup.md` — Docker Compose for PostgreSQL + PostGIS
- `docs/setup/database-schema.md` — ER diagram, conventions, and column reference for all tables

### Architecture Decision Records
- `docs/adr/adr-001-orm-choice.md` — SQLAlchemy + GeoAlchemy2 + Pydantic over SQLModel
- `docs/adr/adr-002-ai-entry-points.md` — AI assistant entry points for coding tools
- `docs/adr/adr-003-venue-modeling.md` — Venue table modeling decisions
- `docs/adr/adr-004-average-rating-strategy.md` — Compute average ratings on demand, not denormalized

### Team Conventions
- `docs/guidelines/golden-path.md` — Naming, branching, commits, project structure, tech stack
- `docs/guidelines/acceptance-criteria.md` — PR and task completion rules
- `docs/guidelines/testing-backend.md` — Backend test conventions: fixture pattern, file structure, how to seed data and mock external services

## Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Frontend | React.js             |
| Backend  | FastAPI (Python)     |
| Database | PostgreSQL + PostGIS |
| AI       | Gemini API           |

## Project Structure

```
├── docs/                   # Documentation (see INDEX.md)
│   ├── SETUP.md            # Getting started guide
│   ├── setup/              # Environment & infrastructure
│   ├── adr/                # Architecture Decision Records
│   └── guidelines/         # Team conventions & standards
├── backend/
│   └── app/
│       ├── api/            # Route handlers / endpoints
│       ├── models/         # Database models (SQLAlchemy)
│       ├── schemas/        # Pydantic schemas (request/response)
│       ├── services/       # Business logic
│       └── core/           # Config, security, dependencies
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page-level components / routes
│       ├── services/       # API calls and external integrations
│       └── assets/         # Images, fonts, static files
```
