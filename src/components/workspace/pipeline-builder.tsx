import { useState, useCallback, useRef } from "react"
import { useWorkspace, type PipelineNode } from "@/context/workspace-context"
import { tools, type Tool } from "@/data/tools"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Play,
  Trash2,
  ArrowDown,
  GripVertical,
  ChevronDown,
  Save,
  FolderOpen,
  RotateCcw,
  Copy,
  ArrowRight,
  Zap,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Tool categories for grouping in selector
const toolCategories = {
  formatters: ["json-formatter", "html-formatter", "css-formatter", "sql-formatter", "minify-css", "minify-js", "yaml-formatter", "xml-formatter", "graphql-formatter"],
  converters: ["base64-encode", "base64-decode", "url-encode", "url-decode", "timestamp-converter", "text-case-converter", "base-converter", "json-yaml-converter", "csv-json-converter", "escape-unescape", "byte-unit-converter"],
  generators: ["password-generator", "uuid-generator", "hash-generator", "lorem-generator", "qr-generator", "mock-data-generator", "jwt-generator"],
  validators: ["json-validator", "html-validator", "css-validator"],
  utilities: ["regex-tester", "text-counter", "diff-checker", "markdown-preview", "jwt-decoder", "color-picker", "cron-builder", "unix-permissions", "http-status"],
}

// Get tool by ID helper
const getToolById = (id: string): Tool | undefined => {
  return tools.find((t) => t.id === id)
}

