import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function CssValidatorTool({ tabId, initialInput }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
  const [issues, setIssues] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input })
  }, [input, tabId, setToolState])

  const validateCss = () => {
    if (!input.trim()) return

    const foundIssues: string[] = []
    
    // Check for balanced braces
    const openBraces = (input.match(/{/g) || []).length
    const closeBraces = (input.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      foundIssues.push(`Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing`)
    }
    
    // Check for missing semicolons
    const declarations = input.match(/[^{};]+(?=\s*[;}])/g) || []
    const withoutSemicolon = input.match(/[^{};:]+:[^{};]+(?=\s*})/g) || []
    if (withoutSemicolon.length > 0) {
      foundIssues.push("Some declarations may be missing semicolons")
    }
    
    // Check for empty rules
    if (/{[\s]*}/g.test(input)) {
      foundIssues.push("Empty rule sets detected")
    }

    setIssues(foundIssues)
    toast({ title: foundIssues.length === 0 ? "CSS looks valid!" : `Found ${foundIssues.length} issues` })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">CSS Validator</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={validateCss} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Validate
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder=".class { ... }" language="css" title="CSS Input" />
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Validation Results</h3>
            {issues.length === 0 ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> No issues found
              </p>
            ) : (
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="text-sm text-destructive flex items-start gap-1">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
