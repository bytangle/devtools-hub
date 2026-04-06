import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

type Algorithm = 'HS256' | 'HS384' | 'HS512'

// Base64URL encoding/decoding
function base64UrlEncode(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  return decodeURIComponent(escape(atob(base64)))
}

// Simple HMAC-SHA implementation using Web Crypto API
async function hmacSign(algorithm: Algorithm, key: string, data: string): Promise<string> {
  const hashAlgo = algorithm === 'HS256' ? 'SHA-256' : algorithm === 'HS384' ? 'SHA-384' : 'SHA-512'
  
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const dataToSign = encoder.encode(data)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: hashAlgo },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign)
  const bytes = new Uint8Array(signature)
  
  // Convert to base64url
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function JwtGeneratorTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [algorithm, setAlgorithm] = useState<Algorithm>(savedState?.algorithm as Algorithm || 'HS256')
  const [secret, setSecret] = useState(savedState?.secret as string || 'your-256-bit-secret')
  const [showSecret, setShowSecret] = useState(false)
  
  const [payload, setPayload] = useState(savedState?.payload as string || JSON.stringify({
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }, null, 2))
  
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToolState(tabId, { algorithm, secret, payload })
  }, [algorithm, secret, payload, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && token) {
      onOutputChange(token)
    }
  }, [token, onOutputChange])

  const header = useMemo(() => {
    return {
      alg: algorithm,
      typ: "JWT"
    }
  }, [algorithm])

  const generateToken = async () => {
    setError(null)
    
    try {
      // Validate payload JSON
      JSON.parse(payload)
    } catch {
      setError('Invalid payload JSON')
      toast({ title: "Invalid payload JSON", variant: "destructive" })
      return
    }
    
    try {
      const headerEncoded = base64UrlEncode(JSON.stringify(header))
      const payloadEncoded = base64UrlEncode(payload)
      const dataToSign = `${headerEncoded}.${payloadEncoded}`
      
      const signature = await hmacSign(algorithm, secret, dataToSign)
      const jwt = `${dataToSign}.${signature}`
      
      setToken(jwt)
      toast({ title: "JWT generated successfully" })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signing failed')
      toast({ title: "Failed to generate JWT", variant: "destructive" })
    }
  }

  const copyToken = async () => {
    await navigator.clipboard.writeText(token)
    toast({ title: "JWT copied to clipboard" })
  }

  const addClaim = (claim: string) => {
    try {
      const parsed = JSON.parse(payload)
      const now = Math.floor(Date.now() / 1000)
      
      switch (claim) {
        case 'iat':
          parsed.iat = now
          break
        case 'exp':
          parsed.exp = now + 3600 // 1 hour
          break
        case 'nbf':
          parsed.nbf = now
          break
        case 'jti':
          parsed.jti = crypto.randomUUID()
          break
      }
      
      setPayload(JSON.stringify(parsed, null, 2))
    } catch {
      // Ignore if payload isn't valid JSON yet
    }
  }

  const tokenParts = token.split('.')

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">jwt_generator</h2>
      </div>

      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-xs text-yellow-700 dark:text-yellow-400">
            This tool is for testing only. Never use test secrets in production.
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Algorithm</Label>
                <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HS256">HS256 (HMAC SHA-256)</SelectItem>
                    <SelectItem value="HS384">HS384 (HMAC SHA-384)</SelectItem>
                    <SelectItem value="HS512">HS512 (HMAC SHA-512)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm mb-2 block">Secret Key</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter secret key..."
                    className="pr-10 font-mono"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Payload (JSON)</Label>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => addClaim('iat')} className="text-xs h-6 px-2">+iat</Button>
                  <Button size="sm" variant="ghost" onClick={() => addClaim('exp')} className="text-xs h-6 px-2">+exp</Button>
                  <Button size="sm" variant="ghost" onClick={() => addClaim('nbf')} className="text-xs h-6 px-2">+nbf</Button>
                  <Button size="sm" variant="ghost" onClick={() => addClaim('jti')} className="text-xs h-6 px-2">+jti</Button>
                </div>
              </div>
              <Textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"sub": "1234567890", "name": "John Doe"}'
                className="font-mono text-sm min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Button onClick={generateToken} className="w-full bg-primary hover:bg-primary/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate JWT
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Generated Token</Label>
                {token && (
                  <Button size="sm" variant="outline" onClick={copyToken}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[120px]">
                <code className="text-xs font-mono break-all leading-relaxed">
                  {token ? (
                    <>
                      <span className="text-red-500">{tokenParts[0]}</span>
                      <span>.</span>
                      <span className="text-purple-500">{tokenParts[1]}</span>
                      <span>.</span>
                      <span className="text-blue-500">{tokenParts[2]}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Click "Generate JWT" to create a token</span>
                  )}
                </code>
              </ScrollArea>
              {error && (
                <p className="text-xs text-destructive mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Label className="text-sm mb-3 block">Decoded Token</Label>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Header</div>
                  <pre className="text-xs font-mono p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200">
                    {JSON.stringify(header, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Payload</div>
                  <pre className="text-xs font-mono p-2 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-200">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(payload), null, 2)
                      } catch {
                        return payload
                      }
                    })()}
                  </pre>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Signature</div>
                  <div className="text-xs font-mono p-2 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 break-all">
                    HMAC{algorithm.slice(2)}(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
