import { cn } from "@/lib/utils"
import { Copy, Check, Download, Trash2, Upload } from "lucide-react"
import { useState, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface IOPanelProps {
  title: string
  children: React.ReactNode
  className?: string
  /** Badge text like "JSON", "Base64", etc. */
  badge?: string
  /** Show copy button (needs value prop) */
  value?: string
  /** Whether to show download action */
  onDownload?: () => void
  /** Whether to show clear action */
  onClear?: () => void
  /** File upload handler */
  onUpload?: (content: string) => void
  /** Upload accept filter */
  uploadAccept?: string
  /** Stats text shown at bottom right, e.g. "1,234 chars" */
  stats?: string
  /** Extra actions in the header */
  headerActions?: React.ReactNode
  /** Variant for visual styling */
  variant?: "input" | "output" | "neutral"
}

export function IOPanel({
  title,
  children,
  className,
  badge,
  value,
  onDownload,
  onClear,
  onUpload,
  uploadAccept,
  stats,
  headerActions,
  variant = "neutral",
}: IOPanelProps) {
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleCopy = useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast({ title: "Copied to clipboard" })
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" })
    }
  }, [value, toast])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUpload) return
    if (file.size > 1024 * 1024) {
      toast({ title: "File too large", description: "Max 1MB", variant: "destructive" })
      return
    }
    const reader = new FileReader()
    reader.onload = () => onUpload(reader.result as string)
    reader.readAsText(file)
    e.target.value = ""
  }, [onUpload, toast])

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border overflow-hidden",
        variant === "input" && "border-border/60",
        variant === "output" && "border-primary/20",
        variant === "neutral" && "border-border/60",
        className,
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-1.5 border-b",
        "bg-muted/40",
      )}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {badge && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {headerActions}
          {onUpload && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept={uploadAccept || ".txt,.json,.xml,.html,.css,.js,.ts,.yaml,.yml,.csv,.sql,.md"}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Upload file"
              >
                <Upload className="h-3 w-3" />
              </button>
            </>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Download"
            >
              <Download className="h-3 w-3" />
            </button>
          )}
          {value && (
            <button
              onClick={handleCopy}
              className={cn(
                "p-1 rounded transition-colors",
                copied ? "text-emerald-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Copy"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Clear"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-background">
        {children}
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
