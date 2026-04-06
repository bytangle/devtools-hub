import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { TreeView } from "@/components/ui/tree-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Zap, MinusCircle, TreePine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseJsonToTree } from "@/utils/tree-parsers"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function JsonFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
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
    <div className="space-y-4">
      {/* Tool Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">JSON Formatter</h2>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => formatJson(2)} className="bg-gradient-primary">
              <Zap className="h-3 w-3 mr-1" />
              Format
            </Button>
            <Button size="sm" onClick={() => formatJson(4)} variant="outline">
              Format (4)
            </Button>
            <Button size="sm" onClick={minifyJson} variant="outline">
              <MinusCircle className="h-3 w-3 mr-1" />
              Minify
            </Button>
            <Button size="sm" onClick={clearAll} variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder='{"name": "John", "age": 30}'
          language="json"
          title="Input JSON"
          error={error}
        />
        
        <Tabs defaultValue="formatted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="tree">
              <TreePine className="h-3 w-3 mr-1" />
              Tree
            </TabsTrigger>
          </TabsList>
          <TabsContent value="formatted">
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Formatted output..."
              language="json"
              title="Output"
              readOnly
            />
          </TabsContent>
          <TabsContent value="tree">
            <Card>
              <div className="p-3 border-b bg-muted/20">
                <span className="text-sm font-medium">JSON Structure</span>
              </div>
              <div className="p-3">
                <TreeView data={treeData} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
