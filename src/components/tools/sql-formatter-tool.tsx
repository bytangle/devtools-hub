import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Database, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function SqlFormatterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [input, setInput] = useState(savedState?.input || initialInput || "")
  const [output, setOutput] = useState(savedState?.output || "")
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { input, output })
  }, [input, output, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && output) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const formatSql = () => {
    if (!input.trim()) {
      setError("Please enter SQL to format")
      return
    }

    try {
      const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN']
      
      let formatted = input.toUpperCase()
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        formatted = formatted.replace(regex, `\n${keyword}`)
      })
      
      formatted = formatted
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n')
        .replace(/,/g, ',\n  ')
      
      setOutput(formatted)
      setError("")
      toast({ title: "SQL formatted" })
    } catch (err) {
      setError("Error formatting SQL")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">SQL Formatter</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          <Button size="sm" onClick={formatSql} className="bg-gradient-primary">
            <Zap className="h-3 w-3 mr-1" />
            Format SQL
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor value={input} onChange={setInput} placeholder="SELECT * FROM..." language="sql" title="Input SQL" error={error} />
        <CodeEditor value={output} onChange={() => {}} placeholder="Formatted..." language="sql" title="Formatted SQL" readOnly />
      </div>
    </div>
  )
}
