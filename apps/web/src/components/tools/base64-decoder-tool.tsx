import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw, Zap, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function Base64DecoderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
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
    <ToolShell icon={RefreshCw} title="Base64 Decoder">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder="Enter Base64 text..." language="text" title="Base64 Input" error={error} />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={decodeFromBase64} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Decode Base64</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={clearAll} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={<CodeEditor value={output} onChange={() => {}} placeholder="Decoded output..." language="text" title="Decoded Text" readOnly />}
        />
      </TooltipProvider>
    </ToolShell>
  )
}
