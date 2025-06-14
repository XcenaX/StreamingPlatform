from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from app.models.user import User
from enum import Enum
from datetime import datetime, timezone

class StreamStatus(str, Enum):
    pending = "pending"
    live = "live"
    finished = "finished"

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    timestamp: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    stream_id: Optional[int] = Field(default=None, foreign_key="stream.id")
    stream: Optional["Stream"] = Relationship(back_populates="messages")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="messages")

class Stream(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    stream_key: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: StreamStatus = Field(default=StreamStatus.pending)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="streams")
    messages: list[ChatMessage] = Relationship(back_populates="stream")
    views: int = Field(default=0)

class StreamView(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    stream_id: int = Field(foreign_key="stream.id")
    ip_address: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))