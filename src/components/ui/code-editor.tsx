import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Download, Upload, RotateCcw, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  language?: string
  readOnly?: boolean
  title?: string
  error?: string
  className?: string
  rows?: number
}

function SyntaxHighlighter({ content, language }: { content: string; language: string }) {
  const tokenizeLine = (line: string): JSX.Element[] => {
    // Collect all token spans with their positions
    const spans: { start: number; end: number; text: string; className?: string }[] = []

    const addMatches = (regex: RegExp, className?: string) => {
      for (const m of line.matchAll(regex)) {
        if (m.index == null) continue
        spans.push({ start: m.index, end: m.index + m[0].length, text: m[0], className })
      }
    }

    // Collect groups from a regex where each capture group gets its own class
    const addGroupMatches = (regex: RegExp, classNames: (string | undefined)[]) => {
      for (const m of line.matchAll(regex)) {
        if (m.index == null) continue
        let pos = m.index
        for (let i = 1; i < m.length && i - 1 < classNames.length; i++) {
          if (m[i] != null) {
            spans.push({ start: pos, end: pos + m[i].length, text: m[i], className: classNames[i - 1] })
            pos += m[i].length
          }
        }
      }
    }

    switch (language) {
      case 'json':
        // Property keys + colon
        addGroupMatches(/("(?:[^"\\]|\\.)*")(\s*:)/g, ['text-blue-400', 'text-gray-400'])
        // String values (standalone — not followed by colon)
        addMatches(/(?<=:\s*)("(?:[^"\\]|\\.)*")/g, 'text-green-400')
        // String values in arrays
        addMatches(/(?<=[\[,]\s*)("(?:[^"\\]|\\.)*")/g, 'text-green-400')
        // Booleans and null
        addMatches(/\b(true|false|null)\b/g, 'text-purple-400')
        // Numbers
        addMatches(/(?<=:\s*)-?\d+\.?\d*(?=\s*[,\}\]\n])/g, 'text-orange-400')
        // Brackets
        addMatches(/[{}\[\]]/g, 'text-gray-400')
        break

      case 'css':
        // Selectors (class, id, element, pseudo)
        addMatches(/^(\s*)([.#]?[a-zA-Z][a-zA-Z0-9_-]*(?:\s*,\s*[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*)(?=\s*\{)/gm, 'text-purple-400')
        // Property: value pairs
        addGroupMatches(/([a-zA-Z-]+)(\s*:\s*)([^;{}]+)(;?)/g, ['text-blue-400', 'text-gray-400', 'text-green-400', 'text-gray-400'])
        // Braces
        addMatches(/[{}]/g, 'text-gray-400')
        break

      case 'html':
      case 'xml':
        // Tags: <tagname ... >
        addGroupMatches(/(<\/?)([a-zA-Z][a-zA-Z0-9]*)/g, ['text-blue-400', 'text-red-400'])
        // Closing >
        addMatches(/\/?>/g, 'text-blue-400')
        // Attribute names
        addMatches(/\s([a-zA-Z-]+)(?==)/g, 'text-purple-400')
        // Attribute values
        addMatches(/"[^"]*"|'[^']*'/g, 'text-green-400')
        break

      case 'sql':
        addMatches(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|DROP|ALTER|AND|OR|NOT|IN|EXISTS|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|UNION|DISTINCT|COUNT|SUM|AVG|MAX|MIN|NULL|TRUE|FALSE|SET|INTO|VALUES|IS|CASE|WHEN|THEN|ELSE|END|ASC|DESC|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|WITH)\b/gi, 'text-blue-400')
        addMatches(/'(?:[^'\\]|\\.)*'/g, 'text-green-400')
        addMatches(/\b\d+\.?\d*\b/g, 'text-orange-400')
        addMatches(/--.*$/gm, 'text-gray-500')
        break

      case 'yaml':
        // Keys
        addMatches(/^(\s*[a-zA-Z0-9_.-]+)(?=\s*:)/gm, 'text-blue-400')
        // Strings
        addMatches(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 'text-green-400')
        // Booleans/null
        addMatches(/\b(true|false|null|yes|no)\b/gi, 'text-purple-400')
        // Numbers
        addMatches(/(?<=:\s*)-?\d+\.?\d*\b/g, 'text-orange-400')
        // Comments
        addMatches(/#.*$/gm, 'text-gray-500')
        break

      case 'graphql':
        addMatches(/\b(query|mutation|subscription|fragment|on|type|input|enum|interface|union|scalar|schema|extend|implements|directive)\b/g, 'text-blue-400')
        addMatches(/"(?:[^"\\]|\\.)*"/g, 'text-green-400')
        addMatches(/\b\d+\.?\d*\b/g, 'text-orange-400')
        addMatches(/[{}()\[\]]/g, 'text-gray-400')
        addMatches(/#.*$/gm, 'text-gray-500')
        break
    }

    // Sort spans by start position; remove overlapping
    spans.sort((a, b) => a.start - b.start || b.end - a.end)
    const merged: typeof spans = []
    for (const s of spans) {
      if (merged.length && s.start < merged[merged.length - 1].end) continue // skip overlapping
      merged.push(s)
    }

    // Build JSX elements by interleaving plain text and colored spans
    const result: JSX.Element[] = []
    let cursor = 0
    merged.forEach((span, i) => {
      if (span.start > cursor) {
        result.push(<span key={`t${i}`}>{line.slice(cursor, span.start)}</span>)
      }
      result.push(<span key={`s${i}`} className={span.className}>{span.text}</span>)
      cursor = span.end
    })
    if (cursor < line.length) {
      result.push(<span key="end">{line.slice(cursor)}</span>)
    }
    if (result.length === 0) {
      result.push(<span key="empty">{line || '\n'}</span>)
    }
    return result
  }

  return (
    <pre className="w-full h-full min-h-[18rem] p-3 bg-transparent overflow-auto font-mono text-sm whitespace-pre-wrap break-words text-foreground/90">
      {content.split('\n').map((line, index) => (
        <div key={index}>{tokenizeLine(line)}</div>
      ))}
    </pre>
  )
}

export function CodeEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your code here...",
  language = "json",
  readOnly = false,
  title,
  error,
  className,
  rows,
}: CodeEditorProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast({ title: "Copied to clipboard" })
    } catch {
      toast({ title: "Copy failed", variant: "destructive" })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const ext = language === 'json' ? 'json' : language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'sql' ? 'sql' : 'txt'
    a.download = `output.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Downloaded" })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onChange(content)
      }
      reader.readAsText(file)
    }
  }

  const stats = value ? `${value.length.toLocaleString()} chars · ${value.split('\n').length} lines` : ''

  return (
    <div className={cn(
      "flex flex-col rounded-lg border overflow-hidden",
      readOnly ? "border-primary/15 bg-card" : "border-border/60 bg-card",
      error && "border-red-500/40",
      className,
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-1.5 border-b",
        readOnly ? "bg-primary/[0.03]" : "bg-muted/30",
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            readOnly ? "text-primary/70" : "text-muted-foreground",
          )}>
            {title || (readOnly ? "Output" : "Input")}
          </span>
          {language && language !== "text" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {language.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {!readOnly && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange("")} title="Clear">
                <RotateCcw className="h-3 w-3" />
              </Button>
              <label>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild title="Upload">
                  <span><Upload className="h-3 w-3" /></span>
                </Button>
                <input type="file" className="hidden" accept=".json,.txt,.xml,.html,.css,.js,.sql,.yaml,.yml,.csv,.md" onChange={handleFileUpload} />
              </label>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", copied && "text-emerald-500")}
            onClick={handleCopy}
            disabled={!value}
            title="Copy"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload} disabled={!value} title="Download">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Editor body */}
      <div className="relative flex-1 min-h-0">
        {readOnly && value ? (
          <SyntaxHighlighter content={value} language={language} />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={rows}
            className={cn(
              "w-full p-3 bg-transparent border-0 resize-none font-mono text-sm focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50",
              rows ? "" : "h-full min-h-[18rem]",
            )}
            spellCheck={false}
          />
        )}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-red-500/10 border-t border-red-500/20 text-[11px] text-red-400 font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {stats && (
        <div className="px-3 py-1 border-t bg-muted/20 flex items-center justify-end">
          <span className="text-[10px] font-mono text-muted-foreground">{stats}</span>
        </div>
      )}
    </div>
  )
}