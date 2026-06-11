from enum import Enum

from pydantic import BaseModel, Field


class OutputFormat(str, Enum):
    markdown = "markdown"
    text = "text"
    json = "json"
    srt = "srt"
    vtt = "vtt"


class TranscriptRequest(BaseModel):
    url: str = Field(description="YouTube URL or bare video ID")
    languages: list[str] = Field(
        default=["en"],
        description="Preferred transcript languages, in priority order",
    )
    translate_to: str | None = Field(
        default=None,
        description="Translate the transcript to this language code (if supported)",
    )
    format: OutputFormat = OutputFormat.markdown
    include_timestamps: bool = Field(
        default=True,
        description="Include timestamps (markdown/text formats)",
    )
    chunk_seconds: int = Field(
        default=30,
        ge=0,
        le=3600,
        description="Group transcript lines into chunks of this many seconds (0 = no grouping)",
    )
    include_metadata: bool = Field(
        default=True,
        description="Prepend video title/channel metadata (markdown format)",
    )


class Snippet(BaseModel):
    text: str
    start: float
    duration: float


class VideoMetadata(BaseModel):
    video_id: str
    title: str | None = None
    author: str | None = None
    thumbnail_url: str | None = None


class TranscriptResponse(BaseModel):
    video: VideoMetadata
    language: str
    language_code: str
    is_generated: bool
    format: OutputFormat
    content: str
    snippets: list[Snippet] | None = None
    word_count: int
    duration_seconds: float


class AvailableTranscript(BaseModel):
    language: str
    language_code: str
    is_generated: bool
    is_translatable: bool


class LanguagesResponse(BaseModel):
    video_id: str
    transcripts: list[AvailableTranscript]
