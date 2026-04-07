import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileCode, Zap, Trash2, MinusCircle, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Simple XML formatter
function formatXml(xml: string, indentSize: number = 2): { formatted: string; error: string | null } {
  try {
    // Validate by parsing
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      return { formatted: '', error: parseError.textContent || 'Parse error' }
    }
    
    // Format recursively
    let output = ''
    let indent = 0
    const space = ' '.repeat(indentSize)
    
    // Tokenize
    const tokens = xml
      .replace(/>\s*</g, '><')
      .replace(/></g, '>\n<')
      .split('\n')
    
    tokens.forEach((token, i) => {
      const trimmed = token.trim()
      if (!trimmed) return
      
      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1)
      }
      
      output += space.repeat(indent) + trimmed + '\n'
      
      // Increase indent for opening tags (not self-closing, not comments)
      if (
        !trimmed.startsWith('<!') &&
        !trimmed.startsWith('<?') &&
        !trimmed.startsWith('</') &&
        !trimmed.endsWith('/>') &&
        !trimmed.endsWith('-->') &&
        trimmed.includes('<') &&
        !trimmed.match(/<[^>]+>[^<]*<\/[^>]+>/)
      ) {
        indent++
      }
    })
    
    return { formatted: output.trim(), error: null }
  } catch (e) {
    return { formatted: '', error: e instanceof Error ? e.message : 'Format error' }
  }
}

function minifyXml(xml: string): string {
  return xml
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function XmlFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [input, setInput] = useState(initialInput || savedState?.input as string || `<?xml version="1.0" encoding="UTF-8"?>
<catalog><book id="1"><author>John Doe</author><title>XML Basics</title><price currency="USD">29.99</price></book><book id="2"><author>Jane Smith</author><title>Advanced XML</title><price currency="USD">49.99</price></book></catalog>`)
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState<string>('2')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToolState(tabId, { input })
  }, [input, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const formatInput = () => {
    const { formatted, error: formatError } = formatXml(input, parseInt(indentSize))
    
    if (formatError) {
      setError(formatError)
      setOutput('')
      toast({ title: "Invalid XML", description: formatError, variant: "destructive" })
      return
    }
    
    setOutput(formatted)
    setError(null)
    toast({ title: "XML formatted successfully" })
  }

  const minifyInput = () => {
    try {
      const minified = minifyXml(input)
      setOutput(minified)
      setError(null)
      toast({ title: "XML minified successfully" })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Minify error')
      toast({ title: "Minification failed", variant: "destructive" })
    }
  }



  return (
    <TooltipProvider>
      <ToolShell
        icon={FileCode}
        title="XML Formatter"
        actions={<>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Indent:</Label>
            <Select value={indentSize} onValueChange={setIndentSize}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Invalid XML
            </span>
          )}
          {output && !error && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid XML
            </span>
          )}
        </>}
      >
        <TwoPanelLayout
          input={
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Paste XML here..."
              language="xml"
              title="Input"
            />
          }
          output={
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Formatted output..."
              language="xml"
              title="Output"
              readOnly
            />
          }
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={formatInput} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Format XML</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={minifyInput} className="h-7 w-7 rounded-full">
                  <MinusCircle className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Minify XML</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError("") }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
        />
      </ToolShell>
    </TooltipProvider>
  )
}
