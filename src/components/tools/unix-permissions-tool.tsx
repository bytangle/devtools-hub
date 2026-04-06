import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Copy, RotateCcw } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

type PermissionType = 'r' | 'w' | 'x'
type EntityType = 'owner' | 'group' | 'others'

const entities: { id: EntityType; label: string; color: string }[] = [
  { id: 'owner', label: 'Owner', color: 'text-green-600' },
  { id: 'group', label: 'Group', color: 'text-blue-600' },
  { id: 'others', label: 'Others', color: 'text-orange-600' },
]

const permissions: { id: PermissionType; label: string; value: number }[] = [
  { id: 'r', label: 'Read', value: 4 },
  { id: 'w', label: 'Write', value: 2 },
  { id: 'x', label: 'Execute', value: 1 },
]

const commonPresets = [
  { octal: '755', desc: 'rwxr-xr-x', usage: 'Executables/Directories' },
  { octal: '644', desc: 'rw-r--r--', usage: 'Regular files' },
  { octal: '700', desc: 'rwx------', usage: 'Private executable' },
  { octal: '600', desc: 'rw-------', usage: 'Private file' },
  { octal: '777', desc: 'rwxrwxrwx', usage: 'Full access (avoid!)' },
  { octal: '666', desc: 'rw-rw-rw-', usage: 'Everyone read/write' },
  { octal: '750', desc: 'rwxr-x---', usage: 'Group execute' },
  { octal: '640', desc: 'rw-r-----', usage: 'Group read only' },
]

function octalToPermissions(octal: string): Record<EntityType, Record<PermissionType, boolean>> {
  const result: Record<EntityType, Record<PermissionType, boolean>> = {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    others: { r: false, w: false, x: false },
  }
  
  const digits = octal.slice(-3).padStart(3, '0')
  const entityKeys: EntityType[] = ['owner', 'group', 'others']
  
  entityKeys.forEach((entity, i) => {
    const digit = parseInt(digits[i])
    if (!isNaN(digit)) {
      result[entity].r = (digit & 4) !== 0
      result[entity].w = (digit & 2) !== 0
      result[entity].x = (digit & 1) !== 0
    }
  })
  
  return result
}

function permissionsToOctal(perms: Record<EntityType, Record<PermissionType, boolean>>): string {
  const entityKeys: EntityType[] = ['owner', 'group', 'others']
  return entityKeys.map(entity => {
    let value = 0
    if (perms[entity].r) value += 4
    if (perms[entity].w) value += 2
    if (perms[entity].x) value += 1
    return value.toString()
  }).join('')
}

function permissionsToSymbolic(perms: Record<EntityType, Record<PermissionType, boolean>>): string {
  const entityKeys: EntityType[] = ['owner', 'group', 'others']
  return entityKeys.map(entity => {
    return (perms[entity].r ? 'r' : '-') +
           (perms[entity].w ? 'w' : '-') +
           (perms[entity].x ? 'x' : '-')
  }).join('')
}

export function UnixPermissionsTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [perms, setPerms] = useState<Record<EntityType, Record<PermissionType, boolean>>>(
    savedState?.perms as Record<EntityType, Record<PermissionType, boolean>> || 
    octalToPermissions('755')
  )
  const [octalInput, setOctalInput] = useState(savedState?.octalInput as string || '755')

  const octal = useMemo(() => permissionsToOctal(perms), [perms])
  const symbolic = useMemo(() => permissionsToSymbolic(perms), [perms])

  useEffect(() => {
    setToolState(tabId, { perms, octalInput })
  }, [perms, octalInput, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(octal)
    }
  }, [octal, onOutputChange])

  const togglePermission = (entity: EntityType, perm: PermissionType) => {
    setPerms(prev => ({
      ...prev,
      [entity]: {
        ...prev[entity],
        [perm]: !prev[entity][perm]
      }
    }))
  }

  const applyOctal = () => {
    if (/^[0-7]{3,4}$/.test(octalInput)) {
      setPerms(octalToPermissions(octalInput))
      toast({ title: "Permissions updated" })
    } else {
      toast({ title: "Invalid octal", description: "Enter 3 or 4 digits (0-7)", variant: "destructive" })
    }
  }

  const applyPreset = (preset: string) => {
    setOctalInput(preset)
    setPerms(octalToPermissions(preset))
  }

  const reset = () => {
    setPerms(octalToPermissions('644'))
    setOctalInput('644')
  }

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: `${label} copied` })
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">unix_permissions</h2>
      </div>

      {/* Result */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Numeric (Octal)</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-2xl font-mono font-bold text-primary">{octal}</code>
                <Button size="sm" variant="ghost" onClick={() => copy(octal, 'Octal')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Symbolic</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-2xl font-mono font-bold">{symbolic}</code>
                <Button size="sm" variant="ghost" onClick={() => copy(symbolic, 'Symbolic')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => copy(`chmod ${octal}`, 'chmod command')}>
              <Copy className="h-3 w-3 mr-1" />
              chmod {octal}
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Octal Input */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Enter Octal</Label>
          <div className="flex gap-2">
            <Input
              value={octalInput}
              onChange={(e) => setOctalInput(e.target.value)}
              placeholder="755"
              className="font-mono w-32"
              maxLength={4}
            />
            <Button onClick={applyOctal}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Permission Matrix</Label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4"></th>
                  {permissions.map(p => (
                    <th key={p.id} className="text-center px-4 py-2">
                      <div className="font-mono">{p.label}</div>
                      <div className="text-xs text-muted-foreground">{p.id} ({p.value})</div>
                    </th>
                  ))}
                  <th className="text-center px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {entities.map(entity => (
                  <tr key={entity.id} className="border-b">
                    <td className={`py-3 pr-4 font-medium ${entity.color}`}>{entity.label}</td>
                    {permissions.map(perm => (
                      <td key={perm.id} className="text-center px-4 py-3">
                        <Checkbox
                          checked={perms[entity.id][perm.id]}
                          onCheckedChange={() => togglePermission(entity.id, perm.id)}
                          className="h-5 w-5"
                        />
                      </td>
                    ))}
                    <td className="text-center px-4 py-3">
                      <Badge variant="secondary" className="font-mono">
                        {(perms[entity.id].r ? 4 : 0) + (perms[entity.id].w ? 2 : 0) + (perms[entity.id].x ? 1 : 0)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Common Presets */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Common Permissions</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {commonPresets.map(preset => (
              <Button
                key={preset.octal}
                variant={octal === preset.octal ? "default" : "outline"}
                className="justify-start h-auto py-2"
                onClick={() => applyPreset(preset.octal)}
              >
                <div className="flex items-center gap-3 w-full">
                  <code className="font-mono font-bold">{preset.octal}</code>
                  <code className="font-mono text-xs text-muted-foreground">{preset.desc}</code>
                  <span className="text-xs ml-auto">{preset.usage}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
