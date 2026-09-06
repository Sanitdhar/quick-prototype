# py-service-template

FastAPI + Pydantic v2 + SQLAlchemy 2.0 starter for backend/API prototypes. See
[`docs/STACK.md`](../../docs/STACK.md) for why these are the defaults.

## Run it

```bash
uv sync
uv run uvicorn py_service.main:app --reload
```

Visit `http://127.0.0.1:8000/docs` for the interactive API docs.

## Test / lint / typecheck

```bash
uv run pytest
uv run ruff check .
uv run mypy src
```

## Data model

- `models.py` — SQLAlchemy ORM models (the DB shape).
- `schemas.py` — Pydantic schemas (the API contract).

Keeping these separate means the DB layer can change without breaking the API contract, and
vice versa — worth the extra file for anything beyond a throwaway script.

On startup, tables are created directly from the models (`Base.metadata.create_all`) for
prototyping speed. An Alembic setup already lives in `alembic/` — switch to real migrations
(`alembic revision --autogenerate`) as soon as this needs to preserve data across schema
changes, and drop the `create_all` call in `main.py`'s lifespan handler.

## Config

Settings come from `config.py` (Pydantic `BaseSettings`), overridable via `APP_`-prefixed env
vars, e.g. `APP_DATABASE_URL=postgresql://...`. Default is a local SQLite file — zero external
infra needed to start prototyping.
