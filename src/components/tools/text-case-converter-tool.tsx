import { useState, useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Type, Copy, ArrowRight } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

type CaseType = 
  | 'lower' | 'upper' | 'title' | 'sentence'
  | 'camel' | 'pascal' | 'snake' | 'kebab' 
  | 'constant' | 'dot' | 'path' | 'header'

const caseTypes: { id: CaseType; label: string; example: string }[] = [
  { id: 'lower', label: 'lowercase', example: 'hello world' },
  { id: 'upper', label: 'UPPERCASE', example: 'HELLO WORLD' },
  { id: 'title', label: 'Title Case', example: 'Hello World' },
  { id: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { id: 'camel', label: 'camelCase', example: 'helloWorld' },
  { id: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { id: 'snake', label: 'snake_case', example: 'hello_world' },
  { id: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { id: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { id: 'dot', label: 'dot.case', example: 'hello.world' },
  { id: 'path', label: 'path/case', example: 'hello/world' },
  { id: 'header', label: 'Header-Case', example: 'Hello-World' },
]

// Split text into words (handles all common separators)
function toWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser → XML Parser
    .replace(/[_\-./\\]+/g, ' ') // separators to space
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
}

function convertCase(text: string, caseType: CaseType): string {
  const words = toWords(text)
  if (words.length === 0) return ''
  
  switch (caseType) {
    case 'lower':
      return words.join(' ').toLowerCase()
    case 'upper':
      return words.join(' ').toUpperCase()
    case 'title':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    case 'sentence':
      return words.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(' ')
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    case 'pascal':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_')
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-')
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_')
    case 'dot':
      return words.map(w => w.toLowerCase()).join('.')
    case 'path':
      return words.map(w => w.toLowerCase()).join('/')
    case 'header':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-')
    default:
      return text
  }
}

export function TextCaseConverterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [input, setInput] = useState(initialInput || savedState?.input as string || "hello world example")
  const [selectedCase, setSelectedCase] = useState<CaseType>(savedState?.selectedCase as CaseType || 'camel')

  useEffect(() => {
    setToolState(tabId, { input, selectedCase })
  }, [input, selectedCase, tabId, setToolState])

  const conversions = useMemo(() => {
    return caseTypes.map(ct => ({
      ...ct,
      result: convertCase(input, ct.id)
    }))
  }, [input])

  const selectedResult = useMemo(() => convertCase(input, selectedCase), [input, selectedCase])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(selectedResult)
    }
  }, [selectedResult, onOutputChange])

  const copyResult = async (result: string) => {
    await navigator.clipboard.writeText(result)
    toast({ title: "Copied to clipboard" })
  }

  return (
    <ToolShell
      icon={Type}
      title="Text Case Converter"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Input Text</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to convert..."
            className="font-mono text-sm min-h-[100px]"
          />
        </div>

        <div className="rounded-lg border p-4">
          <label className="text-sm font-medium mb-3 block">Select Output Case</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {caseTypes.map(ct => (
              <Button
                key={ct.id}
                variant={selectedCase === ct.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCase(ct.id)}
                className="justify-start font-mono text-xs"
              >
                {ct.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Selected Output</label>
            <Badge variant="secondary" className="font-mono text-xs">{selectedCase}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded border font-mono text-sm break-all">
              {selectedResult}
            </code>
            <Button size="sm" variant="outline" onClick={() => copyResult(selectedResult)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <label className="text-sm font-medium mb-3 block">All Conversions</label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {conversions.map(conv => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-2 rounded border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{conv.label}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <code className="font-mono text-sm truncate">{conv.result}</code>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copyResult(conv.result)} className="flex-shrink-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  )
}
