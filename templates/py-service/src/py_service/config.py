from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Prototype-friendly defaults: SQLite file, no external services required.

    Swap `database_url` to a Postgres DSN when this graduates out of prototyping —
    everything else (models, schemas, routes) is DB-agnostic SQLAlchemy.
    """

    model_config = SettingsConfigDict(env_prefix="APP_")

    database_url: str = "sqlite:///./py_service.sqlite3"


settings = Settings()
