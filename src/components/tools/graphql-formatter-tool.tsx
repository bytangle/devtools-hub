import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Braces, Zap, Trash2, MinusCircle, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// GraphQL formatter
function formatGraphQL(input: string, indentSize: number = 2): { formatted: string; error: string | null } {
  try {
    const space = ' '.repeat(indentSize)
    let result = ''
    let indent = 0
    let inString = false
    let stringChar = ''
    let prev = ''
    
    // Normalize whitespace
    const normalized = input
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i]
      const next = normalized[i + 1] || ''
      
      // Handle strings
      if ((char === '"' || char === "'") && prev !== '\\') {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
        }
        result += char
        prev = char
        continue
      }
      
      if (inString) {
        result += char
        prev = char
        continue
      }
      
      // Handle comments
      if (char === '#') {
        // Find end of line
        let comment = '#'
        let j = i + 1
        while (j < normalized.length && normalized[j] !== '\n') {
          comment += normalized[j]
          j++
        }
        result += comment
        i = j - 1
        prev = normalized[j - 1]
        continue
      }
      
      // Handle opening braces/parens
      if (char === '{' || char === '(') {
        result = result.trimEnd() + ' ' + char
        indent++
        result += '\n' + space.repeat(indent)
        prev = char
        continue
      }
      
      // Handle closing braces/parens
      if (char === '}' || char === ')') {
        indent = Math.max(0, indent - 1)
        result = result.trimEnd() + '\n' + space.repeat(indent) + char
        prev = char
        continue
      }
      
      // Handle colons
      if (char === ':') {
        result = result.trimEnd() + ': '
        prev = char
        continue
      }
      
      // Handle commas
      if (char === ',') {
        result = result.trimEnd() + ','
        prev = char
        continue
      }
      
      // Handle newlines
      if (char === '\n') {
        const trimmed = result.trimEnd()
        if (!trimmed.endsWith('\n') && trimmed.length > 0) {
          result = trimmed + '\n' + space.repeat(indent)
        }
        prev = char
        continue
      }
      
      // Handle whitespace
      if (char === ' ' || char === '\t') {
        if (prev !== ' ' && prev !== '\n' && prev !== '(' && prev !== '{') {
          result += ' '
        }
        prev = ' '
        continue
      }
      
      result += char
      prev = char
    }
    
    // Clean up extra whitespace
    result = result
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    
    return { formatted: result, error: null }
  } catch (e) {
    return { formatted: '', error: e instanceof Error ? e.message : 'Format error' }
  }
}

function minifyGraphQL(input: string): string {
  let result = ''
  let inString = false
  let stringChar = ''
  let prev = ''
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    
    // Handle strings
    if ((char === '"' || char === "'") && prev !== '\\') {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      result += char
      prev = char
      continue
    }
    
    if (inString) {
      result += char
      prev = char
      continue
    }
    
    // Skip comments
    if (char === '#') {
      while (i < input.length && input[i] !== '\n') i++
      continue
    }
    
    // Handle whitespace
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      // Add single space only when needed
      if (result.length > 0 && 
          !/[{(,:\s]$/.test(result) && 
          !/^[}),:]/.test(input[i + 1] || '')) {
        if (prev !== ' ') {
          result += ' '
          prev = ' '
        }
      }
      continue
    }
    
    result += char
    prev = char
  }
  
  return result.trim()
}

export function GraphqlFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [input, setInput] = useState(initialInput || savedState?.input as string || `query GetUser($id: ID!) {
  user(id: $id) { id name email posts { id title createdAt } friends { id name } } }

mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) { id title content author { id name } } }

fragment UserFields on User { id name email avatar }`)
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
    const { formatted, error: formatError } = formatGraphQL(input, parseInt(indentSize))
    
    if (formatError) {
      setError(formatError)
      setOutput('')
      toast({ title: "Format error", description: formatError, variant: "destructive" })
      return
    }
    
    setOutput(formatted)
    setError(null)
    toast({ title: "GraphQL formatted successfully" })
  }

  const minifyInput = () => {
    try {
      const minified = minifyGraphQL(input)
      setOutput(minified)
      setError(null)
      toast({ title: "GraphQL minified successfully" })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Minify error')
      toast({ title: "Minification failed", variant: "destructive" })
    }
  }



  return (
    <TooltipProvider>
      <ToolShell
        icon={Braces}
        title="GraphQL Formatter"
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
              Invalid GraphQL
            </span>
          )}
          {output && !error && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid GraphQL
            </span>
          )}
        </>}
      >
        <TwoPanelLayout
          input={
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Paste GraphQL query here..."
              language="graphql"
              title="Input"
            />
          }
          output={
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Formatted output..."
              language="graphql"
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
              <TooltipContent side="right"><p>Format GraphQL</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={minifyInput} className="h-7 w-7 rounded-full">
                  <MinusCircle className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Minify GraphQL</p></TooltipContent>
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
