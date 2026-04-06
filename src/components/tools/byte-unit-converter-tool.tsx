import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HardDrive, Copy, ArrowUpDown } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type ByteUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB'

const decimalUnits: { unit: ByteUnit; bytes: number; label: string }[] = [
  { unit: 'B', bytes: 1, label: 'Bytes' },
  { unit: 'KB', bytes: 1000, label: 'Kilobytes' },
  { unit: 'MB', bytes: 1000 ** 2, label: 'Megabytes' },
  { unit: 'GB', bytes: 1000 ** 3, label: 'Gigabytes' },
  { unit: 'TB', bytes: 1000 ** 4, label: 'Terabytes' },
  { unit: 'PB', bytes: 1000 ** 5, label: 'Petabytes' },
]

const binaryUnits: { unit: ByteUnit; bytes: number; label: string }[] = [
  { unit: 'B', bytes: 1, label: 'Bytes' },
  { unit: 'KiB', bytes: 1024, label: 'Kibibytes' },
  { unit: 'MiB', bytes: 1024 ** 2, label: 'Mebibytes' },
  { unit: 'GiB', bytes: 1024 ** 3, label: 'Gibibytes' },
  { unit: 'TiB', bytes: 1024 ** 4, label: 'Tebibytes' },
  { unit: 'PiB', bytes: 1024 ** 5, label: 'Pebibytes' },
]

function formatNumber(num: number, precision: number = 6): string {
  if (num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  if (Number.isInteger(num)) return num.toLocaleString()
  return num.toPrecision(precision).replace(/\.?0+$/, '')
}

export function ByteUnitConverterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [value, setValue] = useState(savedState?.value as string || '1024')
  const [fromUnit, setFromUnit] = useState<ByteUnit>(savedState?.fromUnit as ByteUnit || 'MB')
  const [useBinary, setUseBinary] = useState(savedState?.useBinary as boolean || false)

  const units = useBinary ? binaryUnits : decimalUnits

  useEffect(() => {
    setToolState(tabId, { value, fromUnit, useBinary })
  }, [value, fromUnit, useBinary, tabId, setToolState])

  const bytes = useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num)) return 0
    const unitInfo = units.find(u => u.unit === fromUnit) || units[0]
    return num * unitInfo.bytes
  }, [value, fromUnit, units])

  const conversions = useMemo(() => {
    return units.map(u => ({
      ...u,
      value: bytes / u.bytes
    }))
  }, [bytes, units])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(bytes.toString())
    }
  }, [bytes, onOutputChange])

  const copyValue = async (val: number, unit: string) => {
    await navigator.clipboard.writeText(formatNumber(val))
    toast({ title: `${formatNumber(val)} ${unit} copied` })
  }

  const commonSizes = [
    { label: '1 KB', value: '1', unit: 'KB' as ByteUnit },
    { label: '1 MB', value: '1', unit: 'MB' as ByteUnit },
    { label: '1 GB', value: '1', unit: 'GB' as ByteUnit },
    { label: '1 TB', value: '1', unit: 'TB' as ByteUnit },
    { label: '4 GB (DVD)', value: '4.7', unit: 'GB' as ByteUnit },
    { label: '700 MB (CD)', value: '700', unit: 'MB' as ByteUnit },
    { label: '25 GB (Blu-ray)', value: '25', unit: 'GB' as ByteUnit },
    { label: '128 GB (SSD)', value: '128', unit: 'GB' as ByteUnit },
  ]

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold font-mono">byte_unit_converter</h2>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Binary (1024)</Label>
          <Switch checked={useBinary} onCheckedChange={setUseBinary} />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Value</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter a number..."
                className="font-mono text-lg"
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Unit</Label>
              <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as ByteUnit)}>
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.unit} value={u.unit}>
                      {u.unit} ({u.label})
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
          <div className="space-y-2">
            {conversions.map(conv => (
              <div 
                key={conv.unit}
                className={`flex items-center justify-between p-3 rounded border ${
                  conv.unit === fromUnit ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{conv.unit}</span>
                  <span className="text-xs text-muted-foreground w-24">{conv.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm">{formatNumber(conv.value)}</code>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => copyValue(conv.value, conv.unit)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Common Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {commonSizes.map(size => (
              <Button
                key={size.label}
                size="sm"
                variant="outline"
                onClick={() => {
                  setValue(size.value)
                  setFromUnit(size.unit)
                }}
                className="text-xs"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Reference</Label>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded bg-muted/30">
              <div className="font-medium mb-2">Decimal (SI)</div>
              <div className="space-y-1 text-muted-foreground">
                <div>1 KB = 1,000 B</div>
                <div>1 MB = 1,000 KB</div>
                <div>1 GB = 1,000 MB</div>
                <div>1 TB = 1,000 GB</div>
              </div>
            </div>
            <div className="p-3 rounded bg-muted/30">
              <div className="font-medium mb-2">Binary (IEC)</div>
              <div className="space-y-1 text-muted-foreground">
                <div>1 KiB = 1,024 B</div>
                <div>1 MiB = 1,024 KiB</div>
                <div>1 GiB = 1,024 MiB</div>
                <div>1 TiB = 1,024 GiB</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
