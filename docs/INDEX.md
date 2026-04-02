# KULTI — Documentation Index

> This file is a manifest for AI tools and developers. It maps every doc in this repository.

## setup/ — Environment & Infrastructure

| File | Description |
|------|-------------|
| [backend-setup.md](setup/backend-setup.md) | Python venv setup, dependency install, and how to run the FastAPI server |
| [docker-setup.md](setup/docker-setup.md) | Docker Compose setup for the PostgreSQL + PostGIS database |
| [database-schema.md](setup/database-schema.md) | ER diagram, conventions, and detailed column reference for all tables |

## adr/ — Architecture Decision Records

| File | Description |
|------|-------------|
| [adr-001-orm-choice.md](adr/adr-001-orm-choice.md) | Decision to use SQLAlchemy + GeoAlchemy2 + Pydantic over SQLModel |
| [adr-002-ai-entry-points.md](adr/adr-002-ai-entry-points.md) | Decision to add AI assistant entry points for coding tools |
| [adr-003-venue-modeling.md](adr/adr-003-venue-modeling.md) | Venue table modeling decisions (PK, geography, category, driver, Alembic config) |

## guidelines/ — Team Conventions & Standards

| File | Description |
|------|-------------|
| [golden-path.md](guidelines/golden-path.md) | Naming conventions, branch strategy, commit style, project structure, tech stack |
| [acceptance-criteria.md](guidelines/acceptance-criteria.md) | Rules for acceptance criteria on user stories and PRs |
| [ai-tools-access.md](guidelines/ai-tools-access.md) | Recommended AI agents and mapping libraries access status |
