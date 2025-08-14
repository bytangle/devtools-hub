import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Download, Upload, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  language?: string
  readOnly?: boolean
  title?: string
  error?: string
}

function SyntaxHighlighter({ content, language }: { content: string; language: string }) {
  const renderHighlightedContent = () => {
    const lines = content.split('\n')
    
    const highlightLine = (line: string) => {
      const tokens: { text: string; className?: string }[] = []
      let remaining = line
      
      switch (language) {
        case 'json':
          // String keys (property names)
          remaining = remaining.replace(/("([^"\\]|\\.)*")(\s*:)/g, (match, str, _, colon) => {
            tokens.push({ text: str, className: 'text-blue-400' }, { text: colon })
            return '###PROCESSED###'
          })
          // String values
          remaining = remaining.replace(/("([^"\\]|\\.)*")(\s*[,\]\}])/g, (match, str, _, punct) => {
            tokens.push({ text: str, className: 'text-green-400' }, { text: punct })
            return '###PROCESSED###'
          })
          // Booleans and null
          remaining = remaining.replace(/\b(true|false|null)\b/g, (match) => {
            tokens.push({ text: match, className: 'text-purple-400' })
            return '###PROCESSED###'
          })
          // Numbers
          remaining = remaining.replace(/\b(\d+\.?\d*)\b/g, (match) => {
            tokens.push({ text: match, className: 'text-orange-400' })
            return '###PROCESSED###'
          })
          // Brackets and braces
          remaining = remaining.replace(/([{}[\]])/g, (match) => {
            tokens.push({ text: match, className: 'text-gray-400' })
            return '###PROCESSED###'
          })
          break
          
        case 'html':
        case 'xml':
          const escapedLine = line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
          // Tags
          remaining = escapedLine.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)(.*?)(&gt;)/g, (match, open, tag, attrs, close) => {
            tokens.push(
              { text: open, className: 'text-blue-400' },
              { text: tag, className: 'text-red-400' },
              { text: attrs, className: 'text-green-400' },
              { text: close, className: 'text-blue-400' }
            )
            return '###PROCESSED###'
          })
          // Attributes
          remaining = remaining.replace(/(\s)([a-zA-Z-]+)(=)(".*?")/g, (match, space, attr, eq, value) => {
            tokens.push(
              { text: space },
              { text: attr, className: 'text-purple-400' },
              { text: eq, className: 'text-gray-400' },
              { text: value, className: 'text-green-400' }
            )
            return '###PROCESSED###'
          })
          break
          
        case 'css':
          // Properties
          remaining = remaining.replace(/([a-zA-Z-]+)(\s*)(:)/g, (match, prop, space, colon) => {
            tokens.push(
              { text: prop, className: 'text-blue-400' },
              { text: space },
              { text: colon, className: 'text-gray-400' }
            )
            return '###PROCESSED###'
          })
          // Values
          remaining = remaining.replace(/(:)(\s*)([^;{}]+)(;)/g, (match, colon, space, value, semi) => {
            tokens.push(
              { text: colon },
              { text: space },
              { text: value, className: 'text-green-400' },
              { text: semi, className: 'text-gray-400' }
            )
            return '###PROCESSED###'
          })
          // Selectors
          remaining = remaining.replace(/([.#][a-zA-Z0-9_-]+)/g, (match) => {
            tokens.push({ text: match, className: 'text-purple-400' })
            return '###PROCESSED###'
          })
          // Braces
          remaining = remaining.replace(/([{}])/g, (match) => {
            tokens.push({ text: match, className: 'text-gray-400' })
            return '###PROCESSED###'
          })
          break
          
        case 'sql':
          // Keywords
          const keywords = /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|DROP|ALTER|AND|OR|NOT|IN|EXISTS|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|UNION|DISTINCT|COUNT|SUM|AVG|MAX|MIN|NULL|TRUE|FALSE)\b/gi
          remaining = remaining.replace(keywords, (match) => {
            tokens.push({ text: match, className: 'text-blue-400' })
            return '###PROCESSED###'
          })
          // Strings
          remaining = remaining.replace(/('([^'\\]|\\.)*')/g, (match) => {
            tokens.push({ text: match, className: 'text-green-400' })
            return '###PROCESSED###'
          })
          // Numbers
          remaining = remaining.replace(/\b(\d+\.?\d*)\b/g, (match) => {
            tokens.push({ text: match, className: 'text-orange-400' })
            return '###PROCESSED###'
          })
          break
      }
      
      // Add remaining text
      const parts = remaining.split('###PROCESSED###')
      const result: JSX.Element[] = []
      let tokenIndex = 0
      
      parts.forEach((part, partIndex) => {
        if (part) {
          result.push(<span key={`part-${partIndex}`}>{part}</span>)
        }
        if (tokenIndex < tokens.length) {
          const token = tokens[tokenIndex]
          result.push(
            <span key={`token-${tokenIndex}`} className={token.className}>
              {token.text}
            </span>
          )
          tokenIndex++
        }
      })
      
      return result
    }
    
    return lines.map((line, index) => (
      <div key={index}>
        {highlightLine(line)}
      </div>
    ))
  }

  return (
    <pre className="w-full h-80 p-4 bg-background overflow-auto font-mono text-sm whitespace-pre-wrap break-words">
      {renderHighlightedContent()}
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
  error
}: CodeEditorProps) {
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied successfully",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-${language}.${language === 'json' ? 'json' : 'txt'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded",
      description: "File has been downloaded successfully",
    })
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

  const handleClear = () => {
    onChange("")
  }

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/20">
        <h3 className="text-sm font-medium text-foreground">
          {title || `${language.toUpperCase()} Editor`}
        </h3>
        <div className="flex items-center space-x-1">
          {!readOnly && (
            <>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <label>
                <Button variant="ghost" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".json,.txt,.xml,.html,.css,.js"
                  onChange={handleFileUpload}
                />
              </label>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!value}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!value}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        {readOnly && value ? (
          <SyntaxHighlighter content={value} language={language} />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full h-80 p-4 bg-background border-0 resize-none font-mono text-sm focus:outline-none focus:ring-0 ${
              error ? 'border-destructive' : ''
            }`}
            spellCheck={false}
          />
        )}
        {error && (
          <div className="absolute bottom-2 left-2 right-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    </Card>
  )
}