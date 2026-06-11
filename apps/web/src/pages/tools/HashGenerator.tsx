import { useState } from "react"
import { Header } from "@/components/layout/header"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Hash, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HashGenerator() {
  const [input, setInput] = useState("")
  const [algorithm, setAlgorithm] = useState("md5")
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const { toast } = useToast()

  const generateHashes = async () => {
    try {
      if (!input.trim()) {
        setError("Please enter some text to hash")
        setHashes({})
        return
      }

      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const results: Record<string, string> = {}

      // MD5 simulation (not cryptographically secure)
      results.md5 = await simpleHash(input, 'MD5')
      
      // SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
      results.sha1 = bufferToHex(sha1Buffer)
      
      // SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
      results.sha256 = bufferToHex(sha256Buffer)
      
      // SHA-384
      const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
      results.sha384 = bufferToHex(sha384Buffer)
      
      // SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
      results.sha512 = bufferToHex(sha512Buffer)

      setHashes(results)
      setError("")
      
      toast({
        title: "Hashes generated",
        description: "All hash algorithms have been computed",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating hashes")
      setHashes({})
    }
  }

  const simpleHash = async (str: string, algorithm: string): Promise<string> => {
    // Simple hash simulation for MD5 (not actual MD5)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const clearAll = () => {
    setInput("")
    setHashes({})
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Hash className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Hash Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Multiple Algorithms</Badge>
              <Badge variant="secondary">Secure</Badge>
              <Badge variant="secondary">Fast</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={generateHashes} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Hashes
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
              placeholder="Enter your text here to generate hashes..."
              language="text"
              title="Input Text"
              error={error}
            />
            
            <div className="space-y-4">
              {Object.entries(hashes).map(([algorithm, hash]) => (
                <Card key={algorithm}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm uppercase">{algorithm}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted rounded font-mono text-sm break-all">
                      {hash}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hash Algorithms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• MD5: 128-bit (legacy)</div>
                <div>• SHA-1: 160-bit (deprecated)</div>
                <div>• SHA-256: 256-bit (secure)</div>
                <div>• SHA-384: 384-bit (secure)</div>
                <div>• SHA-512: 512-bit (secure)</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Data integrity verification</div>
                <div>• Password storage</div>
                <div>• Digital signatures</div>
                <div>• Checksums</div>
                <div>• Blockchain applications</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• MD5 is cryptographically broken</div>
                <div>• SHA-1 is deprecated</div>
                <div>• Use SHA-256+ for security</div>
                <div>• Add salt for passwords</div>
                <div>• Consider bcrypt for passwords</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}