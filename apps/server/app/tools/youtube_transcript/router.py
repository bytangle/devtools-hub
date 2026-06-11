from fastapi import APIRouter, Query

from app.tools.youtube_transcript import service
from app.tools.youtube_transcript.schemas import (
    LanguagesResponse,
    TranscriptRequest,
    TranscriptResponse,
)

router = APIRouter()


@router.post("/transcript", response_model=TranscriptResponse)
def fetch_transcript(req: TranscriptRequest) -> TranscriptResponse:
    """Fetch a video transcript rendered in the requested format."""
    return service.get_transcript(req)


@router.get("/languages", response_model=LanguagesResponse)
def available_languages(
    url: str = Query(description="YouTube URL or bare video ID"),
) -> LanguagesResponse:
    """List the transcript languages available for a video."""
    return service.list_languages(url)
