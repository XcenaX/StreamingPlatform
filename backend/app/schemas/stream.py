from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class StreamCreate(BaseModel):
    title: str

class UserPublicResponse(BaseModel):
    username: str
    about: Optional[str]
    avatar_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class StreamBaseResponse(BaseModel):
    id: int
    title: str
    status: str
    views: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StreamFullInfoResponse(StreamBaseResponse):
    user: Optional[UserPublicResponse]

    model_config = ConfigDict(from_attributes=True)
