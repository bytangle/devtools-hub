import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertCircle, Zap, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function HtmlValidatorTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input || "")
  const [issues, setIssues] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input })
  }, [input, tabId, setToolState])

  const validateHtml = () => {
    if (!input.trim()) return

    const foundIssues: string[] = []
    
    // Check for unclosed tags
    const openTags = input.match(/<([a-z][a-z0-9]*)[^>]*(?<!\/)\ *>/gi) || []
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
    if (onOutputChange) {
      onOutputChange(foundIssues.length === 0 ? "✓ Valid HTML\n\n" + input : "Issues:\n" + foundIssues.join("\n") + "\n\n" + input)
    }
    toast({ title: foundIssues.length === 0 ? "HTML looks valid!" : `Found ${foundIssues.length} issues` })
  }

  return (
    <ToolShell icon={CheckCircle} title="HTML Validator">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder="<html>..." language="html" title="HTML Input" />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={validateHtml} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Validate HTML</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setInput(""); setIssues([]) }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={
            <div className="rounded-lg border p-4 h-full overflow-auto">
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
            </div>
          }
        />
      </TooltipProvider>
    </ToolShell>
  )
}
