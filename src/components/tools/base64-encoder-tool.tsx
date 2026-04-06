import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Binary, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function Base64EncoderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
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

  const encodeToBase64 = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some text to encode")
        setOutput("")
        return
      }

      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError("")
      
      toast({
        title: "Text encoded successfully",
        description: "Your text has been converted to Base64",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error encoding text")
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
        <Binary className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Base64 Encoder</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={encodeToBase64} className="bg-gradient-primary">
              <Zap className="h-3 w-3 mr-1" />
              Encode
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
          placeholder="Enter text to encode..."
          language="text"
          title="Input Text"
          error={error}
        />
        
        <CodeEditor
          value={output}
          onChange={() => {}}
          placeholder="Base64 output..."
          language="text"
          title="Base64 Output"
          readOnly
        />
      </div>
    </div>
  )
}
