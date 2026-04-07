import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Hash, Zap, Copy, Check, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

// MD5 Implementation (RFC 1321)
function md5(input: string): string {
  function rotateLeft(x: number, n: number): number {
    return (x << n) | (x >>> (32 - n))
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }

  function F(x: number, y: number, z: number): number { return (x & y) | (~x & z) }
  function G(x: number, y: number, z: number): number { return (x & z) | (y & ~z) }
  function H(x: number, y: number, z: number): number { return x ^ y ^ z }
  function I(x: number, y: number, z: number): number { return y ^ (x | ~z) }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function wordToHex(value: number): string {
    let hex = ""
    for (let i = 0; i <= 3; i++) {
      hex += ((value >>> (i * 8)) & 255).toString(16).padStart(2, "0")
    }
    return hex
  }

  // Convert input to UTF-8 byte array
  const bytes = new TextEncoder().encode(input)
  const words: number[] = []
  
  for (let i = 0; i < bytes.length; i += 4) {
    words[i >> 2] = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)
  }

  const bitLength = bytes.length * 8
  words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8)
  words[(((bytes.length + 8) >>> 6) << 4) + 14] = bitLength

  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476

  for (let i = 0; i < words.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d
    const x = words.slice(i, i + 16)
    for (let j = x.length; j < 16; j++) x[j] = 0

    a = FF(a, b, c, d, x[0], 7, 0xD76AA478);  d = FF(d, a, b, c, x[1], 12, 0xE8C7B756)
    c = FF(c, d, a, b, x[2], 17, 0x242070DB); b = FF(b, c, d, a, x[3], 22, 0xC1BDCEEE)
    a = FF(a, b, c, d, x[4], 7, 0xF57C0FAF);  d = FF(d, a, b, c, x[5], 12, 0x4787C62A)
    c = FF(c, d, a, b, x[6], 17, 0xA8304613); b = FF(b, c, d, a, x[7], 22, 0xFD469501)
    a = FF(a, b, c, d, x[8], 7, 0x698098D8);  d = FF(d, a, b, c, x[9], 12, 0x8B44F7AF)
    c = FF(c, d, a, b, x[10], 17, 0xFFFF5BB1); b = FF(b, c, d, a, x[11], 22, 0x895CD7BE)
    a = FF(a, b, c, d, x[12], 7, 0x6B901122); d = FF(d, a, b, c, x[13], 12, 0xFD987193)
    c = FF(c, d, a, b, x[14], 17, 0xA679438E); b = FF(b, c, d, a, x[15], 22, 0x49B40821)

    a = GG(a, b, c, d, x[1], 5, 0xF61E2562);  d = GG(d, a, b, c, x[6], 9, 0xC040B340)
    c = GG(c, d, a, b, x[11], 14, 0x265E5A51); b = GG(b, c, d, a, x[0], 20, 0xE9B6C7AA)
    a = GG(a, b, c, d, x[5], 5, 0xD62F105D);  d = GG(d, a, b, c, x[10], 9, 0x02441453)
    c = GG(c, d, a, b, x[15], 14, 0xD8A1E681); b = GG(b, c, d, a, x[4], 20, 0xE7D3FBC8)
    a = GG(a, b, c, d, x[9], 5, 0x21E1CDE6);  d = GG(d, a, b, c, x[14], 9, 0xC33707D6)
    c = GG(c, d, a, b, x[3], 14, 0xF4D50D87); b = GG(b, c, d, a, x[8], 20, 0x455A14ED)
    a = GG(a, b, c, d, x[13], 5, 0xA9E3E905); d = GG(d, a, b, c, x[2], 9, 0xFCEFA3F8)
    c = GG(c, d, a, b, x[7], 14, 0x676F02D9); b = GG(b, c, d, a, x[12], 20, 0x8D2A4C8A)

    a = HH(a, b, c, d, x[5], 4, 0xFFFA3942);  d = HH(d, a, b, c, x[8], 11, 0x8771F681)
    c = HH(c, d, a, b, x[11], 16, 0x6D9D6122); b = HH(b, c, d, a, x[14], 23, 0xFDE5380C)
    a = HH(a, b, c, d, x[1], 4, 0xA4BEEA44);  d = HH(d, a, b, c, x[4], 11, 0x4BDECFA9)
    c = HH(c, d, a, b, x[7], 16, 0xF6BB4B60); b = HH(b, c, d, a, x[10], 23, 0xBEBFBC70)
    a = HH(a, b, c, d, x[13], 4, 0x289B7EC6); d = HH(d, a, b, c, x[0], 11, 0xEAA127FA)
    c = HH(c, d, a, b, x[3], 16, 0xD4EF3085); b = HH(b, c, d, a, x[6], 23, 0x04881D05)
    a = HH(a, b, c, d, x[9], 4, 0xD9D4D039);  d = HH(d, a, b, c, x[12], 11, 0xE6DB99E5)
    c = HH(c, d, a, b, x[15], 16, 0x1FA27CF8); b = HH(b, c, d, a, x[2], 23, 0xC4AC5665)

    a = II(a, b, c, d, x[0], 6, 0xF4292244);  d = II(d, a, b, c, x[7], 10, 0x432AFF97)
    c = II(c, d, a, b, x[14], 15, 0xAB9423A7); b = II(b, c, d, a, x[5], 21, 0xFC93A039)
    a = II(a, b, c, d, x[12], 6, 0x655B59C3); d = II(d, a, b, c, x[3], 10, 0x8F0CCC92)
    c = II(c, d, a, b, x[10], 15, 0xFFEFF47D); b = II(b, c, d, a, x[1], 21, 0x85845DD1)
    a = II(a, b, c, d, x[8], 6, 0x6FA87E4F);  d = II(d, a, b, c, x[15], 10, 0xFE2CE6E0)
    c = II(c, d, a, b, x[6], 15, 0xA3014314); b = II(b, c, d, a, x[13], 21, 0x4E0811A1)
    a = II(a, b, c, d, x[4], 6, 0xF7537E82);  d = II(d, a, b, c, x[11], 10, 0xBD3AF235)
    c = II(c, d, a, b, x[2], 15, 0x2AD7D2BB); b = II(b, c, d, a, x[9], 21, 0xEB86D391)

    a = addUnsigned(a, aa); b = addUnsigned(b, bb)
    c = addUnsigned(c, cc); d = addUnsigned(d, dd)
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
}

