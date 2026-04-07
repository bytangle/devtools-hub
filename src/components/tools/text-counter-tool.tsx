import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Type } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { ToolShell } from "@/components/tools/shared/tool-shell"

export function TextCounterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [text, setText] = useState(initialInput || savedState?.text || "")

  useEffect(() => {
    setToolState(tabId, { text })
  }, [text, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(text)
    }
  }, [text, onOutputChange])

  const charCount = text.length
  const charNoSpaces = text.replace(/\s/g, "").length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const lineCount = text ? text.split("\n").length : 0
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length
  const paragraphCount = text.split(/\n\n+/).filter(p => p.trim()).length

  const stats = [
    { label: 'Characters', value: charCount },
    { label: 'No Spaces', value: charNoSpaces },
    { label: 'Words', value: wordCount },
    { label: 'Lines', value: lineCount },
    { label: 'Sentences', value: sentenceCount },
    { label: 'Paragraphs', value: paragraphCount },
  ]

  return (
    <ToolShell icon={Type} title="Text Counter">
      <div className="space-y-3">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="min-h-[300px] font-mono text-sm"
        />
      </div>
    </ToolShell>
  )
}
