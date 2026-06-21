"""
Test configuration and shared fixtures.

Test database: postgis/postgis:16-3.4 running on port 5433 (db-test in docker-compose.yml).
Start it with: docker compose up db-test -d

Each test function gets a fresh DB transaction that is rolled back after the test,
so tests are fully isolated without needing to truncate tables.
"""

import os
import pytest

# Point to the test database BEFORE any app module is imported.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://kulti_test:kulti_test@localhost:5433/kulti_test",
)
os.environ.setdefault("AUTH_SECRET_KEY", "test-secret-key")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("GEMINI_MODEL", "gemini-1.5-flash")
os.environ.setdefault("POSTGRES_USER", "kulti_test")
os.environ.setdefault("POSTGRES_PASSWORD", "kulti_test")
os.environ.setdefault("POSTGRES_DB", "kulti_test")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from httpx import ASGITransport, AsyncClient

from app.core.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once per test session, drop them at the end."""
    # PostGIS extension must exist before GeoAlchemy2 can create geography columns.
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """
    Yields a DB session wrapped in a transaction that is rolled back after each
    test, keeping the database clean without explicit teardown code.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
async def client(db):
    """
    Yields an async HTTPX client wired to the FastAPI app.
    The app's `get_db` dependency is overridden to use the test session so that
    every request shares the same rolled-back transaction as the `db` fixture.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
