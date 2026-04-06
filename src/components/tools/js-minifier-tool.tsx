import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileCode, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function JsMinifierTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
  const [output, setOutput] = useState(savedState?.output || "")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input, output })
  }, [input, output, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && output) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const minifyJs = () => {
    if (!input.trim()) return
    
    // Simple minification (for production, use a proper minifier)
    const minified = input
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}();,:])\s*/g, '$1') // Remove space around operators
      .replace(/;\s*}/g, '}') // Remove semicolon before }
      .trim()
    
    setOutput(minified)
    
    const savings = ((1 - minified.length / input.length) * 100).toFixed(1)
    toast({ title: `Minified! Saved ${savings}%` })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileCode className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">JavaScript Minifier</h2>
      </div>

      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Button size="sm" onClick={minifyJs} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Minify JS
          </Button>
          {output && (
            <span className="text-xs text-muted-foreground">
              {input.length} → {output.length} bytes ({((1 - output.length / input.length) * 100).toFixed(1)}% saved)
            </span>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder="function example() { ... }" language="text" title="Input JavaScript" />
        <CodeEditor value={output} onChange={() => {}} placeholder="Minified JS..." language="text" title="Minified" readOnly />
      </div>
    </div>
  )
}
