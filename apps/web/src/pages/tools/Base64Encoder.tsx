import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Binary, Zap, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Base64Encoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const encodeToBase64 = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some text to encode")
        setOutput("")
        return
      }

      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError("")
      
      toast({
        title: "Text encoded successfully",
        description: "Your text has been converted to Base64",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error encoding text")
      setOutput("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setError("File size must be less than 1MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string
          const base64 = result.split(',')[1]
          setOutput(base64)
          setInput(`File: ${file.name} (${file.type})`)
          setError("")
          
          toast({
            title: "File encoded successfully",
            description: `${file.name} has been converted to Base64`,
          })
        } catch (err) {
          setError("Error processing file")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Base64 Encoder - Encode Text and Files to Base64 Online"
        description="Free online Base64 encoder tool. Encode text and files to Base64 format with support for images, documents, and other file types up to 1MB."
        keywords="base64 encoder, base64 encode, file encoder, text encoder, image encoder"
        canonicalUrl="/tools/base64-encode"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Binary className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Base64 Encoder</h1>
            </div>
            <p className="text-muted-foreground">
              Encode text and files to Base64 format for safe transmission and storage.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">Secure</Badge>
              <Badge variant="secondary">File Support</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={encodeToBase64} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Encode to Base64
                </Button>
                <label>
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,text/*,.json,.xml,.csv"
                  />
                </label>
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
              placeholder="Enter your text here to encode to Base64..."
              language="text"
              title="Input Text"
              error={error}
            />
            
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Base64 encoded output will appear here..."
              language="text"
              title="Base64 Output"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>✓ Text to Base64 encoding</div>
                <div>✓ File to Base64 encoding</div>
                <div>✓ UTF-8 support</div>
                <div>✓ Copy to clipboard</div>
                <div>✓ Download results</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Email attachments</div>
                <div>• Data URLs for images</div>
                <div>• API data transmission</div>
                <div>• Configuration files</div>
                <div>• Web development</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Images (PNG, JPG, GIF)</div>
                <div>• Text files</div>
                <div>• JSON files</div>
                <div>• XML files</div>
                <div>• CSV files</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}