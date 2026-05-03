#!/usr/bin/env bash
set -e

trap 'kill 0' EXIT

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "Starting database..."
docker compose up -d

echo "Starting backend..."
(cd backend && source venv/bin/activate && uvicorn app.main:app --reload) &

echo "Starting frontend..."
(cd frontend && npm run dev) &

wait
