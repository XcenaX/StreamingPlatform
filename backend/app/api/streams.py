import time
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlmodel import select, Session
from app.models.stream import Stream, StreamStatus, StreamView
from app.schemas.stream import StreamCreate
from app.db.session import get_session
from uuid import uuid4
from app.core.security import get_current_user
from app.models.user import User
from pathlib import Path
import subprocess
import os
import glob
from dotenv import load_dotenv
import shutil
from app.schemas.stream import StreamFullInfoResponse

load_dotenv()
HOST = os.getenv("HOST", "http://localhost")
VOD_PORT = 8081

router = APIRouter()

HLS_ROOT = "/hls"
FFMPEG_PIDS_DIR = "/tmp/ffmpeg_pids"

# директория для хранения PIDов процессов
os.makedirs(FFMPEG_PIDS_DIR, exist_ok=True)


@router.post("/create")
def create_stream(data: StreamCreate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    existing = session.exec(
        select(Stream).where(Stream.user_id == user.id, Stream.status == StreamStatus.live)
    ).first()

    if existing:
        raise HTTPException(400, detail="У вас уже есть активный стрим")
    
    stream = Stream(title=data.title, stream_key=uuid4().hex, user_id=user.id, status=StreamStatus.pending)
    session.add(stream)
    session.commit()
    session.refresh(stream)
    return {
        "stream_key": stream.stream_key,
        "rtmp_url": f"rtmp://{HOST}/live/",        
    }


@router.get("/active")
def get_active_streams(session: Session = Depends(get_session)):
    streams = session.exec(
        select(Stream)
        .where(Stream.status == StreamStatus.live)
        .join(User)
    ).all()

    result = []
    for stream in streams:
        username = stream.user.username
        preview_url = f"http://localhost:8081/{username}_stream{stream.id}/preview.jpg"
        result.append({
            "id": stream.id,
            "title": stream.title,
            "username": username,
            "thumbnail_url": preview_url
        })
    
    return result


@router.get("/watch/{username}")
def get_stream_by_user(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(404, detail="User not found")

    stream = session.exec(
        select(Stream).where(Stream.user_id == user.id, Stream.status == StreamStatus.live)
    ).first()

    if not stream:
        raise HTTPException(404, detail="Активный стрим не найден")

    folder_name = f"{user.username}_stream{stream.id}"
    return {
        "title": stream.title,
        "hls_url": f"{HOST}:8081/{folder_name}/master.m3u8",
        "username": user.username,
        "id": stream.id
    }


@router.get("/info/{stream_id}", response_model=StreamFullInfoResponse)
def get_stream_info(stream_id: int, session: Session = Depends(get_session)):
    stream = session.exec(select(Stream).where(Stream.id == stream_id)).first()
    if not stream:
        raise HTTPException(404, detail="Stream not found")

    return StreamFullInfoResponse.model_validate(stream, from_attributes=True)


@router.get("/my")
def my_streams(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user_streams = session.exec(
        select(Stream).where(Stream.user_id == current_user.id)
    ).all()

    results = []
    for s in user_streams:
        folder_name = f"{s.user.username}_stream{s.id}"
        hls_path = Path(f"/hls/{folder_name}/master.m3u8")
        watch_url = f"{HOST}:8081/{folder_name}/master.m3u8" if hls_path.exists() else None

        results.append({
            "id": s.id,
            "title": s.title,
            "username": current_user.username,
            "status": s.status,
            "created_at": s.created_at,            
            "watch_url": watch_url
        })

    return results


@router.delete("/delete/{stream_id}")
def delete_stream(
    stream_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stream = session.exec(select(Stream).where(Stream.id == stream_id)).first()

    if not stream:
        raise HTTPException(status_code=404, detail="Стрим не найден")
    
    if stream.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    # Формируем имя папки: username_stream{id}
    folder_name = f"{current_user.username}_stream{stream.id}"
    folder_path = Path(f"/hls/{folder_name}")

    # Удаляем всю папку со всеми файлами (ts, m3u8, mp4, flv)
    if folder_path.exists() and folder_path.is_dir():
        shutil.rmtree(folder_path)

    # Удаляем стрим из базы
    session.delete(stream)
    session.commit()

    return {"message": "Стрим и все связанные файлы удалены"}


@router.post("/on_publish")
async def on_publish(request: Request, session: Session = Depends(get_session)):
    data = await request.json()
    stream_key = data.get("stream")
    if not stream_key:
        raise HTTPException(status_code=400, detail="Missing stream key")

    # Найти стрим
    stmt = select(Stream).where(Stream.stream_key == stream_key)
    stream = session.exec(stmt).first()
    if not stream or not stream.user:
        raise HTTPException(status_code=404, detail="Stream not found")

    username = stream.user.username
    stream_id = stream.id
    folder_name = f"{username}_stream{stream_id}"
    output_dir = os.path.join(HLS_ROOT, folder_name)
    os.makedirs(output_dir, exist_ok=True)

    cmd = [
        "ffmpeg", "-i", f"rtmp://srs:1935/live/{stream_key}",

        "-filter_complex",
        "[0:v]split=5[v1][v2][v3][v4][v5]; " +
        "[v1]scale=w=1920:h=1080[v1out]; " +
        "[v2]scale=w=1280:h=720[v2out]; " +
        "[v3]scale=w=854:h=480[v3out]; " +
        "[v4]scale=w=640:h=360[v4out]; " +
        "[v5]scale=w=256:h=144[v5out]",

        # 1080p
        "-map", "[v1out]", "-map", "a:0",
        "-c:v:0", "libx264", "-b:v:0", "5000k", "-preset", "veryfast",
        "-c:a:0", "aac", "-b:a:0", "128k",

        # 720p
        "-map", "[v2out]", "-map", "a:0",
        "-c:v:1", "libx264", "-b:v:1", "3000k", "-preset", "veryfast",
        "-c:a:1", "aac", "-b:a:1", "128k",

        # 480p
        "-map", "[v3out]", "-map", "a:0",
        "-c:v:2", "libx264", "-b:v:2", "1500k", "-preset", "veryfast",
        "-c:a:2", "aac", "-b:a:2", "128k",

        # 360p
        "-map", "[v4out]", "-map", "a:0",
        "-c:v:3", "libx264", "-b:v:3", "800k", "-preset", "veryfast",
        "-c:a:3", "aac", "-b:a:3", "96k",

        # 144p
        "-map", "[v5out]", "-map", "a:0",
        "-c:v:4", "libx264", "-b:v:4", "300k", "-preset", "veryfast",
        "-c:a:4", "aac", "-b:a:4", "64k",

        "-f", "hls",
        "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3 v:4,a:4",
        "-master_pl_name", "master.m3u8",
        "-hls_time", "4",
        "-hls_playlist_type", "event",
        "-hls_segment_filename", f"{output_dir}/v%v/seg_%03d.ts",
        f"{output_dir}/v%v/index.m3u8"
    ]

    # Запуск ffmpeg
    process = subprocess.Popen(cmd)
    pid_path = os.path.join(FFMPEG_PIDS_DIR, f"{stream_key}.pid")
    with open(pid_path, "w") as f:
        f.write(str(process.pid))

    # Обновить статус стрима
    stream.status = StreamStatus.live
    session.add(stream)
    session.commit()

    return JSONResponse(content={"code": 0})


@router.post("/on_unpublish")
async def on_unpublish(request: Request, session: Session = Depends(get_session)):
    data = await request.json()
    stream_key = data.get("stream")
    if not stream_key:
        return {"code": 1, "message": "Missing stream_key"}

    stmt = select(Stream).where(Stream.stream_key == stream_key)
    stream = session.exec(stmt).first()

    if not stream or not stream.user:
        return {"code": 1, "message": "Stream or user not found"}

    # Очистка временных flv-файлов
    part_files = glob.glob(f"/hls/live/{stream_key}.*.flv")
    for f in part_files:
        os.remove(f)

    # Очистка временного списка файлов
    concat_list_path = f"/hls/tmp/{stream_key}_list.txt"
    if os.path.exists(concat_list_path):
        os.remove(concat_list_path)

    # Обновление статуса
    stream.status = StreamStatus.finished
    session.add(stream)
    session.commit()

    return {"code": 0}


@router.post("/on_connect")
async def on_connect():
    return {"code": 0}

@router.post("/on_close")
async def on_close():
    return {"code": 0}


@router.post("/stream/{stream_id}/view")
def register_view(
    stream_id: int,
    request: Request,
    session: Session = Depends(get_session)
):
    ip = request.client.host
    stream = session.get(Stream, stream_id)
    if not stream:
        raise HTTPException(404, detail="Stream not found")

    # Проверка IP
    exists = session.exec(
        select(StreamView).where(
            StreamView.stream_id == stream_id,
            StreamView.ip_address == ip
        )
    ).first()

    if not exists:
        session.add(StreamView(stream_id=stream_id, ip_address=ip))
        stream.views += 1
        session.add(stream)
        session.commit()

    return {"views": stream.views}
