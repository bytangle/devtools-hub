from dataclasses import dataclass, field

from fastapi import APIRouter


@dataclass(frozen=True)
class ToolDefinition:
    """A self-contained server-side tool.

    Each tool lives in its own package under ``app.tools`` and exposes a
    module-level ``tool`` attribute. The registry auto-discovers it and the
    app mounts its router under ``/api/tools/{id}``.
    """

    id: str
    name: str
    description: str
    router: APIRouter
    version: str = "1.0.0"
    tags: list[str] = field(default_factory=list)