interface PipelineNodeCardProps {
  node: PipelineNode
  index: number
  isFirst: boolean
  isLast: boolean
  canRunStep: boolean
  isRunningStep: boolean
  onRemove: () => void
  onUpdateInput: (input: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRunStep: () => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  isDragTarget: boolean
}

function PipelineNodeCard({
  node,
  index,
  isFirst,
  isLast,
  canRunStep,
  isRunningStep,
  onRemove,
  onUpdateInput,
  onMoveUp,
  onMoveDown,
  onRunStep,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragTarget,
}: PipelineNodeCardProps) {
  const tool = getToolById(node.toolId)
  const [isExpanded, setIsExpanded] = useState(true)
  const { toast } = useToast()

  if (!tool) return null

  const ToolIcon = tool.icon
  const hasOutput = !!node.output

  const copyOutput = () => {
    if (node.output) {
      navigator.clipboard.writeText(node.output)
      toast({ title: `Step ${index + 1} output copied` })
    }
  }

  const copyInput = () => {
    if (node.input) {
      navigator.clipboard.writeText(node.input)
      toast({ title: `Step ${index + 1} input copied` })
    }
  }

  return (
    <div
      className="relative"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
    >
      {/* Connection line */}
      {!isFirst && (
        <div className="flex flex-col items-center py-2">
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
          <div className="text-xs text-muted-foreground">Output → Input</div>
        </div>
      )}

      <Card className={cn(
        "border-2 transition-all",
        hasOutput ? "border-green-500/50" : "border-border",
        isDragTarget && "border-primary border-dashed ring-2 ring-primary/20",
        isRunningStep && "border-yellow-500/50 animate-pulse"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
              <Badge variant="outline" className="text-xs">
                Step {index + 1}
              </Badge>
              <CardTitle className="text-base flex items-center gap-2">
                <ToolIcon className="h-4 w-4" />
                {tool.title}
              </CardTitle>
              {hasOutput && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {isRunningStep && (
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Per-step run button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  canRunStep && "text-primary hover:text-primary"
                )}
                onClick={onRunStep}
                disabled={!canRunStep || isRunningStep}
                title={
                  canRunStep 
                    ? `Run step ${index + 1}` 
                    : isFirst 
                    ? "Enter input to run" 
                    : "Previous steps must be run first"
                }
              >
                {isRunningStep ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              {/* Copy output button */}
              {hasOutput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600 hover:text-green-700"
                  onClick={copyOutput}
                  title="Copy output"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <span className="sr-only">Node actions</span>
                    •••
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onMoveUp} disabled={isFirst}>
                    Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMoveDown} disabled={isLast}>
                    Move Down
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyInput} disabled={!node.input}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Input
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyOutput} disabled={!node.output}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Output
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRemove} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3">
            {/* Input section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  {isFirst ? "Initial Input" : "Input (from previous step)"}
                </label>
                {node.input && !isFirst && (
                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs" onClick={copyInput}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              {isFirst ? (
                <Textarea
                  value={node.input || ""}
                  onChange={(e) => onUpdateInput(e.target.value)}
                  placeholder="Enter initial input for the pipeline..."
                  className="min-h-[80px] text-sm font-mono"
                />
              ) : (
                <div className="p-2 bg-muted rounded-md text-sm font-mono max-h-[80px] overflow-auto">
                  {node.input || <span className="text-muted-foreground italic">No input yet</span>}
                </div>
              )}
            </div>

            {/* Output section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  Output
                  {hasOutput && (
                    <Badge variant="secondary" className="text-xs">
                      {node.output!.length} chars
                    </Badge>
                  )}
                </label>
                {hasOutput && (
                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-green-600" onClick={copyOutput}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              <div className={cn(
                "p-2 rounded-md text-sm font-mono max-h-[120px] overflow-auto",
                hasOutput ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900" : "bg-muted"
              )}>
                {node.output || (
                  <span className="text-muted-foreground italic">
                    {canRunStep ? "Click ▶ to run this step" : "Run preceding steps first"}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

interface AddToolDialogProps {
  onAddTool: (toolId: string) => void
}

function AddToolDialog({ onAddTool }: AddToolDialogProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())

    if (selectedCategory === "all") return matchesSearch

    const categoryTools = toolCategories[selectedCategory as keyof typeof toolCategories] || []
    return matchesSearch && categoryTools.includes(tool.id)
  })

  const handleSelect = (toolId: string) => {
    onAddTool(toolId)
    setOpen(false)
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Tool Step
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Tool to Pipeline</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="formatters">Formatters</SelectItem>
                <SelectItem value="converters">Converters</SelectItem>
                <SelectItem value="generators">Generators</SelectItem>
                <SelectItem value="validators">Validators</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredTools.map((tool) => {
                const ToolIcon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <ToolIcon className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{tool.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
              {filteredTools.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tools match your search
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Tool processor - runs actual tool logic for pipeline steps
function processToolStep(toolId: string, input: string): string {
  switch (toolId) {
    case "json-formatter":
      try {
        return JSON.stringify(JSON.parse(input), null, 2)
      } catch {
        return `Error: Invalid JSON\n\nInput:\n${input}`
      }

    case "base64-encode":
      try {
        return btoa(unescape(encodeURIComponent(input)))
      } catch {
        return `Error: Cannot encode to Base64\n\nInput:\n${input}`
      }

    case "base64-decode":
      try {
        return decodeURIComponent(escape(atob(input.trim())))
      } catch {
        return `Error: Invalid Base64 string\n\nInput:\n${input}`
      }

    case "url-encode":
      return encodeURIComponent(input)

    case "url-decode":
      try {
        return decodeURIComponent(input)
      } catch {
        return `Error: Invalid URL encoding\n\nInput:\n${input}`
      }

    case "json-validator":
      try {
        JSON.parse(input)
        return `✓ Valid JSON\n\n${input}`
      } catch (e) {
        return `✗ Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}\n\nInput:\n${input}`
      }

    case "text-counter": {
      const chars = input.length
      const words = input.trim() ? input.trim().split(/\s+/).length : 0
      const lines = input.split("\n").length
      const bytes = new Blob([input]).size
      return `Characters: ${chars}\nWords: ${words}\nLines: ${lines}\nBytes: ${bytes}\n\n---\n${input}`
    }

    case "minify-css":
    case "css-minifier":
      return input
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .trim()

    case "minify-js":
    case "js-minifier":
      return input
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}():;,=+\-*/<>!&|])\s*/g, "$1")
        .trim()

