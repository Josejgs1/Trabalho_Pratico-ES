[← Back to Index](../INDEX.md)

# ADR-003: Venue Table Modeling Decisions

## Status
Accepted

## Date
2026-04-01

## Context
KULTI needs a database table to represent museums and galleries (collectively "venues"). The table must support map display (US2), venue detail pages (US3), category filtering (US4), and serve as the foreign-key target for future visit logs (US5), ratings (US6), wishlists (US7), and AI recommendations (US8). The stack is PostgreSQL + PostGIS with SQLAlchemy + GeoAlchemy2 + Pydantic (ADR-001).

## Decisions

### 1. UUID primary key instead of auto-increment integer
UUIDs allow ID generation on the client side without a database round-trip, which simplifies bulk imports and future multi-source data ingestion (e.g., importing venues from external APIs). The trade-off is slightly larger index size, which is acceptable for the expected dataset scale.

### 2. Single `Geography(POINT, 4326)` column instead of separate `latitude`/`longitude` columns
PostGIS `Geography` enables spatial queries (proximity search, bounding-box filtering) directly in SQL, which is essential for US2 (map display of nearby venues). Storing two floats would require manual Haversine calculations and prevent use of spatial indexes. SRID 4326 (WGS 84) matches standard GPS coordinates. The Pydantic schemas expose `latitude`/`longitude` for the API, following the separation rationale from ADR-001.

### 3. `category` as a `VARCHAR(100)` instead of a foreign-key to a categories table or a PostgreSQL enum
A free-text category keeps the MVP simple — no extra table, no migration needed to add new categories. An enum would require a migration every time a new category is introduced. A separate table adds join complexity for minimal benefit at this stage. If the category list stabilizes, this can be migrated to an enum or lookup table later.

### 4. `psycopg[binary]` (psycopg3) instead of `psycopg2-binary`
`psycopg2-binary` does not ship pre-built wheels for Python 3.14, causing build failures. `psycopg` (v3) is the actively maintained successor, supports Python 3.14, and is the recommended driver by the psycopg project. SQLAlchemy supports it via the `postgresql+psycopg` dialect.

### 5. SQLAlchemy upgraded from 2.0.40 to 2.0.48
SQLAlchemy 2.0.40 has a `typing.Union` incompatibility with Python 3.14 in its `Mapped` annotation processing. Version 2.0.48 fixes this.

### 6. Alembic `include_object` whitelist to ignore PostGIS system tables
The `postgis/postgis` Docker image pre-installs Tiger geocoder tables in the `public` schema. Without filtering, Alembic autogenerate detects these as "removed tables" and generates destructive `DROP TABLE` statements. The `include_object` callback in `env.py` restricts autogenerate to only tables defined in our `Base.metadata`.

### 7. Spatial index managed by GeoAlchemy2, not Alembic
GeoAlchemy2 automatically creates a GiST spatial index on `Geography` columns during `CREATE TABLE`. Alembic autogenerate also detects the index and emits a duplicate `CREATE INDEX`, causing a `DuplicateTable` error. The explicit `create_index` was removed from the migration to avoid the conflict.

## Consequences
- The `venues` table is ready for CRUD operations and spatial queries.
- Future tables (visits, ratings, wishlists) can reference `venues.id` as a foreign key.
- Category values are not constrained at the database level — validation should happen in the application layer (Pydantic schemas).
- The project now requires Python 3.14-compatible versions of SQLAlchemy (≥2.0.48) and psycopg (v3).
- New models added to the project must be imported in `models/__init__.py` to be picked up by Alembic autogenerate.

## See Also
- [ADR-001: ORM Choice](adr-001-orm-choice.md) — SQLAlchemy + GeoAlchemy2 + Pydantic
- [Venue Entity Diagram](../diagrams/venue-entity.md) — Mermaid ER diagram
