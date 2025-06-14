from fastapi import FastAPI
from app.api import auth, streams, chat, user
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import init_db
from fastapi.openapi.utils import get_openapi
from app.db.session import engine
from app.admin import setup_admin

app = FastAPI()

setup_admin(app, engine)

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(streams.router, prefix="/stream")
app.include_router(chat.router)
app.include_router(user.router, prefix="/users")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Streaming API",
        version="1.0.0",
        description="Документация API",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi