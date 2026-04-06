import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function HtmlValidatorTool({ tabId, initialInput }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
  const [issues, setIssues] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input })
  }, [input, tabId, setToolState])

  const validateHtml = () => {
    if (!input.trim()) return

    const foundIssues: string[] = []
    
    // Check for unclosed tags
    const openTags = input.match(/<([a-z][a-z0-9]*)[^>]*(?<!\/)\s*>/gi) || []
    const closeTags = input.match(/<\/([a-z][a-z0-9]*)\s*>/gi) || []
    
    if (openTags.length !== closeTags.length) {
      foundIssues.push(`Unmatched tags: ${openTags.length} opening vs ${closeTags.length} closing`)
    }
    
    // Check for missing doctype
    if (!input.toLowerCase().includes('<!doctype')) {
      foundIssues.push("Missing <!DOCTYPE html> declaration")
    }
    
    // Check for missing html/head/body
    if (!/<html/i.test(input)) foundIssues.push("Missing <html> tag")
    if (!/<head/i.test(input)) foundIssues.push("Missing <head> tag")
    if (!/<body/i.test(input)) foundIssues.push("Missing <body> tag")

    setIssues(foundIssues)
    toast({ title: foundIssues.length === 0 ? "HTML looks valid!" : `Found ${foundIssues.length} issues` })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">HTML Validator</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={validateHtml} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Validate
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder="<html>..." language="html" title="HTML Input" />
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
