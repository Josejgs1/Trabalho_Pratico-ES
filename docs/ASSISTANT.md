# KULTI — AI Assistant Instructions

> This file is for AI coding assistants. For human-readable docs, see [INDEX.md](INDEX.md).

## Rules

1. All code, comments, commits, and documentation must be written in **English**.
2. Before writing or modifying any documentation, read [Golden Path](guidelines/golden-path.md) for conventions.
3. Before making architectural decisions, check existing [ADRs](adr/) for prior decisions.
4. When adding new documentation, add a corresponding entry to [INDEX.md](INDEX.md).
5. Follow the project structure defined in the Golden Path — do not create files outside the established directories without justification.
6. Commit messages must be a **single line** in the imperative mood (≤ 72 chars). No multi-line bodies.

## Documentation Map

### Setup & Infrastructure
- `docs/setup/backend-setup.md` — Python venv, dependencies, running FastAPI
- `docs/setup/auth-api.md` — Authentication endpoints and request/response examples
- `docs/setup/docker-setup.md` — Docker Compose for PostgreSQL + PostGIS
- `docs/setup/database-schema.md` — ER diagram, conventions, and column reference for all tables

### Architecture Decision Records
- `docs/adr/adr-001-orm-choice.md` — SQLAlchemy + GeoAlchemy2 + Pydantic over SQLModel
- `docs/adr/adr-002-ai-entry-points.md` — AI assistant entry points for coding tools
- `docs/adr/adr-003-venue-modeling.md` — Venue table modeling decisions

### Team Conventions
- `docs/guidelines/golden-path.md` — Naming, branching, commits, project structure, tech stack
- `docs/guidelines/acceptance-criteria.md` — PR and task completion rules

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