import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { TreeView } from "@/components/ui/tree-view"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Zap, MinusCircle, TreePine, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseJsonToTree } from "@/utils/tree-parsers"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function JsonFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input || "")
  const [output, setOutput] = useState(savedState?.output || "")
  const [treeData, setTreeData] = useState<any[]>([])
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Save state when input/output changes
  useEffect(() => {
    setToolState(tabId, { input, output })
  }, [input, output, tabId, setToolState])

  // Notify parent of output changes (for pipeline mode)
  useEffect(() => {
    if (onOutputChange && output) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const formatJson = (indent: number = 2) => {
    try {
      if (!input.trim()) {
        setError("Please enter some JSON to format")
        setOutput("")
        return
      }

      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setTreeData(parseJsonToTree(input))
      setError("")
      
      toast({
        title: "JSON formatted successfully",
        description: "Your JSON has been formatted and validated",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      setOutput("")
    }
  }

  const minifyJson = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some JSON to minify")
        setOutput("")
        return
      }

      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setTreeData(parseJsonToTree(input))
      setError("")
      
      toast({
        title: "JSON minified successfully",
        description: "Your JSON has been compressed",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      setOutput("")
      setTreeData([])
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setTreeData([])
    setError("")
  }

  return (
    <ToolShell
      icon={FileText}
      title="JSON Formatter"
    >
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder='{"name": "John", "age": 30}'
              language="json"
              title="Input JSON"
              error={error}
            />
          }
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={() => formatJson(2)} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Format (2-space)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => formatJson(4)} className="h-7 w-7 rounded-full">
                  <span className="text-[10px] font-bold font-mono">4</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Format (4-space)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={minifyJson} className="h-7 w-7 rounded-full">
                  <MinusCircle className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Minify</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={clearAll} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={
            <Tabs defaultValue="formatted" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="tree">
                  <TreePine className="h-3 w-3 mr-1" />
                  Tree
                </TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="flex-1 min-h-0">
                <CodeEditor
                  value={output}
                  onChange={() => {}}
                  placeholder="Formatted output..."
                  language="json"
                  title="Output"
                  readOnly
                />
              </TabsContent>
              <TabsContent value="tree" className="flex-1 min-h-0">
                <div className="rounded-lg border h-full">
                  <div className="p-3 border-b bg-muted/20">
                    <span className="text-sm font-medium">JSON Structure</span>
                  </div>
                  <div className="p-3">
                    <TreeView data={treeData} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          }
        />
      </TooltipProvider>
    </ToolShell>
  )
}
