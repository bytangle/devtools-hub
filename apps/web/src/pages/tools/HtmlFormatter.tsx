import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { CodeEditor } from "@/components/ui/code-editor"
import { TreeView } from "@/components/ui/tree-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Zap, MinusCircle, AlertCircle, TreePine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseHtmlToTree } from "@/utils/tree-parsers"

export default function HtmlFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [treeData, setTreeData] = useState<any[]>([])
  const [error, setError] = useState("")
  const { toast } = useToast()

  const formatHtml = (indent: number = 2) => {
    try {
      if (!input.trim()) {
        setError("Please enter some HTML to format")
        setOutput("")
        return
      }

      // Simple HTML formatting logic
      let formatted = input
        .replace(/></g, '>\n<')
        .replace(/^\s*\n/gm, '')
        .trim()

      const lines = formatted.split('\n')
      let indentLevel = 0
      const indentStr = ' '.repeat(indent)
      
      const formattedLines = lines.map(line => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        
        if (trimmed.startsWith('</') && !trimmed.includes('><')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const result = indentStr.repeat(indentLevel) + trimmed
        
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('><')) {
          indentLevel++
        }
        
        return result
      })

      setOutput(formattedLines.join('\n'))
      setTreeData(parseHtmlToTree(input))
      setError("")
      
      toast({
        title: "HTML formatted successfully",
        description: "Your HTML has been formatted with proper indentation",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error formatting HTML")
      setOutput("")
    }
  }

  const minifyHtml = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some HTML to minify")
        setOutput("")
        return
      }

      const minified = input
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()
      
      setOutput(minified)
      setTreeData(parseHtmlToTree(input))
      setError("")
      
      toast({
        title: "HTML minified successfully",
        description: "Your HTML has been compressed",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error minifying HTML")
      setOutput("")
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setTreeData([])
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="HTML Formatter & Beautifier - Format HTML Code Online Free"
        description="Free online HTML formatter and beautifier. Format, beautify, and minify HTML code with syntax highlighting and tree view. Professional developer tool."
        keywords="html formatter, html beautifier, html pretty print, html minifier, html validator"
        canonicalUrl="/tools/html-formatter"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">HTML Formatter & Beautifier</h1>
            </div>
            <p className="text-muted-foreground">
              Format and beautify your HTML code with proper indentation and structure.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">Instant</Badge>
              <Badge variant="secondary">No Limits</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => formatHtml(2)} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Format HTML
                </Button>
                <Button onClick={() => formatHtml(4)} variant="outline">
                  Format (4 spaces)
                </Button>
                <Button onClick={minifyHtml} variant="outline">
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Minify
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder='<div class="container"><h1>Hello World</h1><p>Welcome to HTML formatting!</p></div>'
              language="html"
              title="Input HTML"
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
                  placeholder="Formatted HTML will appear here..."
                  language="html"
                  title="Formatted Output"
                  readOnly
                />
              </TabsContent>
              <TabsContent value="tree">
                <Card>
                  <div className="p-3 border-b bg-muted/20">
                    <h3 className="text-sm font-medium">HTML Structure</h3>
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
                <div>✓ Proper HTML indentation</div>
                <div>✓ Tag structure formatting</div>
                <div>✓ HTML minification</div>
                <div>✓ File upload support</div>
                <div>✓ Copy to clipboard</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Use semantic HTML elements</div>
                <div>• Maintain consistent indentation</div>
                <div>• Close all tags properly</div>
                <div>• Use lowercase for tag names</div>
                <div>• Quote all attribute values</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Unclosed tags</div>
                <div>• Improper nesting</div>
                <div>• Missing quotes on attributes</div>
                <div>• Invalid HTML structure</div>
                <div>• Mixed case tag names</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}