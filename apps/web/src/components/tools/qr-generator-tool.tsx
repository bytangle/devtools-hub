import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import QRCodeStyling from "qr-code-styling"

export function QrGeneratorTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [text, setText] = useState(initialInput || savedState?.text || "https://example.com")
  const [qrType, setQrType] = useState(savedState?.qrType || "text")
  const [qrColor, setQrColor] = useState(savedState?.qrColor || "#000000")
  const [bgColor, setBgColor] = useState(savedState?.bgColor || "#ffffff")
  const [lastGeneratedData, setLastGeneratedData] = useState<string>("")
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const { toast } = useToast()

  // Update text when initialInput changes (for pipeline chaining)
  useEffect(() => {
    if (initialInput && initialInput !== text && !savedState?.text) {
      setText(initialInput)
    }
  }, [initialInput])

  useEffect(() => {
    setToolState(tabId, { text, qrType, qrColor, bgColor })
  }, [text, qrType, qrColor, bgColor, tabId, setToolState])

  useEffect(() => {
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 200,
        height: 200,
        type: "svg",
        data: text || "https://example.com",
        dotsOptions: { color: qrColor, type: "rounded" },
        backgroundOptions: { color: bgColor }
      })
    }
    
    if (qrRef.current && qrCodeRef.current) {
      qrRef.current.innerHTML = ''
      qrCodeRef.current.append(qrRef.current)
    }
  }, [])

  const generateQR = () => {
    if (!text.trim()) {
      toast({ title: "Please enter text", variant: "destructive" })
      return
    }

    let qrData = text
    if (qrType === "url" && !text.startsWith('http')) {
      qrData = 'https://' + text
    } else if (qrType === "email") {
      qrData = `mailto:${text}`
    } else if (qrType === "phone") {
      qrData = `tel:${text}`
    }

    qrCodeRef.current?.update({
      data: qrData,
      dotsOptions: { color: qrColor, type: "rounded" },
      backgroundOptions: { color: bgColor }
    })
    
    // Report the generated QR data to pipeline
    setLastGeneratedData(qrData)
    if (onOutputChange) {
      onOutputChange(qrData)
    }
    
    toast({ title: "QR Code generated!" })
  }

  const downloadQR = () => {
    qrCodeRef.current?.download({ name: "qrcode", extension: "png" })
  }

  return (
    <ToolShell
      icon={QrCode}
      title="QR Code Generator"
      actions={<>
        <Button size="sm" onClick={generateQR} className="bg-gradient-primary">
          <RefreshCw className="h-3 w-3 mr-1" />
          Generate
        </Button>
        <Button size="sm" onClick={downloadQR} variant="outline">
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </>}
    >
      <div className="space-y-2">
        <Label className="text-sm">Type</Label>
        <Select value={qrType} onValueChange={setQrType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Plain Text</SelectItem>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Content</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">QR Color</Label>
          <Input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Background</Label>
          <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="pb-3">
          <div className="text-sm font-semibold">Preview</div>
        </div>
        <div className="flex items-center justify-center">
          <div ref={qrRef} className="border rounded p-4 bg-white" />
        </div>
      </div>
    </ToolShell>
  )
}
