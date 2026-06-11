from app.tools.base import ToolDefinition
from app.tools.youtube_transcript.router import router

tool = ToolDefinition(
    id="youtube-transcript",
    name="YouTube Transcript",
    description="Fetch YouTube video transcripts and convert them to Markdown, text, SRT, or VTT.",
    router=router,
    version="1.0.0",
    tags=["converter", "transcription", "markdown"],
)
