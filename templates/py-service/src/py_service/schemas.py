from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IdeaCreate(BaseModel):
    title: str


class IdeaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
