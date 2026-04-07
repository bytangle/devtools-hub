import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertCircle, Zap, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function CssValidatorTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input || "")
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
    if (onOutputChange) {
      onOutputChange(foundIssues.length === 0 ? "\u2713 Valid CSS\n\n" + input : "Issues:\n" + foundIssues.join("\n") + "\n\n" + input)
    }
    toast({ title: foundIssues.length === 0 ? "CSS looks valid!" : `Found ${foundIssues.length} issues` })
  }

  return (
    <ToolShell icon={CheckCircle} title="CSS Validator">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder=".class { ... }" language="css" title="CSS Input" />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={validateCss} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Validate CSS</p></TooltipContent>
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
