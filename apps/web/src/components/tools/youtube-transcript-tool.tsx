import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Youtube, Copy, Download, Loader2, Languages } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { apiFetch } from "@/lib/api"

type OutputFormat = "markdown" | "text" | "srt" | "vtt"

interface TranscriptResponse {
  video: { video_id: string; title?: string; author?: string }
  language: string
  language_code: string
  is_generated: boolean
  format: string
  content: string
  word_count: number
  duration_seconds: number
}

interface LanguagesResponse {
  video_id: string
  transcripts: { language: string; language_code: string; is_generated: boolean; is_translatable: boolean }[]
}

const FORMAT_EXT: Record<OutputFormat, string> = {
  markdown: "md",
  text: "txt",
  srt: "srt",
  vtt: "vtt",
}

export function YoutubeTranscriptTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()

  const [url, setUrl] = useState<string>(initialInput || (savedState?.url as string) || "")
  const [language, setLanguage] = useState<string>((savedState?.language as string) || "en")
  const [format, setFormat] = useState<OutputFormat>((savedState?.format as OutputFormat) || "markdown")
  const [timestamps, setTimestamps] = useState<boolean>((savedState?.timestamps as boolean) ?? true)
  const [chunkSeconds, setChunkSeconds] = useState<number>((savedState?.chunkSeconds as number) ?? 30)
  const [output, setOutput] = useState("")
  const [meta, setMeta] = useState<TranscriptResponse | null>(null)
  const [available, setAvailable] = useState<LanguagesResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialInput) setUrl(initialInput)
  }, [initialInput])

  useEffect(() => {
    setToolState(tabId, { url, language, format, timestamps, chunkSeconds })
  }, [url, language, format, timestamps, chunkSeconds, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) onOutputChange(output)
  }, [output, onOutputChange])

  const fetchTranscript = async () => {
    if (!url.trim()) {
      toast({ title: "Enter a YouTube URL first", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<TranscriptResponse>("/api/tools/youtube-transcript/transcript", {
        method: "POST",
        body: JSON.stringify({
          url: url.trim(),
          languages: [language],
          format,
          include_timestamps: timestamps,
          chunk_seconds: chunkSeconds,
          include_metadata: true,
        }),
      })
      setOutput(data.content)
      setMeta(data)
      toast({ title: `Transcript fetched — ${data.word_count.toLocaleString()} words (${data.language})` })
    } catch (e) {
      toast({ title: "Transcript fetch failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const checkLanguages = async () => {
    if (!url.trim()) {
      toast({ title: "Enter a YouTube URL first", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<LanguagesResponse>(
        `/api/tools/youtube-transcript/languages?url=${encodeURIComponent(url.trim())}`
      )
      setAvailable(data)
      toast({ title: `${data.transcripts.length} transcript language(s) available` })
    } catch (e) {
      toast({ title: "Could not list languages", description: e instanceof Error ? e.message : undefined, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast({ title: "Transcript copied to clipboard" })
  }

  const downloadOutput = () => {
    if (!output) return
    const base = meta?.video.title
      ? meta.video.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase()
      : "transcript"
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${base}.${FORMAT_EXT[format]}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <ToolShell
      icon={Youtube}
      title="YouTube Transcript"
      description="Fetch video transcripts as Markdown, text, SRT, or VTT"
      actions={
        <>
          <Button size="sm" variant="outline" onClick={copyOutput} disabled={!output}>
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={downloadOutput} disabled={!output}>
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-64 space-y-1.5">
              <Label className="text-xs">YouTube URL or video ID</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyDown={(e) => e.key === "Enter" && fetchTranscript()}
              />
            </div>
            <Button onClick={fetchTranscript} disabled={loading} className="bg-gradient-primary text-primary-foreground">
              {loading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Youtube className="h-3.5 w-3.5 mr-1" />}
              Get transcript
            </Button>
            <Button variant="outline" onClick={checkLanguages} disabled={loading}>
              <Languages className="h-3.5 w-3.5 mr-1" />
              Languages
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Language:</Label>
              {available ? (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {available.transcripts.map((t) => (
                      <SelectItem key={t.language_code} value={t.language_code}>
                        {t.language}{t.is_generated ? " (auto)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-16 h-8 text-center text-xs"
                  maxLength={7}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs">Format:</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as OutputFormat)}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="text">Plain text</SelectItem>
                  <SelectItem value="srt">SRT</SelectItem>
                  <SelectItem value="vtt">VTT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(format === "markdown" || format === "text") && (
              <>
                <div className="flex items-center gap-2">
                  <Switch id={`ts-${tabId}`} checked={timestamps} onCheckedChange={setTimestamps} />
                  <Label htmlFor={`ts-${tabId}`} className="text-xs cursor-pointer">Timestamps</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Chunk (sec):</Label>
                  <Input
                    type="number"
                    min={0}
                    max={3600}
                    value={chunkSeconds}
                    onChange={(e) => setChunkSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </>
            )}

            {meta && (
              <span className="text-xs text-muted-foreground ml-auto">
                {meta.video.title && <span className="font-medium text-foreground">{meta.video.title}</span>}
                {" · "}{meta.word_count.toLocaleString()} words · {Math.round(meta.duration_seconds / 60)} min
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 [&>*]:h-full">
          <CodeEditor
            value={output}
            onChange={() => {}}
            placeholder="Transcript output will appear here..."
            language={format === "markdown" ? "markdown" : "text"}
            title="Transcript"
            readOnly
          />
        </div>
      </div>
    </ToolShell>
  )
}
