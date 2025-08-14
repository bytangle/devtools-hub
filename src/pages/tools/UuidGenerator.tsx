import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Zap, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UuidGenerator() {
  const [uuid, setUuid] = useState("")
  const [uuids, setUuids] = useState<string[]>([])
  const { toast } = useToast()

  const generateUuid = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    
    setUuid(uuid)
    toast({
      title: "UUID generated",
      description: "New UUID has been created",
    })
  }

  const generateMultiple = () => {
    const newUuids = Array.from({ length: 10 }, () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    })
    
    setUuids(newUuids)
    toast({
      title: "Multiple UUIDs generated",
      description: "10 UUIDs have been created",
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "UUID has been copied successfully",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy UUID to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">UUID Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Generate universally unique identifiers (UUIDs) for your applications.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">UUID v4</Badge>
              <Badge variant="secondary">RFC 4122</Badge>
              <Badge variant="secondary">Cryptographically Secure</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={generateUuid} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate UUID
                </Button>
                <Button onClick={generateMultiple} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate 10 UUIDs
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated UUID</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    value={uuid} 
                    readOnly 
                    className="font-mono"
                    placeholder="Click generate to create a UUID"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(uuid)}
                    disabled={!uuid}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {uuids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Multiple UUIDs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uuids.map((uid, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input 
                          value={uid} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(uid)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About UUIDs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 128-bit identifier</div>
                <div>• RFC 4122 standard</div>
                <div>• Globally unique</div>
                <div>• No central authority needed</div>
                <div>• Collision probability negligible</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Database primary keys</div>
                <div>• API request tracking</div>
                <div>• Session identifiers</div>
                <div>• File naming</div>
                <div>• Distributed systems</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">UUID Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 8-4-4-4-12 hex digits</div>
                <div>• Separated by hyphens</div>
                <div>• 36 characters total</div>
                <div>• Version 4 (random)</div>
                <div>• Case insensitive</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}