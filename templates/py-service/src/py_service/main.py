from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from py_service.db import Base, engine, get_db
from py_service.models import Idea
from py_service.schemas import IdeaCreate, IdeaRead


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # `create_all` is fine for prototyping; once this graduates, drop it in
    # favor of the Alembic migrations already scaffolded in alembic/.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="py-service-template", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ideas", response_model=list[IdeaRead])
def list_ideas(db: Session = Depends(get_db)) -> list[Idea]:
    return list(db.query(Idea).order_by(Idea.created_at.desc()).all())


@app.post("/ideas", response_model=IdeaRead, status_code=201)
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)) -> Idea:
    idea = Idea(title=payload.title)
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@app.delete("/ideas/{idea_id}", status_code=204)
def delete_idea(idea_id: int, db: Session = Depends(get_db)) -> None:
    idea = db.get(Idea, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    db.delete(idea)
    db.commit()
