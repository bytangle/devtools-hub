import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Copy, RefreshCw, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { v1 as uuidv1, v4 as uuidv4, v5 as uuidv5, v7 as uuidv7 } from "uuid"

type UuidVersion = "v1" | "v4" | "v5" | "v7"

const UUID_NAMESPACES = {
  dns: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  url: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  oid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  x500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
} as const

const VERSION_INFO: Record<UuidVersion, { label: string; description: string }> = {
  v1: { label: "v1 (Timestamp)", description: "Based on timestamp and MAC address. Good for distributed systems." },
  v4: { label: "v4 (Random)", description: "Random-based. Most commonly used. Unpredictable and widely supported." },
  v5: { label: "v5 (Namespace)", description: "SHA-1 hash of namespace + name. Deterministic - same input = same UUID." },
  v7: { label: "v7 (Timestamp+Random)", description: "Unix timestamp + random. Sortable, great for database keys." },
}

export function UuidGeneratorTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)

  const [uuid, setUuid] = useState(savedState?.uuid || "")
  const [uuids, setUuids] = useState<string[]>(savedState?.uuids || [])
  const [version, setVersion] = useState<UuidVersion>(savedState?.version || "v4")
  const [namespace, setNamespace] = useState<string>(savedState?.namespace || "dns")
  const [customNamespace, setCustomNamespace] = useState<string>(savedState?.customNamespace || "")
  const [name, setName] = useState<string>(savedState?.name || "")
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { uuid, uuids, version, namespace, customNamespace, name })
  }, [uuid, uuids, version, namespace, customNamespace, name, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && uuid) {
      onOutputChange(uuid)
    }
  }, [uuid, onOutputChange])

  const generateSingleUuid = (): string => {
    switch (version) {
      case "v1":
        return uuidv1()
      case "v4":
        return uuidv4()
      case "v5": {
        if (!name.trim()) {
          throw new Error("Name is required for UUID v5")
        }
        const ns = namespace === "custom" ? customNamespace : UUID_NAMESPACES[namespace as keyof typeof UUID_NAMESPACES]
        if (namespace === "custom" && !customNamespace.trim()) {
          throw new Error("Custom namespace UUID is required")
        }
        return uuidv5(name, ns)
      }
      case "v7":
        return uuidv7()
      default:
        return uuidv4()
    }
  }

  const generateUuid = () => {
    try {
      const newUuid = generateSingleUuid()
      setUuid(newUuid)
      toast({ title: `UUID ${version} generated` })
    } catch (error) {
      toast({ title: (error as Error).message, variant: "destructive" })
    }
  }

  const generateMultiple = (count: number) => {
    try {
      const newUuids = Array.from({ length: count }, () => generateSingleUuid())
      setUuids(newUuids)
      toast({ title: `Generated ${count} UUIDs (${version})` })
    } catch (error) {
      toast({ title: (error as Error).message, variant: "destructive" })
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  const copyAll = () => {
    const all = [uuid, ...uuids].filter(Boolean).join("\n")
    navigator.clipboard.writeText(all)
    toast({ title: "All UUIDs copied" })
  }

  return (
    <ToolShell
      icon={Zap}
      title="UUID Generator"
      actions={<><Button size="sm" onClick={generateUuid} className="bg-gradient-primary">
              <RefreshCw className="h-3 w-3 mr-1" />
              Generate UUID
            </Button>
            <Button size="sm" onClick={() => generateMultiple(5)} variant="outline">
              Generate 5
            </Button>
            <Button size="sm" onClick={() => generateMultiple(10)} variant="outline">
              Generate 10
            </Button>
            {(uuid || uuids.length > 0) && (
              <Button size="sm" onClick={copyAll} variant="outline">
                Copy All
              </Button>
            )}</>}
    >
      <div className="space-y-4">
        {/* Version Selection */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">UUID Version</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{VERSION_INFO[version].description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={version} onValueChange={(v) => setVersion(v as UuidVersion)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VERSION_INFO).map(([v, info]) => (
                <SelectItem key={v} value={v}>
                  <div className="flex flex-col items-start">
                    <span>{info.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{VERSION_INFO[version].description}</p>
        </div>

        {/* V5 Namespace Options */}
        {version === "v5" && (
          <div className="rounded-lg border p-4 space-y-4">
            <Label className="text-sm font-medium">Namespace & Name (v5)</Label>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Namespace</Label>
                <Select value={namespace} onValueChange={setNamespace}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dns">DNS</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="oid">OID</SelectItem>
                    <SelectItem value="x500">X.500</SelectItem>
                    <SelectItem value="custom">Custom UUID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {namespace === "custom" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Custom Namespace UUID</Label>
                  <Input
                    value={customNamespace}
                    onChange={(e) => setCustomNamespace(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="font-mono text-sm"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name (e.g., example.com)"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Generated UUID Output */}
        <div className="rounded-lg border">
          <div className="p-4 pb-3">
            <span className="text-sm font-medium">Generated UUID</span>
          </div>
          <div className="p-4 pt-0 space-y-3">
            <div className="flex gap-2">
              <Input 
                value={uuid} 
                readOnly 
                className="font-mono text-sm"
                placeholder="Click generate..."
              />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(uuid)} disabled={!uuid}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {uuids.length > 0 && (
              <div className="space-y-2">
                {uuids.map((u, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={u} readOnly className="font-mono text-xs" />
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(u)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  )
}
