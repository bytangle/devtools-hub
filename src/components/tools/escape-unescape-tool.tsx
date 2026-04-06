import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Code, Copy, ArrowLeftRight } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EscapeType = 'html' | 'url' | 'json' | 'unicode' | 'base64' | 'backslash'

const escapeTypes: { id: EscapeType; label: string }[] = [
  { id: 'html', label: 'HTML Entities' },
  { id: 'url', label: 'URL Encoding' },
  { id: 'json', label: 'JSON String' },
  { id: 'unicode', label: 'Unicode Escape' },
  { id: 'base64', label: 'Base64' },
  { id: 'backslash', label: 'Backslash Escape' },
]

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

const reverseHtmlEntities: Record<string, string> = Object.fromEntries(
  Object.entries(htmlEntities).map(([k, v]) => [v, k])
)

function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char)
}

function unescapeHtml(str: string): string {
  // Handle numeric entities
  let result = str.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
  // Handle named entities
  Object.entries(reverseHtmlEntities).forEach(([entity, char]) => {
    result = result.split(entity).join(char)
  })
  return result
}

function escapeJson(str: string): string {
  return JSON.stringify(str).slice(1, -1)
}

function unescapeJson(str: string): string {
  try {
    return JSON.parse(`"${str}"`)
  } catch {
    return str
  }
}

function escapeUnicode(str: string): string {
  return str.split('').map(char => {
    const code = char.charCodeAt(0)
    if (code > 127) {
      return '\\u' + code.toString(16).padStart(4, '0')
    }
    return char
  }).join('')
}

function unescapeUnicode(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  )
}

function escapeBackslash(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
}

function unescapeBackslash(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}

function escape(str: string, type: EscapeType): string {
  switch (type) {
    case 'html': return escapeHtml(str)
    case 'url': return encodeURIComponent(str)
    case 'json': return escapeJson(str)
    case 'unicode': return escapeUnicode(str)
    case 'base64': return btoa(unescape(encodeURIComponent(str)))
    case 'backslash': return escapeBackslash(str)
    default: return str
  }
}

function unescape(str: string, type: EscapeType): string {
  switch (type) {
    case 'html': return unescapeHtml(str)
    case 'url': return decodeURIComponent(str)
    case 'json': return unescapeJson(str)
    case 'unicode': return unescapeUnicode(str)
    case 'base64': 
      try {
        return decodeURIComponent(escape(atob(str)))
      } catch {
        return str
      }
    case 'backslash': return unescapeBackslash(str)
    default: return str
  }
}

export function EscapeUnescapeTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [mode, setMode] = useState<'escape' | 'unescape'>(savedState?.mode || 'escape')
  const [escapeType, setEscapeType] = useState<EscapeType>(savedState?.escapeType as EscapeType || 'html')
  const [input, setInput] = useState(savedState?.input as string || initialInput || '<script>alert("Hello & World!")</script>')

  const output = useMemo(() => {
    try {
      return mode === 'escape' ? escape(input, escapeType) : unescape(input, escapeType)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : 'Invalid input'}`
    }
  }, [input, mode, escapeType])

  useEffect(() => {
    setToolState(tabId, { input, mode, escapeType })
  }, [input, mode, escapeType, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    toast({ title: "Copied to clipboard" })
  }

  const swap = () => {
    setInput(output)
    setMode(mode === 'escape' ? 'unescape' : 'escape')
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Code className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">escape_unescape</h2>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="escape" className="text-xs h-6 px-3">Escape</TabsTrigger>
              <TabsTrigger value="unescape" className="text-xs h-6 px-3">Unescape</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={escapeType} onValueChange={(v) => setEscapeType(v as EscapeType)}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {escapeTypes.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="outline" onClick={swap}>
            <ArrowLeftRight className="h-3 w-3 mr-1" />
            Swap
          </Button>
          
          <Button size="sm" variant="outline" onClick={copyOutput}>
            <Copy className="h-3 w-3 mr-1" />
            Copy Output
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Input</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to escape/unescape..."
              className="font-mono text-sm min-h-[200px]"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Output</Label>
            <Textarea
              value={output}
              readOnly
              className="font-mono text-sm min-h-[200px] bg-muted/30"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Quick Reference</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2 rounded bg-muted/30">
              <div className="font-medium text-muted-foreground">HTML Entities</div>
              <code>&lt; &gt; &amp; &quot;</code>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="font-medium text-muted-foreground">URL Encoding</div>
              <code>%20 %3D %26 %3F</code>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="font-medium text-muted-foreground">JSON String</div>
              <code>\" \\ \n \t</code>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="font-medium text-muted-foreground">Unicode</div>
              <code>\u0041 = A</code>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="font-medium text-muted-foreground">Base64</div>
              <code>SGVsbG8= = Hello</code>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="font-medium text-muted-foreground">Backslash</div>
              <code>\n \r \t \\</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
