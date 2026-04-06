import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function UrlDecoderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
  const [output, setOutput] = useState(savedState?.output || "")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input, output })
  }, [input, output, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && output) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const decodeUrl = () => {
    if (!input.trim()) return
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      toast({ title: "URL decoded" })
    } catch {
      toast({ title: "Invalid URL encoding", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">URL Decoder</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={decodeUrl} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Decode URL
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder="Enter encoded URL..." language="text" title="Encoded Input" />
        <CodeEditor value={output} onChange={() => {}} placeholder="Decoded output..." language="text" title="Decoded" readOnly />
      </div>
    </div>
  )
}
