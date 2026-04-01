[← Back to Index](../INDEX.md)

# Docker Setup

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running

## First-Time Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials if needed.

3. Start the database:
   ```bash
   docker compose up -d
   ```

4. Verify it's running:
   ```bash
   docker compose ps
   ```

## Connection Details

| Field    | Value       |
|----------|-------------|
| Host     | `localhost` |
| Port     | `5432`      |
| User     | see `.env`  |
| Password | see `.env`  |
| Database | see `.env`  |

## Useful Commands

```bash
# Stop the database
docker compose down

# View logs
docker compose logs db

# Reset database (deletes all data)
docker compose down -v
```

## Next Steps

- [Backend Setup](backend-setup.md) — install Python dependencies and run the API
