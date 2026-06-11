import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { CodeEditor } from "@/components/ui/code-editor"
import { TreeView } from "@/components/ui/tree-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Zap, MinusCircle, AlertCircle, TreePine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseJsonToTree } from "@/utils/tree-parsers"

export default function JsonFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [treeData, setTreeData] = useState<any[]>([])
  const [error, setError] = useState("")
  const { toast } = useToast()

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
    <div className="min-h-screen bg-background">
      <SEO 
        title="JSON Formatter & Beautifier - Format and Validate JSON Online"
        description="Free online JSON formatter and validator. Format, beautify, minify and validate JSON data with syntax highlighting and tree view. Professional developer tool."
        keywords="json formatter, json beautifier, json validator, json minifier, json parser, json viewer"
        canonicalUrl="/tools/json-formatter"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">JSON Formatter & Validator</h1>
            </div>
            <p className="text-muted-foreground">
              Format, validate, and beautify your JSON data with syntax highlighting and error detection.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">No Registration</Badge>
              <Badge variant="secondary">Instant Results</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => formatJson(2)} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Format JSON
                </Button>
                <Button onClick={() => formatJson(4)} variant="outline">
                  Format (4 spaces)
                </Button>
                <Button onClick={minifyJson} variant="outline">
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Minify
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Editors and Tree View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CodeEditor
                value={input}
                onChange={setInput}
                placeholder='{"name": "John", "age": 30, "city": "New York"}'
                language="json"
                title="Input JSON"
                error={error}
              />
            </div>
            
            <div className="space-y-4">
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
                    placeholder="Formatted JSON will appear here..."
                    language="json"
                    title="Formatted Output"
                    readOnly
                  />
                </TabsContent>
                <TabsContent value="tree">
                  <Card>
                    <div className="p-3 border-b bg-muted/20">
                      <h3 className="text-sm font-medium">JSON Structure</h3>
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
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>✓ JSON formatting with custom indentation</div>
                <div>✓ JSON validation and error detection</div>
                <div>✓ Minification for production use</div>
                <div>✓ File upload and download support</div>
                <div>✓ Copy to clipboard functionality</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Use 2 spaces for web development</div>
                <div>• Use 4 spaces for better readability</div>
                <div>• Minify for production deployment</div>
                <div>• Validate before using in applications</div>
                <div>• Upload files up to 1MB in size</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                  Common Errors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Missing or extra commas</div>
                <div>• Unmatched quotes or brackets</div>
                <div>• Invalid escape sequences</div>
                <div>• Trailing commas in arrays/objects</div>
                <div>• Single quotes instead of double</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}