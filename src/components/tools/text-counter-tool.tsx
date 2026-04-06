import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Type } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function TextCounterTool({ tabId, initialInput }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [text, setText] = useState(savedState?.text || initialInput || "")

  useEffect(() => {
    setToolState(tabId, { text })
  }, [text, tabId, setToolState])

  const charCount = text.length
  const charNoSpaces = text.replace(/\s/g, "").length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const lineCount = text ? text.split("\n").length : 0
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length
  const paragraphCount = text.split(/\n\n+/).filter(p => p.trim()).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Text Counter</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{charCount}</div>
            <div className="text-xs text-muted-foreground">Characters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{charNoSpaces}</div>
            <div className="text-xs text-muted-foreground">No Spaces</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{wordCount}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{lineCount}</div>
            <div className="text-xs text-muted-foreground">Lines</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{sentenceCount}</div>
            <div className="text-xs text-muted-foreground">Sentences</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{paragraphCount}</div>
            <div className="text-xs text-muted-foreground">Paragraphs</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="min-h-[300px] font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
