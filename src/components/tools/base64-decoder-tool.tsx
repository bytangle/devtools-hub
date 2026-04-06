import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function Base64DecoderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
  const [output, setOutput] = useState(savedState?.output || "")
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input, output })
  }, [input, output, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && output) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const decodeFromBase64 = () => {
    try {
      if (!input.trim()) {
        setError("Please enter Base64 text to decode")
        setOutput("")
        return
      }

      const decoded = decodeURIComponent(escape(atob(input.trim())))
      setOutput(decoded)
      setError("")
      
      toast({
        title: "Text decoded successfully",
        description: "Base64 has been decoded",
      })
    } catch (err) {
      setError("Invalid Base64 format")
      setOutput("")
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Base64 Decoder</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={decodeFromBase64} className="bg-gradient-primary">
              <Zap className="h-3 w-3 mr-1" />
              Decode
            </Button>
            <Button size="sm" onClick={clearAll} variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="Enter Base64 text..."
          language="text"
          title="Base64 Input"
          error={error}
        />
        
        <CodeEditor
          value={output}
          onChange={() => {}}
          placeholder="Decoded output..."
          language="text"
          title="Decoded Text"
          readOnly
        />
      </div>
    </div>
  )
}
