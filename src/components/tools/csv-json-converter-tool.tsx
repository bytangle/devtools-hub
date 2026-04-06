import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, Copy, Download, Zap, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [csvInput, setCsvInput] = useState(savedState?.csvInput as string || `name,age,city,active
John Doe,30,New York,true
Jane Smith,25,Los Angeles,false
Bob Johnson,35,Chicago,true
Alice Brown,28,Houston,true`)
  const [jsonInput, setJsonInput] = useState(savedState?.jsonInput as string || '')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    toast({ title: "Copied to clipboard" })
  }

  const downloadOutput = () => {
    const ext = mode === 'csv-to-json' ? 'json' : 'csv'
    const type = mode === 'csv-to-json' ? 'application/json' : 'text/csv'
    const blob = new Blob([output], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
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
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Table className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">csv_json_converter</h2>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
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
          
          <Button size="sm" onClick={convert} className="bg-primary hover:bg-primary/90">
            <Zap className="h-3 w-3 mr-1" />
            Convert
          </Button>
          
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
          value={mode === 'csv-to-json' ? csvInput : jsonInput}
          onChange={mode === 'csv-to-json' ? setCsvInput : setJsonInput}
          placeholder={mode === 'csv-to-json' ? "Paste CSV here..." : "Paste JSON array here..."}
          language={mode === 'csv-to-json' ? "text" : "json"}
          title="Input"
        />
        <CodeEditor
          value={output}
          onChange={() => {}}
          placeholder="Converted output..."
          language={mode === 'csv-to-json' ? "json" : "text"}
          title="Output"
          readOnly
        />
      </div>
    </div>
  )
}
