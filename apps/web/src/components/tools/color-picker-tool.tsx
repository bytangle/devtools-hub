import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Palette, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function ColorPickerTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [color, setColor] = useState(savedState?.color || "#6366f1")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { color })
  }, [color, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(color)
    }
  }, [color, onOutputChange])

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null
    
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const rgb = hexToRgb(color)
  const hsl = hexToHsl(color)
  
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ""
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ""

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!" })
  }

  return (
    <ToolShell
      icon={Palette}
      title="Color Picker"
      actions={<>
        <Button size="sm" variant="outline" onClick={() => copyToClipboard(color)}>
          <Copy className="h-4 w-4 mr-1" /> Copy HEX
        </Button>
      </>}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-20 cursor-pointer rounded border-0"
          />
          <div
            className="w-20 h-20 rounded border shadow-inner"
            style={{ backgroundColor: color }}
          />
        </div>

        <div>
          <Label className="text-sm">HEX</Label>
          <div className="flex gap-2">
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
            <Button size="icon" variant="outline" onClick={() => copyToClipboard(color)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <Label className="text-sm font-semibold">Color Values</Label>
          <div>
            <Label className="text-sm">RGB</Label>
            <div className="flex gap-2">
              <Input value={rgbStr} readOnly className="font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(rgbStr)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-sm">HSL</Label>
            <div className="flex gap-2">
              <Input value={hslStr} readOnly className="font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(hslStr)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {rgb && (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 bg-muted rounded">
                <div className="text-muted-foreground text-xs">R</div>
                <div className="font-mono">{rgb.r}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-muted-foreground text-xs">G</div>
                <div className="font-mono">{rgb.g}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-muted-foreground text-xs">B</div>
                <div className="font-mono">{rgb.b}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  )
}
