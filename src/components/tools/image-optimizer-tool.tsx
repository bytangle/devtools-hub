import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Image, Upload, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"

export function ImageOptimizerTool({ tabId }: ToolComponentProps) {
  const [image, setImage] = useState<string | null>(null)
  const [optimized, setOptimized] = useState<string | null>(null)
  const [quality, setQuality] = useState([80])
  const [originalSize, setOriginalSize] = useState(0)
  const [newSize, setNewSize] = useState(0)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOriginalSize(file.size)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setImage(event.target?.result as string)
      setOptimized(null)
    }
    reader.readAsDataURL(file)
  }

  const optimizeImage = () => {
    if (!image) return

    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
      
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality[0] / 100)
      setOptimized(optimizedDataUrl)
      
      // Calculate new size
      const base64Length = optimizedDataUrl.split(',')[1]?.length || 0
      const newBytes = Math.round((base64Length * 3) / 4)
      setNewSize(newBytes)
      
      toast({ title: "Image optimized!" })
    }
    img.src = image
  }

  const downloadOptimized = () => {
    if (!optimized) return
    
    const link = document.createElement('a')
    link.download = 'optimized-image.jpg'
    link.href = optimized
    link.click()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <ToolShell
      icon={Image}
      title="Image Optimizer"
      actions={<>
        <Button size="sm" onClick={optimizeImage} disabled={!image} className="bg-gradient-primary">
          Optimize
        </Button>
        <Button size="sm" onClick={downloadOptimized} disabled={!optimized} variant="outline">
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </>}
    >
      <div>
        <Label className="text-sm">Upload Image</Label>
        <label className="mt-2 flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <div className="text-center">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Click to upload</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Quality: {quality[0]}%</Label>
        <Slider value={quality} onValueChange={setQuality} min={1} max={100} />
      </div>

      {originalSize > 0 && newSize > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Original: {formatSize(originalSize)}</div>
          <div>Optimized: {formatSize(newSize)}</div>
          <div className="text-green-600">
            Saved: {((1 - newSize / originalSize) * 100).toFixed(1)}%
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <div className="pb-3">
          <div className="text-sm font-semibold">Original</div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          {image ? (
            <img src={image} alt="Original" className="max-w-full max-h-[200px] rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">No image uploaded</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="pb-3">
          <div className="text-sm font-semibold">Optimized</div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          {optimized ? (
            <img src={optimized} alt="Optimized" className="max-w-full max-h-[200px] rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">Click optimize</span>
          )}
        </div>
      </div>
    </ToolShell>
  )
}
