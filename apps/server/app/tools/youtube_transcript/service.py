import re

import httpx
from youtube_transcript_api import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
    YouTubeTranscriptApi,
)

from app.core.errors import ToolError
from app.tools.youtube_transcript.schemas import (
    AvailableTranscript,
    LanguagesResponse,
    OutputFormat,
    Snippet,
    TranscriptRequest,
    TranscriptResponse,
    VideoMetadata,
)

_VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")

_URL_PATTERNS = [
    re.compile(r"(?:v=|/v/)([A-Za-z0-9_-]{11})"),
    re.compile(r"youtu\.be/([A-Za-z0-9_-]{11})"),
    re.compile(r"/(?:embed|shorts|live)/([A-Za-z0-9_-]{11})"),
]


def extract_video_id(url_or_id: str) -> str:
    candidate = url_or_id.strip()
    if _VIDEO_ID_RE.match(candidate):
        return candidate
    for pattern in _URL_PATTERNS:
        match = pattern.search(candidate)
        if match:
            return match.group(1)
    raise ToolError("invalid_url", "Could not extract a video ID from the given URL.", 422)


def fetch_metadata(video_id: str) -> VideoMetadata:
    """Fetch title/channel via YouTube oEmbed (no API key required)."""
    try:
        resp = httpx.get(
            "https://www.youtube.com/oembed",
            params={"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return VideoMetadata(
            video_id=video_id,
            title=data.get("title"),
            author=data.get("author_name"),
            thumbnail_url=data.get("thumbnail_url"),
        )
    except httpx.HTTPError:
        # Metadata is best-effort; the transcript is the payload.
        return VideoMetadata(video_id=video_id)


def list_languages(url_or_id: str) -> LanguagesResponse:
    video_id = extract_video_id(url_or_id)
    try:
        transcript_list = YouTubeTranscriptApi().list(video_id)
    except TranscriptsDisabled:
        raise ToolError("transcripts_disabled", "Transcripts are disabled for this video.", 404)
    except VideoUnavailable:
        raise ToolError("video_unavailable", "This video is unavailable.", 404)

    return LanguagesResponse(
        video_id=video_id,
        transcripts=[
            AvailableTranscript(
                language=t.language,
                language_code=t.language_code,
                is_generated=t.is_generated,
                is_translatable=t.is_translatable,
            )
            for t in transcript_list
        ],
    )


def get_transcript(req: TranscriptRequest) -> TranscriptResponse:
    video_id = extract_video_id(req.url)

    try:
        transcript_list = YouTubeTranscriptApi().list(video_id)
        transcript = transcript_list.find_transcript(req.languages)
        if req.translate_to:
            if not transcript.is_translatable:
                raise ToolError("not_translatable", "This transcript cannot be translated.", 422)
            transcript = transcript.translate(req.translate_to)
        fetched = transcript.fetch()
    except TranscriptsDisabled:
        raise ToolError("transcripts_disabled", "Transcripts are disabled for this video.", 404)
    except NoTranscriptFound:
        raise ToolError(
            "no_transcript",
            f"No transcript found for languages: {', '.join(req.languages)}. "
            "Use the languages endpoint to see what's available.",
            404,
        )
    except VideoUnavailable:
        raise ToolError("video_unavailable", "This video is unavailable.", 404)

    snippets = [Snippet(text=s.text, start=s.start, duration=s.duration) for s in fetched]
    metadata = fetch_metadata(video_id) if req.include_metadata else VideoMetadata(video_id=video_id)

    content = _render(snippets, req, metadata)
    duration = snippets[-1].start + snippets[-1].duration if snippets else 0.0

    return TranscriptResponse(
        video=metadata,
        language=transcript.language,
        language_code=transcript.language_code,
        is_generated=transcript.is_generated,
        format=req.format,
        content=content,
        snippets=snippets if req.format == OutputFormat.json else None,
        word_count=sum(len(s.text.split()) for s in snippets),
        duration_seconds=round(duration, 2),
    )


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------

def _ts(seconds: float, vtt: bool = False) -> str:
    ms = int(round((seconds % 1) * 1000))
    s = int(seconds)
    h, m, sec = s // 3600, (s % 3600) // 60, s % 60
    sep = "." if vtt else ","
    return f"{h:02d}:{m:02d}:{sec:02d}{sep}{ms:03d}"


def _ts_short(seconds: float) -> str:
    s = int(seconds)
    h, m, sec = s // 3600, (s % 3600) // 60, s % 60
    return f"{h:d}:{m:02d}:{sec:02d}" if h else f"{m:d}:{sec:02d}"


def _chunk(snippets: list[Snippet], seconds: int) -> list[tuple[float, str]]:
    """Group snippets into (start_time, text) chunks of ~`seconds` length."""
    if seconds <= 0:
        return [(s.start, s.text) for s in snippets]
    chunks: list[tuple[float, str]] = []
    bucket_start: float | None = None
    bucket: list[str] = []
    for s in snippets:
        if bucket_start is None:
            bucket_start = s.start
        if s.start - bucket_start >= seconds and bucket:
            chunks.append((bucket_start, " ".join(bucket)))
            bucket_start = s.start
            bucket = []
        bucket.append(s.text)
    if bucket and bucket_start is not None:
        chunks.append((bucket_start, " ".join(bucket)))
    return chunks


def _render(snippets: list[Snippet], req: TranscriptRequest, meta: VideoMetadata) -> str:
    fmt = req.format
    if fmt == OutputFormat.srt:
        blocks = [
            f"{i}\n{_ts(s.start)} --> {_ts(s.start + s.duration)}\n{s.text}"
            for i, s in enumerate(snippets, 1)
        ]
        return "\n\n".join(blocks)

    if fmt == OutputFormat.vtt:
        blocks = [
            f"{_ts(s.start, vtt=True)} --> {_ts(s.start + s.duration, vtt=True)}\n{s.text}"
            for s in snippets
        ]
        return "WEBVTT\n\n" + "\n\n".join(blocks)

    if fmt == OutputFormat.json:
        return ""  # snippets array carries the data

    chunks = _chunk(snippets, req.chunk_seconds)

    if fmt == OutputFormat.text:
        if req.include_timestamps:
            return "\n".join(f"[{_ts_short(start)}] {text}" for start, text in chunks)
        return "\n\n".join(text for _, text in chunks)

    # Markdown
    lines: list[str] = []
    if req.include_metadata:
        if meta.title:
            lines.append(f"# {meta.title}")
            lines.append("")
        details = []
        if meta.author:
            details.append(f"**Channel:** {meta.author}")
        details.append(f"**Video:** https://www.youtube.com/watch?v={meta.video_id}")
        lines.extend(details)
        lines.append("")
        lines.append("---")
        lines.append("")

    for start, text in chunks:
        if req.include_timestamps:
            link = f"https://www.youtube.com/watch?v={meta.video_id}&t={int(start)}s"
            lines.append(f"**[{_ts_short(start)}]({link})** {text}")
        else:
            lines.append(text)
        lines.append("")

    return "\n".join(lines).strip()
