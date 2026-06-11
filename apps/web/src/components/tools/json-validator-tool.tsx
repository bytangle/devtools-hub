import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { CheckCircle, AlertCircle, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function JsonValidatorTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input || "")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input })
  }, [input, tabId, setToolState])

  const validateJson = () => {
    if (!input.trim()) {
      setError("Please enter JSON to validate")
      setIsValid(null)
      return
    }

    try {
      JSON.parse(input)
      setIsValid(true)
      setError("")
      if (onOutputChange) onOutputChange(input)
      toast({ title: "Valid JSON!" })
    } catch (err) {
      setIsValid(false)
      const errMsg = err instanceof Error ? err.message : "Invalid JSON"
      setError(errMsg)
      if (onOutputChange) onOutputChange("Error: " + errMsg + "\n\n" + input)
    }
  }

  return (
    <ToolShell
      icon={CheckCircle}
      title="JSON Validator"
      actions={<><Button size="sm" onClick={validateJson} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Validate
          </Button>
          {isValid !== null && (
            <span className={`flex items-center gap-1 text-sm ${isValid ? 'text-green-600' : 'text-destructive'}`}>
              {isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {isValid ? "Valid JSON" : "Invalid JSON"}
            </span>
          )}</>}
    >
      <CodeEditor value={input} onChange={setInput} placeholder='{"valid": "json"}' language="json" title="JSON Input" error={error} />
    </ToolShell>
  )
}
