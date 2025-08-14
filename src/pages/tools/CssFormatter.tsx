import { useState } from "react"
import { Header } from "@/components/layout/header"
import { CodeEditor } from "@/components/ui/code-editor"
import { TreeView } from "@/components/ui/tree-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Zap, MinusCircle, TreePine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseCssToTree } from "@/utils/tree-parsers"

export default function CssFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [treeData, setTreeData] = useState<any[]>([])
  const [error, setError] = useState("")
  const { toast } = useToast()

  const formatCss = (indent: number = 2) => {
    try {
      if (!input.trim()) {
        setError("Please enter some CSS to format")
        setOutput("")
        return
      }

      const indentStr = ' '.repeat(indent)
      let formatted = input
        .replace(/\s*{\s*/g, ' {\n')
        .replace(/;\s*/g, ';\n')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/,\s*/g, ',\n')

      const lines = formatted.split('\n').filter(line => line.trim())
      let indentLevel = 0
      
      const formattedLines = lines.map(line => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        
        if (trimmed === '}') {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const result = indentStr.repeat(indentLevel) + trimmed
        
        if (trimmed.endsWith('{')) {
          indentLevel++
        }
        
        return result
      })

      setOutput(formattedLines.join('\n'))
      setTreeData(parseCssToTree(input))
      setError("")
      
      toast({
        title: "CSS formatted successfully",
        description: "Your CSS has been formatted with proper indentation",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error formatting CSS")
      setOutput("")
    }
  }

  const minifyCss = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some CSS to minify")
        setOutput("")
        return
      }

      const minified = input
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .replace(/\s*}\s*/g, '}')
        .replace(/,\s*/g, ',')
        .trim()
      
      setOutput(minified)
      setTreeData(parseCssToTree(input))
      setError("")
      
      toast({
        title: "CSS minified successfully",
        description: "Your CSS has been compressed",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error minifying CSS")
      setOutput("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">CSS Formatter & Beautifier</h1>
            </div>
            <p className="text-muted-foreground">
              Format and beautify your CSS code with proper indentation and organization.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">Instant</Badge>
              <Badge variant="secondary">Production Ready</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => formatCss(2)} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Format CSS
                </Button>
                <Button onClick={() => formatCss(4)} variant="outline">
                  Format (4 spaces)
                </Button>
                <Button onClick={minifyCss} variant="outline">
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Minify
                </Button>
                <Button onClick={() => { setInput(""); setOutput(""); setTreeData([]); setError("") }} variant="outline">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder='.container{display:flex;justify-content:center;}.header{background:#333;color:white;padding:20px;}'
              language="css"
              title="Input CSS"
              error={error}
            />
            
            <Tabs defaultValue="formatted" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="tree">
                  <TreePine className="h-4 w-4 mr-2" />
                  Tree View
                </TabsTrigger>
              </TabsList>
              <TabsContent value="formatted">
                <CodeEditor
                  value={output}
                  onChange={() => {}}
                  placeholder="Formatted CSS will appear here..."
                  language="css"
                  title="Formatted Output"
                  readOnly
                />
              </TabsContent>
              <TabsContent value="tree">
                <Card>
                  <div className="p-3 border-b bg-muted/20">
                    <h3 className="text-sm font-medium">CSS Rules</h3>
                  </div>
                  <div className="p-4">
                    <TreeView 
                      data={treeData} 
                      onNodeClick={(node) => {
                        console.log('Clicked node:', node)
                      }}
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>✓ CSS formatting with indentation</div>
                <div>✓ Property organization</div>
                <div>✓ CSS minification</div>
                <div>✓ File upload support</div>
                <div>✓ Copy to clipboard</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSS Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Use consistent naming conventions</div>
                <div>• Group related properties</div>
                <div>• Use shorthand properties</div>
                <div>• Avoid !important when possible</div>
                <div>• Comment complex styles</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Follow BEM methodology</div>
                <div>• Use semantic class names</div>
                <div>• Optimize for performance</div>
                <div>• Use CSS variables</div>
                <div>• Mobile-first approach</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}