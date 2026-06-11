from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import ToolError, tool_error_handler
from app.tools import discover_tools


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    app.add_exception_handler(ToolError, tool_error_handler)

    tools = discover_tools()

    @app.get("/api/health", tags=["meta"])
    async def health() -> dict:
        return {"status": "ok", "tools": len(tools)}

    @app.get("/api/tools", tags=["meta"])
    async def list_tools() -> list[dict]:
        return [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "version": t.version,
                "tags": t.tags,
            }
            for t in tools
        ]

    for t in tools:
        app.include_router(t.router, prefix=f"/api/tools/{t.id}", tags=[t.id])

    return app


app = create_app()
