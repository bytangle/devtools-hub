import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function UrlEncoderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
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

  const encodeUrl = () => {
    if (!input.trim()) return
    const encoded = encodeURIComponent(input)
    setOutput(encoded)
    toast({ title: "URL encoded" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">URL Encoder</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={encodeUrl} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Encode URL
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder="Enter URL..." language="text" title="Input" />
        <CodeEditor value={output} onChange={() => {}} placeholder="Encoded output..." language="text" title="Encoded" readOnly />
      </div>
    </div>
  )
}
