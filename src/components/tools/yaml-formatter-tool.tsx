import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Copy, Download, Zap, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Simple YAML parser/formatter (handles common cases)
function parseYaml(yaml: string): { data: any; error: string | null } {
  try {
    const lines = yaml.split('\n')
    const result: any = {}
    const stack: { indent: number; obj: any; key: string | null }[] = [{ indent: -1, obj: result, key: null }]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trimStart()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue
      
      const indent = line.length - trimmed.length
      
      // Handle list items
      if (trimmed.startsWith('- ')) {
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop()
        }
        const parent = stack[stack.length - 1].obj
        const key = stack[stack.length - 1].key
        if (key && !Array.isArray(parent[key])) {
          parent[key] = []
        }
        const value = trimmed.slice(2).trim()
        if (key) {
          if (value.includes(':')) {
            const obj = {}
            parent[key].push(obj)
            stack.push({ indent, obj, key: null })
          } else {
            parent[key].push(parseValue(value))
          }
        }
        continue
      }
      
      // Handle key: value pairs
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) continue
      
      const key = trimmed.slice(0, colonIndex).trim()
      const valueStr = trimmed.slice(colonIndex + 1).trim()
      
      // Pop stack to correct level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      
      const parent = stack[stack.length - 1].obj
      
      if (valueStr) {
        parent[key] = parseValue(valueStr)
      } else {
        parent[key] = {}
        stack.push({ indent, obj: parent[key], key })
      }
    }
    
    return { data: result, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Parse error' }
  }
}

function parseValue(value: string): any {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null' || value === '~') return null
  if (/^-?\d+$/.test(value)) return parseInt(value)
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

function formatYaml(data: any, indent: number = 2, level: number = 0): string {
  const space = ' '.repeat(indent * level)
  
  if (data === null) return 'null'
  if (typeof data === 'boolean') return data.toString()
  if (typeof data === 'number') return data.toString()
  if (typeof data === 'string') {
    if (data.includes('\n') || data.includes(':') || data.includes('#')) {
      return `"${data.replace(/"/g, '\\"')}"`
    }
    return data
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]'
    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const formatted = formatYaml(item, indent, level + 1)
        const lines = formatted.split('\n')
        return `${space}- ${lines[0]}\n${lines.slice(1).map(l => space + '  ' + l).join('\n')}`
      }
      return `${space}- ${formatYaml(item, indent, level)}`
    }).join('\n')
  }
  
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) return '{}'
    return entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
        return `${space}${key}:\n${formatYaml(value, indent, level + 1)}`
      }
      if (Array.isArray(value)) {
        return `${space}${key}:\n${formatYaml(value, indent, level + 1)}`
      }
      return `${space}${key}: ${formatYaml(value, indent, level)}`
    }).join('\n')
  }
  
  return String(data)
}

export function YamlFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [input, setInput] = useState(savedState?.input as string || initialInput || `# Example YAML
server:
  host: localhost
  port: 8080
  ssl: true

database:
  driver: postgres
  connection:
    host: db.example.com
    port: 5432
    name: myapp

features:
  - authentication
  - logging
  - caching
`)
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
    const { data, error: parseError } = parseYaml(input)
    
    if (parseError) {
      setError(parseError)
      setOutput('')
      toast({ title: "Invalid YAML", description: parseError, variant: "destructive" })
      return
    }
    
    const formatted = formatYaml(data, parseInt(indentSize))
    setOutput(formatted)
    setError(null)
    toast({ title: "YAML formatted successfully" })
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    toast({ title: "Copied to clipboard" })
  }

  const downloadYaml = () => {
    const blob = new Blob([output || input], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold font-mono">yaml_formatter</h2>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={formatInput} className="bg-primary hover:bg-primary/90">
            <Zap className="h-3 w-3 mr-1" />
            Format
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
              <Button size="sm" variant="outline" onClick={downloadYaml}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </>
          )}
          {error && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          )}
          {output && !error && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid YAML
            </span>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="Paste YAML here..."
          language="yaml"
          title="Input"
        />
        <CodeEditor
          value={output}
          onChange={() => {}}
          placeholder="Formatted output..."
          language="yaml"
          title="Output"
          readOnly
        />
      </div>
    </div>
  )
}
