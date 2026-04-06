import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Code, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function HtmlFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
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

  const formatHtml = () => {
    if (!input.trim()) {
      setError("Please enter HTML to format")
      return
    }

    try {
      let formatted = input
      let indent = 0
      const indentStr = "  "
      
      formatted = formatted.replace(/>\s*</g, ">\n<")
      
      const lines = formatted.split("\n")
      const result: string[] = []
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        
        if (trimmed.startsWith("</")) {
          indent = Math.max(0, indent - 1)
        }
        
        result.push(indentStr.repeat(indent) + trimmed)
        
        if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !trimmed.includes("</")) {
          indent++
        }
      }
      
      setOutput(result.join("\n"))
      setError("")
      toast({ title: "HTML formatted" })
    } catch (err) {
      setError("Error formatting HTML")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Code className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">HTML Formatter</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={formatHtml} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Format HTML
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder="<html>..." language="html" title="Input HTML" error={error} />
        <CodeEditor value={output} onChange={() => {}} placeholder="Formatted..." language="html" title="Formatted HTML" readOnly />
      </div>
    </div>
  )
}
