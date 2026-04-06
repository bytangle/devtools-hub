import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileCode, Copy, Download, Zap, AlertCircle, CheckCircle } from "lucide-react"
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
  
  const [input, setInput] = useState(savedState?.input as string || initialInput || `<?xml version="1.0" encoding="UTF-8"?>
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

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    toast({ title: "Copied to clipboard" })
  }

  const downloadXml = () => {
    const blob = new Blob([output || input], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.xml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <FileCode className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">xml_formatter</h2>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={formatInput} className="bg-primary hover:bg-primary/90">
            <Zap className="h-3 w-3 mr-1" />
            Format
          </Button>
          <Button size="sm" variant="outline" onClick={minifyInput}>
            Minify
          </Button>
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
          {output && (
            <>
              <Button size="sm" variant="outline" onClick={copyOutput}>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={downloadXml}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </>
          )}
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="Paste XML here..."
          language="xml"
          title="Input"
        />
        <CodeEditor
          value={output}
          onChange={() => {}}
          placeholder="Formatted output..."
          language="xml"
          title="Output"
          readOnly
        />
      </div>
    </div>
  )
}
