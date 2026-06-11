import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, Trash2, Zap, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function csvToJson(csv: string, delimiter: string = ','): any[] {
  const lines = csv.trim().split('\n')
  if (lines.length === 0) return []
  
  // Parse header
  const headers = parseCSVLine(lines[0], delimiter)
  
  // Parse rows
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line, delimiter)
    const obj: Record<string, any> = {}
    headers.forEach((header, i) => {
      let value: any = values[i] || ''
      // Try to parse numbers and booleans
      if (/^-?\d+$/.test(value)) value = parseInt(value)
      else if (/^-?\d+\.\d+$/.test(value)) value = parseFloat(value)
      else if (value.toLowerCase() === 'true') value = true
      else if (value.toLowerCase() === 'false') value = false
      else if (value === '') value = null
      obj[header.trim()] = value
    })
    return obj
  })
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  
  return result
}

function jsonToCsv(json: any[], delimiter: string = ','): string {
  if (!Array.isArray(json) || json.length === 0) return ''
  
  // Get all unique keys
  const keys = new Set<string>()
  json.forEach(obj => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => keys.add(key))
    }
  })
  
  const headers = Array.from(keys)
  
  // Escape CSV value
  const escape = (val: any): string => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  
  // Build CSV
  const rows = [
    headers.map(escape).join(delimiter),
    ...json.map(obj => 
      headers.map(header => escape(obj[header])).join(delimiter)
    )
  ]
  
  return rows.join('\n')
}

export function CsvJsonConverterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>(savedState?.mode || 'csv-to-json')
  const [delimiter, setDelimiter] = useState(savedState?.delimiter as string || ',')
  // Initialize inputs: initialInput always wins when present
  const [csvInput, setCsvInput] = useState(() => {
    const effectiveMode = savedState?.mode || 'csv-to-json'
    if (initialInput && effectiveMode === 'csv-to-json') return initialInput
    return savedState?.csvInput as string || ""
  })
  const [jsonInput, setJsonInput] = useState(() => {
    const effectiveMode = savedState?.mode || 'csv-to-json'
    if (initialInput && effectiveMode === 'json-to-csv') return initialInput
    // Also handle case where mode is csv-to-json but input is valid JSON (auto-detect)
    if (initialInput && effectiveMode === 'csv-to-json') return ""
    return savedState?.jsonInput as string || ""
  })
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Update the correct input when initialInput changes (for pipeline chaining)
  useEffect(() => {
    if (initialInput) {
      if (mode === 'csv-to-json') {
        setCsvInput(initialInput)
      } else {
        setJsonInput(initialInput)
      }
    }
  }, [initialInput, mode])

  useEffect(() => {
    setToolState(tabId, { csvInput, jsonInput, mode, delimiter })
  }, [csvInput, jsonInput, mode, delimiter, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const convert = () => {
    setError(null)
    
    if (mode === 'csv-to-json') {
      try {
        const data = csvToJson(csvInput, delimiter)
        const json = JSON.stringify(data, null, 2)
        setOutput(json)
        setJsonInput(json)
        toast({ title: `Converted ${data.length} rows to JSON` })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid CSV')
        toast({ title: "Invalid CSV", variant: "destructive" })
      }
    } else {
      try {
        const data = JSON.parse(jsonInput)
        if (!Array.isArray(data)) {
          throw new Error('JSON must be an array of objects')
        }
        const csv = jsonToCsv(data, delimiter)
        setOutput(csv)
        setCsvInput(csv)
        toast({ title: `Converted ${data.length} objects to CSV` })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON')
        toast({ title: "Invalid JSON", variant: "destructive" })
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (mode === 'csv-to-json') {
        setCsvInput(content)
      } else {
        setJsonInput(content)
      }
      toast({ title: `Loaded ${file.name}` })
    }
    reader.readAsText(file)
  }

  return (
    <ToolShell
      icon={Table}
      title="CSV to JSON Converter"
    >
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="csv-to-json" className="text-xs h-6 px-3">CSV → JSON</TabsTrigger>
                  <TabsTrigger value="json-to-csv" className="text-xs h-6 px-3">JSON → CSV</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Label className="text-xs">Delimiter:</Label>
                <Input
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value || ',')}
                  className="w-12 h-8 font-mono text-center"
                  maxLength={1}
                />
              </div>

              <label className="cursor-pointer">
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </span>
                </Button>
                <input
                  type="file"
                  accept={mode === 'csv-to-json' ? '.csv,.txt' : '.json'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {error && <span className="text-xs text-destructive">{error}</span>}
            </div>
          }
          input={
            <CodeEditor
              value={mode === 'csv-to-json' ? csvInput : jsonInput}
              onChange={mode === 'csv-to-json' ? setCsvInput : setJsonInput}
              placeholder={mode === 'csv-to-json' ? "Paste CSV here..." : "Paste JSON array here..."}
              language={mode === 'csv-to-json' ? "text" : "json"}
              title="Input"
            />
          }
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={convert} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Convert</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => { setCsvInput(""); setJsonInput(""); setOutput(""); setError(null) }} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Converted output..."
              language={mode === 'csv-to-json' ? "json" : "text"}
              title="Output"
              readOnly
            />
          }
        />
      </TooltipProvider>
    </ToolShell>
  )
}
