import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Globe, Zap, Trash2 } from "lucide-react"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function UrlDecoderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input || "")
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
    <ToolShell icon={Globe} title="URL Decoder">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder="Enter encoded URL..." language="text" title="Input" />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={decodeUrl} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Decode URL</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setInput(""); setOutput("") }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={<CodeEditor value={output} onChange={() => {}} placeholder="Decoded output will appear here..." language="text" title="Output" readOnly />}
        />
      </TooltipProvider>
    </ToolShell>
  )
}