    case "hash-generator": {
      // Simple hash calculation for sync operation
      let hash = 0
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const hashHex = Math.abs(hash).toString(16).padStart(8, "0")
      
      return `Hash: ${hashHex}\nLength: ${input.length} chars\n\n---\n${input}`
    }

    case "html-formatter":
      try {
        // Simple HTML formatting
        let formatted = input
        let indent = 0
        const lines: string[] = []
        
        formatted.split(/(<[^>]+>)/g).forEach(part => {
          if (!part.trim()) return
          
          if (part.match(/^<\//)) {
            indent = Math.max(0, indent - 1)
          }
          
          if (part.startsWith('<')) {
            lines.push('  '.repeat(indent) + part.trim())
          } else if (part.trim()) {
            lines.push('  '.repeat(indent) + part.trim())
          }
          
          if (part.match(/^<[^\/!][^>]*[^\/]>$/) && !part.match(/^<(br|hr|img|input|meta|link)/i)) {
            indent++
          }
        })
        
        return lines.join('\n')
      } catch {
        return input
      }

    case "css-formatter":
      try {
        return input
          .replace(/\{/g, ' {\n  ')
          .replace(/;/g, ';\n  ')
          .replace(/\}/g, '\n}\n')
          .replace(/  \n\}/g, '}')
          .trim()
      } catch {
        return input
      }

    case "sql-formatter":
      try {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'ORDER BY', 'GROUP BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INTO', 'VALUES', 'SET', 'LIMIT', 'OFFSET', 'UNION', 'AS']
        let formatted = input.toUpperCase()
        keywords.forEach(kw => {
          formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `\n${kw}`)
        })
        return formatted.trim().replace(/^\n/, '')
      } catch {
        return input
      }

    case "uuid-generator":
      // Generate a new UUID and append to input
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      return input ? `${input}\n${uuid}` : uuid

    case "password-generator": {
      const length = 16
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      return input ? `${input}\n${password}` : password
    }

    case "lorem-generator": {
      const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
      return input ? `${input}\n\n${lorem}` : lorem
    }

    case "timestamp-converter": {
      const now = Date.now()
      const date = new Date(now)
      return `Unix: ${Math.floor(now / 1000)}\nISO: ${date.toISOString()}\nLocal: ${date.toLocaleString()}\n\n${input ? `Input: ${input}` : ''}`
    }

    case "regex-tester":
      // Just pass through - regex testing needs the pattern which we don't have
      return `Regex test input:\n${input}`

    case "color-picker":
      // Pass through - color picker is interactive
      return input

    case "jwt-decoder":
      try {
        const parts = input.trim().split('.')
        if (parts.length !== 3) {
          return `Error: Invalid JWT format (expected 3 parts, got ${parts.length})\n\nInput:\n${input}`
        }
        const header = JSON.parse(atob(parts[0]))
        const payload = JSON.parse(atob(parts[1]))
        return `Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`
      } catch {
        return `Error: Could not decode JWT\n\nInput:\n${input}`
      }

    case "markdown-preview":
      // Simple markdown to text conversion
      return input
        .replace(/^### (.*$)/gim, '$1')
        .replace(/^## (.*$)/gim, '$1')
        .replace(/^# (.*$)/gim, '$1')
        .replace(/\*\*(.*)\*\*/gim, '$1')
        .replace(/\*(.*)\*/gim, '$1')
        .replace(/`(.*)`/gim, '$1')

    // New tool processors
    case "text-case-converter": {
      // Convert to various cases - default to camelCase
      const words = input.replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_\-./\\]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0)
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    }

    case "base-converter": {
      // Try to parse as decimal and show all bases
      const num = parseInt(input.trim())
      if (isNaN(num)) return `Error: Invalid number\n\nInput:\n${input}`
      return `Binary:  ${num.toString(2)}\nOctal:   ${num.toString(8)}\nDecimal: ${num}\nHex:     ${num.toString(16).toUpperCase()}`
    }

    case "yaml-formatter":
    case "xml-formatter":
    case "graphql-formatter":
      // These require complex parsing - pass through
      return input

    case "json-yaml-converter": {
      // Try to detect and convert
      const trimmed = input.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        // JSON to simple YAML-ish format
        try {
          const data = JSON.parse(trimmed)
          return JSON.stringify(data, null, 2)
            .replace(/"/g, '')
            .replace(/,$/gm, '')
            .replace(/[{}[\]]/g, '')
        } catch {
          return input
        }
      }
      return input
    }

    case "csv-json-converter": {
      // Simple CSV to JSON
      const lines = input.trim().split('\n')
      if (lines.length < 2) return input
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => {
        const values = line.split(',')
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h] = values[i]?.trim() || '' })
        return obj
      })
      return JSON.stringify(rows, null, 2)
    }

    case "escape-unescape": {
      // HTML escape by default
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }

    case "byte-unit-converter": {
      const num = parseFloat(input.trim())
      if (isNaN(num)) return `Error: Invalid number\n\nInput:\n${input}`
      return `Bytes: ${num}\nKB: ${(num / 1000).toFixed(2)}\nMB: ${(num / 1000000).toFixed(4)}\nGB: ${(num / 1000000000).toFixed(6)}`
    }

    case "mock-data-generator": {
      // Generate a simple mock person
      const names = ['John', 'Jane', 'Bob', 'Alice']
      const domains = ['example.com', 'test.com']
      const name = names[Math.floor(Math.random() * names.length)]
      const email = `${name.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`
      return JSON.stringify({ id: crypto.randomUUID(), name, email }, null, 2)
    }

    case "jwt-generator": {
      // Generate a simple test JWT
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '')
      const payload = btoa(JSON.stringify({ sub: '123', name: input || 'Test', iat: Math.floor(Date.now() / 1000) })).replace(/=/g, '')
      return `${header}.${payload}.signature`
    }

    case "cron-builder":
    case "unix-permissions":
    case "http-status":
      // Interactive tools - pass through
      return input

    default:
      // Pass through for tools without pipeline processing
      return input
  }
}

