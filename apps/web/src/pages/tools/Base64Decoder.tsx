import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Zap, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Base64Decoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [isImage, setIsImage] = useState(false)
  const { toast } = useToast()

  const decodeFromBase64 = () => {
    try {
      if (!input.trim()) {
        setError("Please enter Base64 data to decode")
        setOutput("")
        return
      }

      // Check if it's a data URL
      if (input.startsWith('data:')) {
        const base64Data = input.split(',')[1]
        const decoded = atob(base64Data)
        
        if (input.startsWith('data:image/')) {
          setIsImage(true)
          setOutput(input) // Show the data URL for images
        } else {
          setIsImage(false)
          setOutput(decoded)
        }
      } else {
        // Regular base64 string
        const decoded = decodeURIComponent(escape(atob(input)))
        setOutput(decoded)
        setIsImage(false)
      }
      
      setError("")
      
      toast({
        title: "Base64 decoded successfully",
        description: "Your Base64 data has been decoded",
      })
    } catch (err) {
      setError("Invalid Base64 format")
      setOutput("")
      setIsImage(false)
    }
  }

  const downloadDecoded = () => {
    if (!output) return

    try {
      if (isImage) {
        // For images, download the original data URL
        const link = document.createElement('a')
        link.href = output
        link.download = 'decoded-image'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For text, create a blob
        const blob = new Blob([output], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'decoded.txt'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      
      toast({
        title: "Download complete",
        description: "File has been downloaded successfully",
      })
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Failed to download the decoded data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Base64 Decoder - Decode Base64 to Text and Files Online"
        description="Free online Base64 decoder tool. Decode Base64 strings to text, images, and other file formats. Supports data URLs and direct downloads."
        keywords="base64 decoder, base64 decode, base64 converter, decode base64, base64 to text"
        canonicalUrl="/tools/base64-decode"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Base64 Decoder</h1>
            </div>
            <p className="text-muted-foreground">
              Decode Base64 strings back to their original text or file format.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">Secure</Badge>
              <Badge variant="secondary">Image Preview</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={decodeFromBase64} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Decode Base64
                </Button>
                <Button onClick={downloadDecoded} variant="outline" disabled={!output}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => { setInput(""); setOutput(""); setError(""); setIsImage(false) }} variant="outline">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Paste your Base64 encoded data here..."
              language="text"
              title="Base64 Input"
              error={error}
            />
            
            <div className="space-y-4">
              {isImage ? (
                <Card>
                  <div className="p-3 border-b bg-muted/20">
                    <h3 className="text-sm font-medium">Decoded Image</h3>
                  </div>
                  <div className="p-4">
                    <img 
                      src={output} 
                      alt="Decoded" 
                      className="max-w-full h-auto rounded border"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                </Card>
              ) : (
                <CodeEditor
                  value={output}
                  onChange={() => {}}
                  placeholder="Decoded text will appear here..."
                  language="text"
                  title="Decoded Output"
                  readOnly
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>✓ Base64 to text decoding</div>
                <div>✓ Data URL support</div>
                <div>✓ Image preview</div>
                <div>✓ File download</div>
                <div>✓ Error validation</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Plain text</div>
                <div>• JSON data</div>
                <div>• XML files</div>
                <div>• Images (JPG, PNG, GIF)</div>
                <div>• Data URLs</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Email attachment decoding</div>
                <div>• Data URL conversion</div>
                <div>• API response processing</div>
                <div>• File recovery</div>
                <div>• Debug encoded data</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}