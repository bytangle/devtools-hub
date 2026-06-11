from fastapi import Request
from fastapi.responses import JSONResponse


class ToolError(Exception):
    """Domain error raised by tool services.

    Carries a machine-readable code and a safe, user-facing message.
    """

    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


async def tool_error_handler(_: Request, exc: ToolError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )
