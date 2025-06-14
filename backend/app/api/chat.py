from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from app.models.user import User
from sqlmodel import Session, select
from app.models.stream import ChatMessage, Stream
from app.db.session import get_session
from typing import Dict, List
from datetime import datetime, timezone
from app.core.chat_manager import ConnectionManager
from fastapi import Query
from app.core.security import get_current_user
from app.core.redis import redis_client

router = APIRouter()

manager = ConnectionManager()

@router.websocket("/ws/chat/{stream_id}")
async def websocket_endpoint(stream_id: int, websocket: WebSocket, session: Session = Depends(get_session)):
    """
    WebSocket endpoint for real-time chat functionality.

    Parameters:
        stream_id (int): The ID of the stream to join.
        websocket (WebSocket): The WebSocket connection instance.
        session (Session): Database session injected by dependency.

    Expected input JSON format:
        {
            "text": "Your message",            
        }

    Output messages are broadcast in JSON format:
        {
            "text": "Your message",
            "username": "XcenaX",
            "created_at": "2025-04-23T14:05:00.123456+00:00"
        }
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401, reason="Missing token")
        return

    try:
        user = get_current_user(token=token, session=session)
    except Exception as e:
        await websocket.close(code=4401, reason="Unauthorized")
        return

    await manager.connect(stream_id, websocket)
    try:
        stream = session.exec(select(Stream).where(Stream.id == stream_id)).first()
        if not stream or not stream.created_at:
            await manager.disconnect(stream_id, websocket)
            return

        viewers = manager.get_viewer_count(stream_id)
        await manager.broadcast(stream_id, {
            "type": "viewers",
            "count": viewers
        })

        while True:
            data = await websocket.receive_json()

            now = datetime.now(timezone.utc)
            created_at = stream.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            timestamp = int((now - created_at).total_seconds())

            msg = ChatMessage(
                text=data["text"],
                stream_id=stream_id,
                created_at=now,
                timestamp=timestamp,
                user_id=user.id,
            )

            session.add(msg)
            session.commit()

            await manager.broadcast(stream_id, {
                "text": msg.text,
                "username": user.username,
                "timestamp": msg.timestamp
            })
    except WebSocketDisconnect:
        manager.disconnect(stream_id, websocket)

        viewers = manager.get_viewer_count(stream_id)
        await manager.broadcast(stream_id, {
            "type": "viewers",
            "count": viewers
        })


@router.get("/streams/{stream_id}/messages")
def get_chat_messages(
    stream_id: int,
    session: Session = Depends(get_session),
    limit: int = Query(None, gt=0),
    after: int = Query(None),  # timestamp после которого вернуть
    order: str = Query("asc", pattern="^(asc|desc)$")
):
    statement = (
        select(ChatMessage, User.username)
        .join(User, ChatMessage.user_id == User.id)
        .where(ChatMessage.stream_id == stream_id)
    )

    if after is not None:
        statement = statement.where(ChatMessage.timestamp > after)

    if order == "desc":
        statement = statement.order_by(ChatMessage.timestamp.desc())
    else:
        statement = statement.order_by(ChatMessage.timestamp)

    if limit is not None:
        statement = statement.limit(limit)

    results = session.exec(statement).all()

    return [
        {
            "text": msg.text,
            "username": username,
            "timestamp": msg.timestamp,
        }
        for msg, username in results
    ]