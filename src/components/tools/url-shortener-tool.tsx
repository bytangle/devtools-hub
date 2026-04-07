import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, Copy, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function UrlShortenerTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [url, setUrl] = useState(initialInput || savedState?.url || "")
  const [shortUrl, setShortUrl] = useState(savedState?.shortUrl || "")
  const [history, setHistory] = useState<{ original: string; short: string }[]>(savedState?.history || [])
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { url, shortUrl, history })
  }, [url, shortUrl, history, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && shortUrl) {
      onOutputChange(shortUrl)
    }
  }, [shortUrl, onOutputChange])

  const shortenUrl = () => {
    if (!url.trim()) {
      toast({ title: "Please enter a URL", variant: "destructive" })
      return
    }

    // Generate a fake short URL (in production, this would call an API)
    const randomId = Math.random().toString(36).substring(2, 8)
    const shortened = `https://short.link/${randomId}`
    
    setShortUrl(shortened)
    setHistory(prev => [{ original: url, short: shortened }, ...prev.slice(0, 9)])
    toast({ title: "URL shortened!" })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!" })
  }

  return (
    <ToolShell
      icon={Link}
      title="URL Shortener"
      actions={<Button onClick={shortenUrl} className="bg-gradient-primary">
                <Zap className="h-4 w-4 mr-1" />
                Shorten
              </Button>}
    >
      <div className="space-y-2">
        <Label className="text-sm">Original URL</Label>
        <Input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://example.com/very/long/url" 
        />
      </div>

      {shortUrl && (
        <div className="space-y-2">
          <Label className="text-sm">Shortened URL</Label>
          <div className="flex gap-2">
            <Input value={shortUrl} readOnly className="font-mono" />
            <Button size="icon" variant="outline" onClick={() => copyToClipboard(shortUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 pb-3">
            <Label className="text-sm font-medium">Recent URLs</Label>
          </div>
          <div className="p-4 pt-0">
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 truncate text-muted-foreground">{item.original}</div>
                  <div className="font-mono text-primary">{item.short}</div>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(item.short)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Note: This is a demo. In production, URLs would be persisted to a database.
      </p>
    </ToolShell>
  )
}
