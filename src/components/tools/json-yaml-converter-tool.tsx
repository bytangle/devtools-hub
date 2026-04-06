import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftRight, Copy, Download, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// YAML stringifier (JSON → YAML)
function jsonToYaml(data: any, indent: number = 0): string {
  const space = '  '.repeat(indent)
  
  if (data === null) return 'null'
  if (data === undefined) return 'null'
  if (typeof data === 'boolean') return data.toString()
  if (typeof data === 'number') return data.toString()
  if (typeof data === 'string') {
    // Escape strings that need quoting
    if (data.includes('\n') || data.includes(':') || data.includes('#') || 
        data.includes('"') || data.includes("'") || data.startsWith(' ') ||
        data.endsWith(' ') || /^[\[\]{}!@#$%^&*|>]/.test(data) ||
        /^(true|false|null|yes|no|on|off)$/i.test(data)) {
      return `"${data.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    }
    return data
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]'
    return data.map((item, i) => {
      const isComplex = typeof item === 'object' && item !== null
      if (isComplex) {
        const yaml = jsonToYaml(item, indent + 1)
        const lines = yaml.split('\n')
        return `${space}- ${lines[0]}\n${lines.slice(1).map(l => space + '  ' + l).join('\n')}`
      }
      return `${space}- ${jsonToYaml(item, indent)}`
    }).join('\n').replace(/\n\s*\n/g, '\n')
  }
  
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) return '{}'
    return entries.map(([key, value]) => {
      // Keys that need quoting
      const safeKey = /[:\s#\[\]{}]/.test(key) ? `"${key}"` : key
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return `${space}${safeKey}: []`
        }
        if (!Array.isArray(value) && Object.keys(value).length === 0) {
          return `${space}${safeKey}: {}`
        }
        return `${space}${safeKey}:\n${jsonToYaml(value, indent + 1)}`
      }
      return `${space}${safeKey}: ${jsonToYaml(value, indent)}`
    }).join('\n')
  }
  
  return String(data)
}

// Simple YAML parser (YAML → JSON)
function parseYamlValue(value: string): any {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === '~') return null
  if (trimmed === 'true' || trimmed === 'yes' || trimmed === 'on') return true
  if (trimmed === 'false' || trimmed === 'no' || trimmed === 'off') return false
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed)
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"')
  }
  if (trimmed === '[]') return []
  if (trimmed === '{}') return {}
  return trimmed
}

function yamlToJson(yaml: string): any {
  const lines = yaml.split('\n')
  const result: any = {}
  const stack: { indent: number; obj: any; key: string | null; isArray: boolean }[] = 
    [{ indent: -1, obj: result, key: null, isArray: false }]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()
    
    if (!trimmed || trimmed.startsWith('#')) continue
    
    const indent = line.length - trimmed.length
    
    // Pop stack to correct level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    
    const current = stack[stack.length - 1]
    
    // Array item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2)
      const parent = current.obj
      const key = current.key
      
      if (key !== null && parent[key] === undefined) {
        parent[key] = []
      }
      
      const arr = key !== null ? parent[key] : parent
      
      if (value.includes(': ') || value.endsWith(':')) {
        const obj = {}
        arr.push(obj)
        
        // Parse inline key: value
        if (value.includes(': ')) {
          const colonIdx = value.indexOf(': ')
          const k = value.slice(0, colonIdx).trim()
          const v = value.slice(colonIdx + 2).trim()
          obj[k] = parseYamlValue(v)
        }
        
        stack.push({ indent, obj, key: null, isArray: false })
      } else {
        arr.push(parseYamlValue(value))
      }
      continue
    }
    
    // Key: value
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx !== -1) {
      let key = trimmed.slice(0, colonIdx).trim()
      // Remove quotes from key
      if ((key.startsWith('"') && key.endsWith('"')) ||
          (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1)
      }
      
      const valueStr = trimmed.slice(colonIdx + 1).trim()
      
      if (valueStr) {
        current.obj[key] = parseYamlValue(valueStr)
      } else {
        current.obj[key] = {}
        stack.push({ indent, obj: current.obj, key, isArray: false })
      }
    }
  }
  
  return result
}

export function JsonYamlConverterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json'>(savedState?.mode || 'json-to-yaml')
  const [jsonInput, setJsonInput] = useState(savedState?.jsonInput as string || `{
  "server": {
    "host": "localhost",
    "port": 8080
  },
  "database": {
    "driver": "postgres",
    "connection": {
      "host": "db.example.com",
      "port": 5432
    }
  },
  "features": ["auth", "logging", "cache"]
}`)
  const [yamlInput, setYamlInput] = useState(savedState?.yamlInput as string || '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToolState(tabId, { jsonInput, yamlInput, mode })
  }, [jsonInput, yamlInput, mode, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const convert = () => {
    setError(null)
    
    if (mode === 'json-to-yaml') {
      try {
        const data = JSON.parse(jsonInput)
        const yaml = jsonToYaml(data)
        setOutput(yaml)
        setYamlInput(yaml)
        toast({ title: "Converted to YAML" })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON')
        toast({ title: "Invalid JSON", variant: "destructive" })
      }
    } else {
      try {
        const data = yamlToJson(yamlInput)
        const json = JSON.stringify(data, null, 2)
        setOutput(json)
        setJsonInput(json)
        toast({ title: "Converted to JSON" })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid YAML')
        toast({ title: "Invalid YAML", variant: "destructive" })
      }
    }
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    toast({ title: "Copied to clipboard" })
  }

  const downloadOutput = () => {
    const ext = mode === 'json-to-yaml' ? 'yaml' : 'json'
    const type = mode === 'json-to-yaml' ? 'text/yaml' : 'application/json'
    const blob = new Blob([output], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">json_yaml_converter</h2>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="json-to-yaml" className="text-xs h-6 px-3">JSON → YAML</TabsTrigger>
              <TabsTrigger value="yaml-to-json" className="text-xs h-6 px-3">YAML → JSON</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={convert} className="bg-primary hover:bg-primary/90">
            <Zap className="h-3 w-3 mr-1" />
            Convert
          </Button>
          {output && (
            <>
              <Button size="sm" variant="outline" onClick={copyOutput}>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={downloadOutput}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </>
          )}
          {error && (
            <span className="text-xs text-destructive">{error}</span>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          value={mode === 'json-to-yaml' ? jsonInput : yamlInput}
          onChange={mode === 'json-to-yaml' ? setJsonInput : setYamlInput}
          placeholder={mode === 'json-to-yaml' ? "Paste JSON here..." : "Paste YAML here..."}
          language={mode === 'json-to-yaml' ? "json" : "yaml"}
          title="Input"
        />
        <CodeEditor
          value={output}
          onChange={() => {}}
          placeholder="Converted output..."
          language={mode === 'json-to-yaml' ? "yaml" : "json"}
          title="Output"
          readOnly
        />
      </div>
    </div>
  )
}
