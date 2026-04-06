import { useState, useEffect, useMemo } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GitCompare, Zap, Copy, Download, Plus, Minus, Equal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type DiffLine = {
  type: 'same' | 'add' | 'remove'
  content: string
  lineNumOld?: number
  lineNumNew?: number
}

// Longest Common Subsequence (LCS) based diff algorithm
function computeDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')
  
  const m = lines1.length
  const n = lines2.length
  
  // Build LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  
  // Backtrack to build diff
  const result: DiffLine[] = []
  let i = m, j = n
  const stack: DiffLine[] = []
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      stack.push({ type: 'same', content: lines1[i - 1], lineNumOld: i, lineNumNew: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'add', content: lines2[j - 1], lineNumNew: j })
      j--
    } else if (i > 0) {
      stack.push({ type: 'remove', content: lines1[i - 1], lineNumOld: i })
      i--
    }
  }
  
  // Reverse to get correct order
  while (stack.length > 0) {
    result.push(stack.pop()!)
  }
  
  return result
}

export function DiffCheckerTool({ tabId }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [text1, setText1] = useState(savedState?.text1 as string || "")
  const [text2, setText2] = useState(savedState?.text2 as string || "")
  const [diff, setDiff] = useState<DiffLine[]>([])
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { text1, text2 })
  }, [text1, text2, tabId, setToolState])

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'add').length
    const removed = diff.filter(d => d.type === 'remove').length
    const unchanged = diff.filter(d => d.type === 'same').length
    return { added, removed, unchanged, total: diff.length }
  }, [diff])

  const compareDiff = () => {
    if (!text1 && !text2) {
      toast({ title: "Please enter text in both panels", variant: "destructive" })
      return
    }
    const result = computeDiff(text1, text2)
    setDiff(result)
    toast({ title: `Diff computed: ${result.length} lines analyzed` })
  }

  const copyUnifiedDiff = async () => {
    const unified = diff.map(d => {
      const prefix = d.type === 'add' ? '+' : d.type === 'remove' ? '-' : ' '
      return `${prefix} ${d.content}`
    }).join('\n')
    
    await navigator.clipboard.writeText(unified)
    toast({ title: "Unified diff copied to clipboard" })
  }

  const downloadDiff = () => {
    const unified = diff.map(d => {
      const prefix = d.type === 'add' ? '+' : d.type === 'remove' ? '-' : ' '
      return `${prefix} ${d.content}`
    }).join('\n')
    
    const blob = new Blob([unified], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diff.patch'
    a.click()
    URL.revokeObjectURL(url)
  }

  const swapTexts = () => {
    const temp = text1
    setText1(text2)
    setText2(temp)
    setDiff([])
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold font-mono">diff_checker</h2>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={compareDiff} className="bg-primary hover:bg-primary/90">
            <Zap className="h-3 w-3 mr-1" />
            Compare
          </Button>
          <Button size="sm" variant="outline" onClick={swapTexts}>
            Swap
          </Button>
          {diff.length > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={copyUnifiedDiff}>
                <Copy className="h-3 w-3 mr-1" />
                Copy Diff
              </Button>
              <Button size="sm" variant="outline" onClick={downloadDiff}>
                <Download className="h-3 w-3 mr-1" />
                Export .patch
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor 
          value={text1} 
          onChange={(v) => { setText1(v); setDiff([]) }}
          placeholder="Original text..." 
          language="text" 
          title="Original" 
        />
        <CodeEditor 
          value={text2} 
          onChange={(v) => { setText2(v); setDiff([]) }}
          placeholder="Modified text..." 
          language="text" 
          title="Modified" 
        />
      </div>

      {diff.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium font-mono">Diff Result</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600/30 bg-green-50 dark:bg-green-900/20">
                  <Plus className="h-3 w-3" />
                  {stats.added}
                </Badge>
                <Badge variant="outline" className="gap-1 text-red-600 border-red-600/30 bg-red-50 dark:bg-red-900/20">
                  <Minus className="h-3 w-3" />
                  {stats.removed}
                </Badge>
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <Equal className="h-3 w-3" />
                  {stats.unchanged}
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="h-[400px] rounded border">
              <div className="font-mono text-xs">
                {diff.map((d, i) => (
                  <div 
                    key={i} 
                    className={`flex border-b border-border/30 ${
                      d.type === 'add' 
                        ? 'bg-green-50 dark:bg-green-950/40' 
                        : d.type === 'remove' 
                        ? 'bg-red-50 dark:bg-red-950/40' 
                        : ''
                    }`}
                  >
                    {showLineNumbers && (
                      <>
                        <span className="w-10 px-2 py-1 text-right text-muted-foreground/50 border-r border-border/30 select-none">
                          {d.lineNumOld || ''}
                        </span>
                        <span className="w-10 px-2 py-1 text-right text-muted-foreground/50 border-r border-border/30 select-none">
                          {d.lineNumNew || ''}
                        </span>
                      </>
                    )}
                    <span className={`w-6 px-2 py-1 text-center font-bold select-none ${
                      d.type === 'add' 
                        ? 'text-green-600 dark:text-green-400' 
                        : d.type === 'remove' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-muted-foreground/30'
                    }`}>
                      {d.type === 'add' ? '+' : d.type === 'remove' ? '−' : ' '}
                    </span>
                    <span className={`flex-1 px-2 py-1 whitespace-pre ${
                      d.type === 'add' 
                        ? 'text-green-800 dark:text-green-200' 
                        : d.type === 'remove' 
                        ? 'text-red-800 dark:text-red-200' 
                        : 'text-foreground'
                    }`}>
                      {d.content || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
