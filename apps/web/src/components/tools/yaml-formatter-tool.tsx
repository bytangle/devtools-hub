import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Zap, Trash2, AlertCircle, CheckCircle } from "lucide-react"
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
    // Stack tracks: indent level, the container object, and the key in parent that holds this container
    const stack: { indent: number; container: any; parentRef: { obj: any; key: string } | null }[] = [
      { indent: -1, container: result, parentRef: null }
    ]
    
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
        const top = stack[stack.length - 1]
        // Convert the container to an array if it isn't already
        if (top.parentRef && !Array.isArray(top.container)) {
          const arr: any[] = []
          top.parentRef.obj[top.parentRef.key] = arr
          top.container = arr
        }
        const value = trimmed.slice(2).trim()
        if (Array.isArray(top.container)) {
          if (value && value.includes(':')) {
            const obj: any = {}
            // Parse inline key:value in list item
            const ci = value.indexOf(':')
            const k = value.slice(0, ci).trim()
            const v = value.slice(ci + 1).trim()
            obj[k] = v ? parseValue(v) : {}
            top.container.push(obj)
            stack.push({ indent, container: obj, parentRef: null })
          } else {
            top.container.push(parseValue(value))
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
      
      const container = stack[stack.length - 1].container
      
      if (valueStr) {
        container[key] = parseValue(valueStr)
      } else {
        // Create a nested object; may be converted to array if list items follow
        const nested = {}
        container[key] = nested
        stack.push({ indent, container: nested, parentRef: { obj: container, key } })
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
  
  const [input, setInput] = useState(initialInput || savedState?.input as string || `# Example YAML
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



  return (
    <TooltipProvider>
      <ToolShell
        icon={FileText}
        title="YAML Formatter"
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
              Invalid YAML
            </span>
          )}
          {output && !error && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid YAML
            </span>
          )}
        </>}
      >
        <TwoPanelLayout
          input={
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Paste YAML here..."
              language="yaml"
              title="Input"
            />
          }
          output={
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Formatted output..."
              language="yaml"
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
              <TooltipContent side="right"><p>Format YAML</p></TooltipContent>
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
