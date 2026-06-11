import { useState } from "react"
import { Header } from "@/components/layout/header"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UrlEncoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const encodeUrl = () => {
    try {
      if (!input.trim()) {
        setError("Please enter a URL to encode")
        setOutput("")
        return
      }

      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      setError("")
      
      toast({
        title: "URL encoded successfully",
        description: "Your URL has been encoded for safe transmission",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error encoding URL")
      setOutput("")
    }
  }

  const encodeUrlComponent = () => {
    try {
      if (!input.trim()) {
        setError("Please enter a URL component to encode")
        setOutput("")
        return
      }

      const encoded = encodeURI(input)
      setOutput(encoded)
      setError("")
      
      toast({
        title: "URL component encoded",
        description: "Your URL component has been encoded",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error encoding URL component")
      setOutput("")
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">URL Encoder</h1>
            </div>
            <p className="text-muted-foreground">
              Encode URLs and URL components for safe transmission over the internet.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">RFC 3986</Badge>
              <Badge variant="secondary">Safe Transmission</Badge>
              <Badge variant="secondary">Web Standards</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={encodeUrl} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Encode URL (Full)
                </Button>
                <Button onClick={encodeUrlComponent} variant="outline">
                  Encode URI Component
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
              placeholder="https://example.com/search?q=hello world&category=news"
              language="text"
              title="Input URL"
              error={error}
            />
            
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Encoded URL will appear here..."
              language="text"
              title="Encoded Output"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Encoding Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• <strong>Full URL:</strong> encodeURIComponent()</div>
                <div>• <strong>URI Component:</strong> encodeURI()</div>
                <div>• Preserves URL structure</div>
                <div>• Handles special characters</div>
                <div>• Standards compliant</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Query parameters with spaces</div>
                <div>• Special characters in URLs</div>
                <div>• Form data submission</div>
                <div>• API requests</div>
                <div>• JavaScript URL manipulation</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Characters Encoded</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Spaces → %20</div>
                <div>• & → %26</div>
                <div>• = → %3D</div>
                <div>• ? → %3F</div>
                <div>• + → %2B</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}