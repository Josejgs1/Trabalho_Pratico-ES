[← Back to Index](../INDEX.md)

# Backend Setup

> Before starting, make sure the database is running. See [Docker Setup](docker-setup.md).

## Prerequisites

- [Python 3.12+](https://www.python.org/downloads/)

## Installation

1. Create a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   ```

2. Activate it:
   ```bash
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running

```bash
uvicorn app.main:app --reload
```

## See Also

- [Docker Setup](docker-setup.md) — database setup
- [Golden Path](../guidelines/golden-path.md) — project conventions and structure
- [ADR-001: ORM Choice](../adr/adr-001-orm-choice.md) — why we use SQLAlchemy + GeoAlchemy2
