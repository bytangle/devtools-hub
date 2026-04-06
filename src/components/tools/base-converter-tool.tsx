import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Binary, Copy, ArrowUpDown } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Base = 2 | 8 | 10 | 16

const bases: { value: Base; label: string; prefix: string }[] = [
  { value: 2, label: 'Binary', prefix: '0b' },
  { value: 8, label: 'Octal', prefix: '0o' },
  { value: 10, label: 'Decimal', prefix: '' },
  { value: 16, label: 'Hexadecimal', prefix: '0x' },
]

function isValidForBase(value: string, base: Base): boolean {
  const cleaned = value.replace(/^0[bBoOxX]/, '').replace(/\s/g, '')
  if (!cleaned) return true
  
  const patterns: Record<Base, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^-?[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  }
  return patterns[base].test(cleaned)
}

function convert(value: string, fromBase: Base, toBase: Base): string {
  if (!value.trim()) return ''
  
  const cleaned = value.replace(/^0[bBoOxX]/, '').replace(/\s/g, '')
  if (!cleaned) return ''
  
  try {
    const decimal = parseInt(cleaned, fromBase)
    if (isNaN(decimal)) return 'Invalid'
    return decimal.toString(toBase).toUpperCase()
  } catch {
    return 'Invalid'
  }
}

function formatForDisplay(value: string, base: Base): string {
  if (!value || value === 'Invalid') return value
  
  // Add grouping for better readability
  switch (base) {
    case 2:
      // Group binary by 4 bits
      return value.replace(/(.{4})/g, '$1 ').trim()
    case 16:
      // Group hex by 2 characters
      return value.replace(/(.{2})/g, '$1 ').trim()
    default:
      return value
  }
}

export function BaseConverterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [fromBase, setFromBase] = useState<Base>(savedState?.fromBase as Base || 10)
  const [input, setInput] = useState(savedState?.input as string || initialInput || "255")
  
  const [binary, setBinary] = useState('')
  const [octal, setOctal] = useState('')
  const [decimal, setDecimal] = useState('')
  const [hex, setHex] = useState('')

  useEffect(() => {
    setToolState(tabId, { input, fromBase })
  }, [input, fromBase, tabId, setToolState])

  useEffect(() => {
    if (!isValidForBase(input, fromBase)) {
      setBinary('Invalid input')
      setOctal('Invalid input')
      setDecimal('Invalid input')
      setHex('Invalid input')
      return
    }
    
    setBinary(convert(input, fromBase, 2))
    setOctal(convert(input, fromBase, 8))
    setDecimal(convert(input, fromBase, 10))
    setHex(convert(input, fromBase, 16))
  }, [input, fromBase])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(decimal)
    }
  }, [decimal, onOutputChange])

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value.replace(/\s/g, ''))
    toast({ title: `${label} copied to clipboard` })
  }

  const isValid = isValidForBase(input, fromBase)

  const results = [
    { label: 'Binary', value: binary, prefix: '0b', base: 2 },
    { label: 'Octal', value: octal, prefix: '0o', base: 8 },
    { label: 'Decimal', value: decimal, prefix: '', base: 10 },
    { label: 'Hexadecimal', value: hex, prefix: '0x', base: 16 },
  ]

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Binary className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">base_converter</h2>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-2 block">Input Value</Label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a number..."
                className={`font-mono ${!isValid ? 'border-destructive' : ''}`}
              />
              {!isValid && (
                <p className="text-xs text-destructive mt-1">Invalid character for {bases.find(b => b.value === fromBase)?.label}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Input Base</Label>
              <Select value={fromBase.toString()} onValueChange={(v) => setFromBase(parseInt(v) as Base)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bases.map(b => (
                    <SelectItem key={b.value} value={b.value.toString()}>
                      {b.label} (base {b.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Conversions</Label>
          <div className="space-y-3">
            {results.map(r => (
              <div 
                key={r.label}
                className={`flex items-center justify-between p-3 rounded border ${r.base === fromBase ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium w-24">{r.label}</span>
                  <code className="font-mono text-sm flex-1 truncate">
                    <span className="text-muted-foreground">{r.prefix}</span>
                    {formatForDisplay(r.value, r.base as Base)}
                  </code>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyValue(r.value, r.label)}
                  disabled={r.value === 'Invalid input'}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Quick Reference</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Binary</div>
              <div className="font-mono text-sm">0-1</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Octal</div>
              <div className="font-mono text-sm">0-7</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Decimal</div>
              <div className="font-mono text-sm">0-9</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Hex</div>
              <div className="font-mono text-sm">0-9, A-F</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
