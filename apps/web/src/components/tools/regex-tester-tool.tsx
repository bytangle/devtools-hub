import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Copy, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function RegexTesterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)

  const [pattern, setPattern] = useState(savedState?.pattern || "")
  const [testString, setTestString] = useState(initialInput || savedState?.testString || "")
  const [globalFlag, setGlobalFlag] = useState(savedState?.globalFlag ?? true)
  const [caseInsensitive, setCaseInsensitive] = useState(savedState?.caseInsensitive ?? false)
  const [multiline, setMultiline] = useState(savedState?.multiline ?? false)
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { pattern, testString, globalFlag, caseInsensitive, multiline })
  }, [pattern, testString, globalFlag, caseInsensitive, multiline, tabId, setToolState])

  const regexResult = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [], isValid: true, error: null }
    }

    try {
      let flags = ""
      if (globalFlag) flags += "g"
      if (caseInsensitive) flags += "i"
      if (multiline) flags += "m"

      const regex = new RegExp(pattern, flags)
      const matches: { match: string; index: number; groups: string[] }[] = []
      
      if (globalFlag) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          if (!regex.global) break
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      return { matches, isValid: true, error: null }
    } catch (error) {
      return { 
        matches: [], 
        isValid: false, 
        error: error instanceof Error ? error.message : "Invalid regex"
      }
    }
  }, [pattern, testString, globalFlag, caseInsensitive, multiline])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(JSON.stringify(regexResult.matches, null, 2))
    }
  }, [regexResult, onOutputChange])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!" })
  }

  const commonPatterns = [
    { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
    { name: "URL", pattern: "https?://[^\\s]+" },
    { name: "Phone", pattern: "\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}" },
    { name: "IP", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  ]

  return (
    <ToolShell
      icon={Search}
      title="Regex Tester"
      actions={
        <div className="flex flex-wrap gap-1">
          {commonPatterns.map(p => (
            <Button key={p.name} size="sm" variant="outline" className="text-xs h-6" onClick={() => setPattern(p.pattern)}>
              {p.name}
            </Button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {/* Pattern input */}
        <div className="rounded-lg border border-border/60 p-3 bg-card space-y-3">
          <div className="flex gap-2">
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern"
              className={`flex-1 font-mono ${!regexResult.isValid ? 'border-destructive' : ''}`}
            />
            <Button size="icon" variant="outline" onClick={() => copyToClipboard(pattern)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {!regexResult.isValid && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {regexResult.error}
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="global" checked={globalFlag} onCheckedChange={(c) => setGlobalFlag(c === true)} />
              <Label htmlFor="global" className="text-xs">Global (g)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="case" checked={caseInsensitive} onCheckedChange={(c) => setCaseInsensitive(c === true)} />
              <Label htmlFor="case" className="text-xs">Case (i)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="multi" checked={multiline} onCheckedChange={(c) => setMultiline(c === true)} />
              <Label htmlFor="multi" className="text-xs">Multi (m)</Label>
            </div>
          </div>
        </div>

        {/* Test string + matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="px-3 py-1.5 border-b bg-muted/30">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Test String</span>
            </div>
            <Textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              className="min-h-[200px] font-mono text-sm border-0 rounded-none focus-visible:ring-0"
            />
          </div>

          <div className="rounded-lg border border-primary/15 overflow-hidden">
            <div className="px-3 py-1.5 border-b bg-primary/[0.03]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                Matches ({regexResult.matches.length})
              </span>
            </div>
            <div className="p-3">
              {regexResult.matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matches found</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {regexResult.matches.map((match, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-primary">{match.match}</span>
                        <span className="text-xs text-muted-foreground">@{match.index}</span>
                      </div>
                      {match.groups.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Groups: {match.groups.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  )
}