export function PipelineBuilder() {
  const { activePipeline, addPipelineNode, removePipelineNode, updatePipelineNode, movePipelineNode, clearPipeline } =
    useWorkspace()

  const [isRunning, setIsRunning] = useState(false)
  const [runningStepIndex, setRunningStepIndex] = useState<number | null>(null)
  const [pipelineName, setPipelineName] = useState("My Pipeline")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddTool = useCallback(
    (toolId: string) => {
      addPipelineNode(toolId)
    },
    [addPipelineNode]
  )

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      removePipelineNode(nodeId)
    },
    [removePipelineNode]
  )

  const handleUpdateInput = useCallback(
    (nodeId: string, input: string) => {
      updatePipelineNode(nodeId, { input })
    },
    [updatePipelineNode]
  )

  const handleMoveNode = useCallback(
    (index: number, direction: "up" | "down") => {
      const toIndex = direction === "up" ? index - 1 : index + 1
      if (toIndex >= 0 && toIndex < activePipeline.nodes.length) {
        movePipelineNode(index, toIndex)
      }
    },
    [activePipeline.nodes.length, movePipelineNode]
  )

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      movePipelineNode(dragIndex, dragOverIndex)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, dragOverIndex, movePipelineNode])

  // Run a single step (and all steps from start up to this step if they haven't been run)
  const runFromStep = useCallback(async (targetIndex: number) => {
    if (activePipeline.nodes.length === 0) return

    setIsRunning(true)

    try {
      // Determine start index: find first step without output before targetIndex
      let startIndex = 0
      for (let i = 0; i <= targetIndex; i++) {
        if (i === 0) {
          startIndex = 0
          break
        }
        if (!activePipeline.nodes[i - 1]?.output) {
          startIndex = i - 1
          break
        }
        startIndex = i
      }

      let currentInput = startIndex === 0
        ? (activePipeline.nodes[0]?.input || "")
        : (activePipeline.nodes[startIndex - 1]?.output || "")

      for (let i = startIndex; i <= targetIndex; i++) {
        const node = activePipeline.nodes[i]
        setRunningStepIndex(i)

        if (i === 0) {
          currentInput = node.input || ""
        } else {
          updatePipelineNode(node.id, { input: currentInput })
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
        const output = processToolStep(node.toolId, currentInput)
        updatePipelineNode(node.id, { output })
        currentInput = output
      }
    } finally {
      setIsRunning(false)
      setRunningStepIndex(null)
    }
  }, [activePipeline.nodes, updatePipelineNode])

  // Run entire pipeline
  const runPipeline = useCallback(async () => {
    if (activePipeline.nodes.length === 0) return
    await runFromStep(activePipeline.nodes.length - 1)
  }, [activePipeline.nodes.length, runFromStep])

  // Check if a step can be run individually
  const canRunStep = useCallback((index: number): boolean => {
    if (isRunning) return false
    if (index === 0) return !!(activePipeline.nodes[0]?.input)
    // All previous steps must have output
    for (let i = 0; i < index; i++) {
      if (!activePipeline.nodes[i]?.output) return true // We'll run from the missing ones
    }
    return true
  }, [isRunning, activePipeline.nodes])

  const handleReset = useCallback(() => {
    activePipeline.nodes.forEach((node) => {
      updatePipelineNode(node.id, { output: undefined })
      if (node !== activePipeline.nodes[0]) {
        updatePipelineNode(node.id, { input: undefined })
      }
    })
  }, [activePipeline.nodes, updatePipelineNode])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Pipeline Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <Input
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="font-semibold text-lg border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isRunning}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={clearPipeline} disabled={isRunning}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={runPipeline}
              disabled={activePipeline.nodes.length === 0 || isRunning}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? "Running..." : "Run All"}
            </Button>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span>{activePipeline.nodes.length} steps</span>
          <span>•</span>
          <span>
            Tools:{" "}
            {activePipeline.nodes
              .map((n) => getToolById(n.toolId)?.title || n.toolId)
              .join(" → ") || "None"}
          </span>
        </div>
      </div>

      {/* Pipeline Canvas */}
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-2xl mx-auto">
          {activePipeline.nodes.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Build Your Pipeline</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Chain multiple tools together to create automated workflows. The output of each tool
                becomes the input for the next. You can run individual steps or the entire pipeline.
              </p>
              <AddToolDialog onAddTool={handleAddTool} />
            </div>
          ) : (
            <div className="space-y-2">
              {activePipeline.nodes.map((node, index) => (
                <PipelineNodeCard
                  key={node.id}
                  node={node}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === activePipeline.nodes.length - 1}
                  canRunStep={canRunStep(index)}
                  isRunningStep={runningStepIndex === index}
                  onRemove={() => handleRemoveNode(node.id)}
                  onUpdateInput={(input) => handleUpdateInput(node.id, input)}
                  onMoveUp={() => handleMoveNode(index, "up")}
                  onMoveDown={() => handleMoveNode(index, "down")}
                  onRunStep={() => runFromStep(index)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  isDragTarget={dragOverIndex === index && dragIndex !== index}
                />
              ))}

              {/* Add more tools */}
              <div className="pt-4">
                <AddToolDialog onAddTool={handleAddTool} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Example Pipelines */}
      {activePipeline.nodes.length === 0 && (
        <div className="border-t p-4">
          <h4 className="text-sm font-medium mb-3">Quick Start Templates</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addPipelineNode("json-formatter")
                addPipelineNode("base64-encode")
              }}
            >
              JSON → Base64
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addPipelineNode("base64-decode")
                addPipelineNode("json-formatter")
              }}
            >
              Base64 → JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addPipelineNode("url-decode")
                addPipelineNode("json-formatter")
              }}
            >
              URL Decode → JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addPipelineNode("minify-css")
                addPipelineNode("base64-encode")
              }}
            >
              CSS Minify → Base64
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
