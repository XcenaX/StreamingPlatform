from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    streams: List["Stream"] = Relationship(back_populates="user")
    messages: list["ChatMessage"] = Relationship(back_populates="user")
    avatar_url: Optional[str] = Field(default="", max_length=255)    
    about: Optional[str] = Field(default="", max_length=300)