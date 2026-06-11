import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Code, Zap, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function HtmlFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input || "")
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
    <ToolShell icon={Code} title="HTML Formatter">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder="<html>..." language="html" title="Input HTML" error={error} />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={formatHtml} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Format HTML</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError("") }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={<CodeEditor value={output} onChange={() => {}} placeholder="Formatted..." language="html" title="Formatted HTML" readOnly />}
        />
      </TooltipProvider>
    </ToolShell>
  )
}
