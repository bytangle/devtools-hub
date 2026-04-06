import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Lock, RefreshCw, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

interface DecodedJwt {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
}

export function JwtDecoderTool({ tabId, initialInput }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [token, setToken] = useState(savedState?.token || initialInput || "")
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { token })
  }, [token, tabId, setToolState])

  const decodeJwt = () => {
    if (!token.trim()) {
      setError("Please enter a JWT token")
      setDecoded(null)
      return
    }

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      
      setDecoded({ header, payload, signature: parts[2] })
      setError("")
      toast({ title: "JWT decoded!" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JWT")
      setDecoded(null)
    }
  }

  const loadSample = () => {
    const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    setToken(sample)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!" })
  }

  const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">JWT Decoder</h2>
      </div>

      <Card>
        <CardContent className="p-3 space-y-3">
          <Textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste JWT token here..."
            className="min-h-[100px] font-mono text-sm"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={decodeJwt} className="bg-gradient-primary">
              Decode JWT
            </Button>
            <Button size="sm" onClick={loadSample} variant="outline">
              Load Sample
            </Button>
            <Button size="sm" onClick={() => { setToken(""); setDecoded(null); setError("") }} variant="outline">
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex justify-between">
                Header
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}>
                  <Copy className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex justify-between">
                Payload
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}>
                  <Copy className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
              {decoded.payload.iat && (
                <p className="text-xs text-muted-foreground mt-2">Issued: {formatTimestamp(decoded.payload.iat)}</p>
              )}
              {decoded.payload.exp && (
                <p className="text-xs text-muted-foreground">Expires: {formatTimestamp(decoded.payload.exp)}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
