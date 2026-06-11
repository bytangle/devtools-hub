import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Clock, Copy, Calendar, Play } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const presets = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at noon', cron: '0 12 * * *' },
  { label: 'Every Monday at 9am', cron: '0 9 * * 1' },
  { label: 'Every weekday at 9am', cron: '0 9 * * 1-5' },
  { label: 'First of month at midnight', cron: '0 0 1 * *' },
  { label: 'Every Sunday at 3am', cron: '0 3 * * 0' },
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseCronField(field: string, max: number, names?: string[]): string {
  if (field === '*') return 'every'
  if (field.includes('/')) {
    const [, step] = field.split('/')
    return `every ${step}`
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-')
    const startVal = names ? names[parseInt(start)] : start
    const endVal = names ? names[parseInt(end)] : end
    return `${startVal} to ${endVal}`
  }
  if (field.includes(',')) {
    const parts = field.split(',').map(p => names ? names[parseInt(p)] : p)
    return parts.join(', ')
  }
  return names ? names[parseInt(field)] || field : field
}

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression'
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  
  let desc = 'At '
  
  // Time
  if (minute === '*' && hour === '*') {
    desc = 'Every minute'
  } else if (minute.includes('/')) {
    desc = `Every ${minute.split('/')[1]} minutes`
  } else if (hour === '*') {
    desc = `At minute ${minute} of every hour`
  } else if (minute === '0' && !hour.includes('/') && !hour.includes(',')) {
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    desc = `At ${h12}:00 ${ampm}`
  } else {
    desc = `At ${hour}:${minute.padStart(2, '0')}`
  }
  
  // Day of month
  if (dayOfMonth !== '*') {
    if (dayOfMonth.includes('/')) {
      desc += `, every ${dayOfMonth.split('/')[1]} days`
    } else {
      desc += ` on day ${dayOfMonth}`
    }
  }
  
  // Month
  if (month !== '*') {
    desc += ` in ${parseCronField(month, 12, ['', ...months])}`
  }
  
  // Day of week
  if (dayOfWeek !== '*') {
    if (dayOfWeek === '1-5') {
      desc += ' on weekdays'
    } else if (dayOfWeek === '0,6') {
      desc += ' on weekends'
    } else {
      desc += ` on ${parseCronField(dayOfWeek, 7, days)}`
    }
  }
  
  return desc
}

function getNextRuns(cron: string, count: number = 5): Date[] {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return []
  
  const runs: Date[] = []
  const now = new Date()
  const checkDate = new Date(now)
  checkDate.setSeconds(0)
  checkDate.setMilliseconds(0)
  
  const [minField, hourField, domField, monField, dowField] = parts
  
  const matchField = (value: number, field: string, max: number): boolean => {
    if (field === '*') return true
    if (field.includes('/')) {
      const step = parseInt(field.split('/')[1])
      return value % step === 0
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number)
      return value >= start && value <= end
    }
    if (field.includes(',')) {
      return field.split(',').map(Number).includes(value)
    }
    return parseInt(field) === value
  }
  
  // Check up to 1 year ahead
  for (let i = 0; i < 525600 && runs.length < count; i++) {
    checkDate.setMinutes(checkDate.getMinutes() + 1)
    
    const min = checkDate.getMinutes()
    const hour = checkDate.getHours()
    const dom = checkDate.getDate()
    const mon = checkDate.getMonth() + 1
    const dow = checkDate.getDay()
    
    if (matchField(min, minField, 59) &&
        matchField(hour, hourField, 23) &&
        matchField(dom, domField, 31) &&
        matchField(mon, monField, 12) &&
        matchField(dow, dowField, 6)) {
      runs.push(new Date(checkDate))
    }
  }
  
  return runs
}

export function CronBuilderTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [minute, setMinute] = useState(savedState?.minute as string || '*')
  const [hour, setHour] = useState(savedState?.hour as string || '*')
  const [dayOfMonth, setDayOfMonth] = useState(savedState?.dayOfMonth as string || '*')
  const [month, setMonth] = useState(savedState?.month as string || '*')
  const [dayOfWeek, setDayOfWeek] = useState(savedState?.dayOfWeek as string || '*')
  const [mode, setMode] = useState<'builder' | 'manual'>('builder')
  const [manualInput, setManualInput] = useState('')

  const cron = useMemo(() => 
    `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`,
    [minute, hour, dayOfMonth, month, dayOfWeek]
  )

  const description = useMemo(() => describeCron(cron), [cron])
  const nextRuns = useMemo(() => getNextRuns(cron, 5), [cron])

  useEffect(() => {
    setToolState(tabId, { minute, hour, dayOfMonth, month, dayOfWeek })
  }, [minute, hour, dayOfMonth, month, dayOfWeek, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(cron)
    }
  }, [cron, onOutputChange])

  const applyPreset = (preset: string) => {
    const parts = preset.split(' ')
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDayOfMonth(parts[2])
      setMonth(parts[3])
      setDayOfWeek(parts[4])
    }
  }

  const applyManual = () => {
    const parts = manualInput.trim().split(/\s+/)
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDayOfMonth(parts[2])
      setMonth(parts[3])
      setDayOfWeek(parts[4])
      toast({ title: "Cron expression applied" })
    } else {
      toast({ title: "Invalid cron format", description: "Expected 5 space-separated fields", variant: "destructive" })
    }
  }

  const copyCron = async () => {
    await navigator.clipboard.writeText(cron)
    toast({ title: "Copied to clipboard" })
  }

  return (
    <ToolShell
      icon={Clock}
      title="Cron Builder"
      actions={<>
        <Button size="sm" variant="outline" onClick={copyCron}>
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
      </>}
    >
      {/* Cron Expression Display */}
      <div className="rounded-lg border p-4">
        <Label className="text-sm font-medium">Cron Expression</Label>
        <code className="text-2xl font-mono font-bold text-primary block mb-2">{cron}</code>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList>
          <TabsTrigger value="builder">Visual Builder</TabsTrigger>
          <TabsTrigger value="manual">Manual Input</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {/* Presets */}
          <div className="rounded-lg border p-4">
            <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <Button
                  key={p.cron}
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset(p.cron)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Builder */}
          <div className="rounded-lg border p-4">
            <Label className="text-sm font-medium mb-3 block">Custom Builder</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Minute</Label>
                <Input
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="0-59"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Hour</Label>
                <Input
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="0-23"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Day (Month)</Label>
                <Input
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="1-31"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Month</Label>
                <Input
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="1-12"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Day (Week)</Label>
                <Input
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="0-6"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <code>*</code> = any, <code>*/n</code> = every n, <code>1-5</code> = range, <code>1,3,5</code> = list
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <div className="rounded-lg border p-4">
            <Label className="text-sm font-medium mb-2 block">Enter Cron Expression</Label>
            <div className="flex gap-2">
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="* * * * *"
                className="font-mono"
              />
              <Button onClick={applyManual}>
                <Play className="h-4 w-4 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Next Runs */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">Next Scheduled Runs</Label>
        </div>
        <div className="space-y-2">
          {nextRuns.length > 0 ? (
            nextRuns.map((run, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="w-6 h-6 p-0 justify-center">{i + 1}</Badge>
                <span className="font-mono">{run.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming runs found</p>
          )}
        </div>
      </div>
    </ToolShell>
  )
}
