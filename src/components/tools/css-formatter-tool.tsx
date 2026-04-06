import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Palette, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function CssFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
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

  const formatCss = () => {
    if (!input.trim()) {
      setError("Please enter CSS to format")
      return
    }

    try {
      let formatted = input
        .replace(/\s*{\s*/g, " {\n  ")
        .replace(/\s*}\s*/g, "\n}\n\n")
        .replace(/;\s*/g, ";\n  ")
        .replace(/,\s*/g, ",\n")
        .replace(/\n\s*\n/g, "\n")
        .replace(/\n  }/g, "\n}")
        .trim()
      
      setOutput(formatted)
      setError("")
      toast({ title: "CSS formatted" })
    } catch (err) {
      setError("Error formatting CSS")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">CSS Formatter</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={formatCss} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Format CSS
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder=".class { }" language="css" title="Input CSS" error={error} />
        <CodeEditor value={output} onChange={() => {}} placeholder="Formatted..." language="css" title="Formatted CSS" readOnly />
      </div>
    </div>
  )
}
