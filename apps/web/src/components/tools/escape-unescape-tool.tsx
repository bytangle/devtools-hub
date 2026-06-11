import { useState, useEffect, useMemo } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Code, ArrowLeftRight, Trash2 } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [input, setInput] = useState(initialInput || savedState?.input as string || '<script>alert("Hello & World!")</script>')

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

  const swap = () => {
    setInput(output)
    setMode(mode === 'escape' ? 'unescape' : 'escape')
  }

  return (
    <ToolShell icon={Code} title="Escape / Unescape">
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
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
            </div>
          }
          input={<CodeEditor value={input} onChange={setInput} placeholder="Enter text to escape/unescape..." language="text" title="Input" />}
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={swap} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Swap</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setInput(""); setMode("escape") }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={<CodeEditor value={output} onChange={() => {}} placeholder="Result..." language="text" title="Output" readOnly />}
        />
      </TooltipProvider>
    </ToolShell>
  )
}