export function HashGeneratorTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(initialInput || savedState?.input as string || "")
  const [hashes, setHashes] = useState<{md5: string, sha1: string, sha256: string, sha512: string}>({
    md5: "", sha1: "", sha256: "", sha512: ""
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input })
  }, [input, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && hashes.sha256) {
      onOutputChange(`MD5: ${hashes.md5}\nSHA-1: ${hashes.sha1}\nSHA-256: ${hashes.sha256}\nSHA-512: ${hashes.sha512}`)
    }
  }, [hashes, onOutputChange])

  const generateHashes = async () => {
    if (!input.trim()) {
      toast({ title: "Please enter some text", variant: "destructive" })
      return
    }
    
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    
    // MD5 (custom implementation)
    const md5Hash = md5(input)
    
    // SHA-256
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
    const sha256Hash = Array.from(new Uint8Array(sha256Buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // SHA-1
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
    const sha1Hash = Array.from(new Uint8Array(sha1Buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // SHA-512
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
    const sha512Hash = Array.from(new Uint8Array(sha512Buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    
    setHashes({ md5: md5Hash, sha1: sha1Hash, sha256: sha256Hash, sha512: sha512Hash })
    toast({ title: "Hashes generated" })
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
    toast({ title: "Copied to clipboard" })
  }

  const hashTypes = [
    { name: "MD5", value: hashes.md5, bits: 128 },
    { name: "SHA-1", value: hashes.sha1, bits: 160 },
    { name: "SHA-256", value: hashes.sha256, bits: 256 },
    { name: "SHA-512", value: hashes.sha512, bits: 512 },
  ]

  return (
    <ToolShell
      icon={Hash}
      title="Hash Generator"
      actions={<>
        <span className="text-xs text-muted-foreground font-mono">
          {input.length} chars · {new Blob([input]).size} bytes
        </span>
      </>}
    >
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={<CodeEditor value={input} onChange={setInput} placeholder="Enter text to hash..." language="text" title="Input" />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={generateHashes} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Generate hashes</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setInput(""); setHashes({ md5: "", sha1: "", sha256: "", sha512: "" }) }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={
            <div className="rounded-lg border p-4 space-y-3 h-full overflow-auto">
              {hashTypes.map(({ name, value, bits }) => (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-medium text-muted-foreground">{name} <span className="text-[10px]">({bits}-bit)</span></p>
                    {value && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(value, name)}
                      >
                        {copiedField === name ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                  <code className="block text-xs bg-muted p-2 rounded font-mono break-all min-h-[2rem]">
                    {value || <span className="text-muted-foreground">—</span>}
                  </code>
                </div>
              ))}
            </div>
          }
        />
      </TooltipProvider>
    </ToolShell>
  )
}
