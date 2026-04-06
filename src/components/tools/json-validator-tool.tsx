import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function JsonValidatorTool({ tabId, initialInput }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
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
      toast({ title: "Valid JSON!" })
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : "Invalid JSON")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">JSON Validator</h2>
      </div>

      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Button size="sm" onClick={validateJson} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Validate
          </Button>
          {isValid !== null && (
            <span className={`flex items-center gap-1 text-sm ${isValid ? 'text-green-600' : 'text-destructive'}`}>
              {isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {isValid ? "Valid JSON" : "Invalid JSON"}
            </span>
          )}
        </CardContent>
      </Card>

      <CodeEditor value={input} onChange={setInput} placeholder='{"valid": "json"}' language="json" title="JSON Input" error={error} />
    </div>
  )
}
