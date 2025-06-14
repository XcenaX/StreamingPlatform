from pydantic import BaseModel
from typing import Optional
from sqlmodel import SQLModel

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserUpdate(SQLModel):
    about: Optional[str]
    avatar_url: Optional[str]