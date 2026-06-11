import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Palette, Zap, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function CssFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
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
    <ToolShell icon={Palette} title="CSS Formatter">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder=".class { }" language="css" title="Input CSS" error={error} />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={formatCss} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Format CSS</p></TooltipContent>
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
          output={<CodeEditor value={output} onChange={() => {}} placeholder="Formatted..." language="css" title="Formatted CSS" readOnly />}
        />
      </TooltipProvider>
    </ToolShell>
  )
}
