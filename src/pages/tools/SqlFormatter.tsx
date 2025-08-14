import { useState } from "react"
import { Header } from "@/components/layout/header"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Zap, MinusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SqlFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const formatSql = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some SQL to format")
        setOutput("")
        return
      }

      let formatted = input
        .replace(/\s+/g, ' ')
        .replace(/,/g, ',\n  ')
        .replace(/\bSELECT\b/gi, 'SELECT\n  ')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
        .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
        .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
        .replace(/\bON\b/gi, '\n  ON')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bHAVING\b/gi, '\nHAVING')
        .replace(/\bAND\b/gi, '\n  AND')
        .replace(/\bOR\b/gi, '\n  OR')
        .replace(/\bINSERT INTO\b/gi, 'INSERT INTO')
        .replace(/\bVALUES\b/gi, '\nVALUES')
        .replace(/\bUPDATE\b/gi, 'UPDATE')
        .replace(/\bSET\b/gi, '\nSET\n  ')
        .replace(/\bDELETE FROM\b/gi, 'DELETE FROM')
        .trim()

      setOutput(formatted)
      setError("")
      
      toast({
        title: "SQL formatted successfully",
        description: "Your SQL has been formatted with proper structure",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error formatting SQL")
      setOutput("")
    }
  }

  const minifySql = () => {
    try {
      if (!input.trim()) {
        setError("Please enter some SQL to minify")
        setOutput("")
        return
      }

      const minified = input
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*=\s*/g, '=')
        .trim()
      
      setOutput(minified)
      setError("")
      
      toast({
        title: "SQL minified successfully",
        description: "Your SQL has been compressed",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error minifying SQL")
      setOutput("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">SQL Formatter & Beautifier</h1>
            </div>
            <p className="text-muted-foreground">
              Format and beautify your SQL queries with proper structure and indentation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">All SQL Dialects</Badge>
              <Badge variant="secondary">Instant</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={formatSql} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Format SQL
                </Button>
                <Button onClick={minifySql} variant="outline">
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Minify
                </Button>
                <Button onClick={() => { setInput(""); setOutput(""); setError("") }} variant="outline">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder='SELECT id,name,email FROM users WHERE status=1 AND created_at>="2024-01-01" ORDER BY name'
              language="sql"
              title="Input SQL"
              error={error}
            />
            
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Formatted SQL will appear here..."
              language="sql"
              title="Formatted Output"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>✓ SQL query formatting</div>
                <div>✓ Keyword capitalization</div>
                <div>✓ Proper indentation</div>
                <div>✓ Query minification</div>
                <div>✓ Copy to clipboard</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SQL Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Use uppercase for SQL keywords</div>
                <div>• Proper table and column naming</div>
                <div>• Use aliases for readability</div>
                <div>• Comment complex queries</div>
                <div>• Optimize for performance</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Dialects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• MySQL</div>
                <div>• PostgreSQL</div>
                <div>• SQLite</div>
                <div>• SQL Server</div>
                <div>• Oracle</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}