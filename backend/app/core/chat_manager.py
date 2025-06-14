from typing import Dict, List
from fastapi import WebSocket
from app.core.redis import redis_client

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, stream_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(stream_id, []).append(websocket)
        redis_client.incr(f"stream:{stream_id}:viewers")

    def disconnect(self, stream_id: int, websocket: WebSocket):
        if stream_id in self.active_connections:
            self.active_connections[stream_id].remove(websocket)
            redis_client.decr(f"stream:{stream_id}:viewers")

    def get_viewer_count(self, stream_id: int) -> int:
        return int(redis_client.get(f"stream:{stream_id}:viewers") or 0)

