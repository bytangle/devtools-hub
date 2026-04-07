import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function TimestampConverterTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [timestamp, setTimestamp] = useState(savedState?.timestamp || Math.floor(Date.now() / 1000).toString())
  const [dateString, setDateString] = useState(savedState?.dateString || "")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { timestamp, dateString })
  }, [timestamp, dateString, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && dateString) {
      onOutputChange(dateString)
    }
  }, [dateString, onOutputChange])

  const convertTimestamp = () => {
    const ts = parseInt(timestamp)
    if (isNaN(ts)) {
      toast({ title: "Invalid timestamp", variant: "destructive" })
      return
    }
    
    // Determine if seconds or milliseconds
    const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000)
    setDateString(date.toISOString())
    toast({ title: "Converted!" })
  }

  const convertDate = () => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      toast({ title: "Invalid date", variant: "destructive" })
      return
    }
    setTimestamp(Math.floor(date.getTime() / 1000).toString())
    toast({ title: "Converted!" })
  }

  const setCurrentTime = () => {
    const now = Math.floor(Date.now() / 1000)
    setTimestamp(now.toString())
    setDateString(new Date().toISOString())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!" })
  }

  const ts = parseInt(timestamp)
  const date = !isNaN(ts) ? (ts > 9999999999 ? new Date(ts) : new Date(ts * 1000)) : null

  return (
    <ToolShell
      icon={Clock}
      title="Timestamp Converter"
      actions={<><Button size="sm" onClick={setCurrentTime} className="bg-gradient-primary">
            <RefreshCw className="h-3 w-3 mr-1" />
            Current Time
          </Button></>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border">
          <div className="p-4 pb-3">
            <Label className="text-sm font-medium">Unix Timestamp</Label>
          </div>
          <div className="p-4 pt-0 space-y-3">
            <div className="flex gap-2">
              <Input 
                value={timestamp} 
                onChange={(e) => setTimestamp(e.target.value)} 
                placeholder="1234567890"
                className="font-mono"
              />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(timestamp)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={convertTimestamp} variant="outline" className="w-full">
              Convert to Date →
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-4 pb-3">
            <Label className="text-sm font-medium">Date String (ISO 8601)</Label>
          </div>
          <div className="p-4 pt-0 space-y-3">
            <div className="flex gap-2">
              <Input 
                type="datetime-local" 
                value={dateString ? dateString.slice(0, 16) : ""} 
                onChange={(e) => setDateString(new Date(e.target.value).toISOString())}
              />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(dateString)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={convertDate} variant="outline" className="w-full">
              ← Convert to Timestamp
            </Button>
          </div>
        </div>
      </div>

      {date && (
        <div className="rounded-lg border p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Local</div>
              <div className="text-sm font-mono">{date.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">UTC</div>
              <div className="text-sm font-mono">{date.toUTCString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ISO</div>
              <div className="text-sm font-mono">{date.toISOString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Unix (ms)</div>
              <div className="text-sm font-mono">{date.getTime()}</div>
            </div>
        </div>
      )}
    </ToolShell>
  )
}
