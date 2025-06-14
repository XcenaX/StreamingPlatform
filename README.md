# Simple Streaming Service

Twitch-inspired pet project where users can launch streams, watch VODs, and chat in real time.

---

## 🚀 Features

- ✅ JWT-based authentication and registration
- ✅ Stream broadcasting using SRS + FFmpeg
- ✅ Watch LIVE and VOD streams
- ✅ Automatic thumbnail generation
- ✅ Built-in chat WebSocket + Redis (still developing this)
- ✅ "My Streams" dashboard with inline editing
- ✅ Sidebar with active channels
- ✅ Responsive UI (React + MUI)

---

## 🧱 Tech Stack

| Technology     | Purpose                              |
|----------------|--------------------------------------|
| **FastAPI**    | Backend + WebSocket + Auth           |
| **PostgreSQL** | Store users and stream metadata      |
| **Redis**      | Real-time viewer count tracking      |
| **SRS**        | RTMP streaming server                |
| **FFmpeg**     | Encoding streams & generating thumbnails |
| **React**      | Frontend (SPA)                       |
| **Docker**     | Containerized services               |

---

## 📦 Setup

### 🔧 1. Clone the repository

```bash
git clone https://github.com/XcecnaX/StreamingPlatform.git
cd StreamingPlatform
```

### 🐳 2. Run with Docker

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- SRS (RTMP): `rtmp://localhost/live/`

To start stream you need to open OBS. In stream service selection choose custom and paste this credentials
Host: `rtmp://localhost/live/`
Stream key: `you can get it when creating a stream on platform`
