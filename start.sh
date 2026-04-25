#!/usr/bin/env bash
set -e

trap 'kill 0' EXIT

echo "Starting database..."
docker compose up -d

echo "Starting backend..."
(cd backend && source venv/bin/activate && uvicorn app.main:app --reload) &

echo "Starting frontend..."
(cd frontend && npm run dev) &

wait
