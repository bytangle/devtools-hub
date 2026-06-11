import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeEditor } from "@/components/ui/code-editor"
import { Header } from "@/components/layout/header"
import { useToast } from "@/hooks/use-toast"
import { Link2, Shield, Globe, Code } from "lucide-react"

export default function UrlDecoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const decodeUrl = () => {
    try {
      setError("")
      if (!input.trim()) {
        setError("Please enter a URL to decode")
        return
      }

      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      
      toast({
        title: "URL decoded successfully",
        description: "The URL has been decoded",
      })
    } catch (err) {
      const errorMessage = "Invalid URL encoding format"
      setError(errorMessage)
      toast({
        title: "Decoding failed",
        description: errorMessage,
        variant: "destructive",
      })
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">URL Decoder</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Decode URL-encoded strings and special characters
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">URL Decoding</Badge>
            <Badge variant="secondary">Percent Decoding</Badge>
            <Badge variant="secondary">Special Characters</Badge>
            <Badge variant="secondary">Query Parameters</Badge>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button onClick={decodeUrl} disabled={!input.trim()}>
              <Link2 className="mr-2 h-4 w-4" />
              Decode URL
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Enter URL-encoded text here..."
              title="Encoded Input"
              language="text"
            />
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Decoded output will appear here..."
              title="Decoded Output"
              language="text"
              readOnly
              error={error}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Decode URL-encoded characters</p>
              <p className="text-sm">• Handle special characters</p>
              <p className="text-sm">• Process query parameters</p>
              <p className="text-sm">• Validate encoding format</p>
              <p className="text-sm">• Copy and download results</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Common Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Decode query parameters</p>
              <p className="text-sm">• Process form data</p>
              <p className="text-sm">• Handle special characters in URLs</p>
              <p className="text-sm">• Debug web applications</p>
              <p className="text-sm">• API parameter processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Encoding Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• %20 → space</p>
              <p className="text-sm">• %21 → !</p>
              <p className="text-sm">• %22 → "</p>
              <p className="text-sm">• %23 → #</p>
              <p className="text-sm">• %26 → &</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}