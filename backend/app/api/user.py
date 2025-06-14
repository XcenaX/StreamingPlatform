from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserUpdate
from app.api.auth import get_current_user

router = APIRouter()

@router.patch("/me", response_model=User)
def update_current_user(
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user_data = user_update.dict(exclude_unset=True)

    for key, value in user_data.items():
        setattr(current_user, key, value)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user
