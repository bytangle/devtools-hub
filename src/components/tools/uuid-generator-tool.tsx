import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Zap, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function UuidGeneratorTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)

  const [uuid, setUuid] = useState(savedState?.uuid || "")
  const [uuids, setUuids] = useState<string[]>(savedState?.uuids || [])
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { uuid, uuids })
  }, [uuid, uuids, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && uuid) {
      onOutputChange(uuid)
    }
  }, [uuid, onOutputChange])

  const generateUuid = () => {
    const newUuid = crypto.randomUUID()
    setUuid(newUuid)
    toast({ title: "UUID generated" })
  }

  const generateMultiple = (count: number) => {
    const newUuids = Array.from({ length: count }, () => crypto.randomUUID())
    setUuids(newUuids)
    toast({ title: `Generated ${count} UUIDs` })
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  const copyAll = () => {
    const all = [uuid, ...uuids].filter(Boolean).join("\n")
    navigator.clipboard.writeText(all)
    toast({ title: "All UUIDs copied" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">UUID Generator</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={generateUuid} className="bg-gradient-primary">
              <RefreshCw className="h-3 w-3 mr-1" />
              Generate UUID
            </Button>
            <Button size="sm" onClick={() => generateMultiple(5)} variant="outline">
              Generate 5
            </Button>
            <Button size="sm" onClick={() => generateMultiple(10)} variant="outline">
              Generate 10
            </Button>
            {(uuid || uuids.length > 0) && (
              <Button size="sm" onClick={copyAll} variant="outline">
                Copy All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Generated UUID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input 
              value={uuid} 
              readOnly 
              className="font-mono text-sm"
              placeholder="Click generate..."
            />
            <Button size="icon" variant="outline" onClick={() => copyToClipboard(uuid)} disabled={!uuid}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {uuids.length > 0 && (
            <div className="space-y-2">
              {uuids.map((u, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={u} readOnly className="font-mono text-xs" />
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(u)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
