[← Back to Index](../INDEX.md)

# ADR-001: Use SQLAlchemy + GeoAlchemy2 + Pydantic as ORM/Schema Stack

## Status
Accepted

## Date
2026-04-01

## Context
KULTI uses FastAPI (Python) with PostgreSQL + PostGIS. We needed to define how to model database entities (museums, galleries, etc.) and validate data in the API. The options considered were:

1. **SQLAlchemy + Pydantic** (separate) + GeoAlchemy2
2. **SQLModel** (combines SQLAlchemy + Pydantic into a single class)

## Decision
We will adopt **SQLAlchemy + GeoAlchemy2 + Pydantic**, with models and schemas defined separately.

## Rationale
- The project relies on **PostGIS** for geographic columns (`Geography`, `Geometry`). GeoAlchemy2 integrates well with plain SQLAlchemy but has limited compatibility with SQLModel.
- Separating models (DB) and schemas (API) provides more flexibility — e.g., we store a `POINT` in the database but expose `latitude`/`longitude` in the API.
- SQLAlchemy is mature, well-documented, and widely adopted in the Python ecosystem.
- SQLModel is still relatively young and has limitations with advanced column types and complex relationships.

## Consequences
- There will be partial duplication between SQLAlchemy models (`models/`) and Pydantic schemas (`schemas/`).
- Migrations will be managed with **Alembic**.
- Additional dependencies: `sqlalchemy`, `geoalchemy2`, `alembic`, `psycopg2-binary`.

## See Also

- [Golden Path](../guidelines/golden-path.md) — project structure (`models/` and `schemas/` directories)
- [Docker Setup](../setup/docker-setup.md) — PostgreSQL + PostGIS configuration
