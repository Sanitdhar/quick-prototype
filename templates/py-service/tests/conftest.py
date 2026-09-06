import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# `py_service.config.settings` is a module-level singleton read at import time,
# so this must run before importing anything from py_service — otherwise the
# app's lifespan handler runs `create_all` against the real on-disk default
# (./py_service.sqlite3) as a side effect of every test run, instead of the
# in-memory engine this file overrides `get_db` with below.
os.environ.setdefault("APP_DATABASE_URL", "sqlite://")

from py_service.db import Base, get_db
from py_service.main import app


@pytest.fixture
def client() -> Generator[TestClient]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[object]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
