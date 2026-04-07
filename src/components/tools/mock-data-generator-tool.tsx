import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Sparkles, Copy, RefreshCw, Download } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

// Data pools
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella', 'Elijah', 'Sophia', 'Lucas']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']
const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'mail.com', 'example.com']
const streets = ['Main St', 'Oak Ave', 'Elm St', 'Park Rd', 'Cedar Ln', 'Maple Dr', 'Washington Blvd', 'Lake View', 'Forest Way', 'River Rd', 'Highland Ave', 'Sunset Blvd', 'Mountain View', 'Valley Rd', 'Spring St']
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'Seattle', 'Denver', 'Boston', 'Portland', 'Miami']
const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI']
const companies = ['Acme Corp', 'GlobalTech', 'Innovate LLC', 'TechStart', 'DataFlow Inc', 'CloudNine', 'NextGen Solutions', 'Digital Dynamics', 'Quantum Labs', 'FutureWorks', 'CyberCore', 'NetSphere', 'CodeCraft', 'WebWorks', 'AppForge']
const jobTitles = ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'Marketing Manager', 'Sales Rep', 'DevOps Engineer', 'QA Engineer', 'Project Manager', 'Business Analyst', 'HR Manager', 'Accountant', 'Customer Support', 'Technical Writer', 'System Admin']

const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function generatePhone(): string {
  return `+1 (${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`
}

function generateDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

function generateIP(): string {
  return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`
}

function generateCreditCard(): string {
  // Generate fake Visa-like number (starts with 4)
  const segments = [
    '4' + randomInt(100, 999).toString(),
    randomInt(1000, 9999).toString(),
    randomInt(1000, 9999).toString(),
    randomInt(1000, 9999).toString()
  ]
  return segments.join(' ')
}

interface MockPerson {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  company: string
  jobTitle: string
  birthDate: string
  ip: string
  creditCard?: string
}

function generatePerson(includeSensitive: boolean): MockPerson {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)
  
  return {
    id: generateUUID(),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(domains)}`,
    phone: generatePhone(),
    address: {
      street: `${randomInt(100, 9999)} ${randomItem(streets)}`,
      city: randomItem(cities),
      state: randomItem(states),
      zip: randomInt(10000, 99999).toString()
    },
    company: randomItem(companies),
    jobTitle: randomItem(jobTitles),
    birthDate: generateDate(new Date(1960, 0, 1), new Date(2005, 0, 1)),
    ip: generateIP(),
    ...(includeSensitive && { creditCard: generateCreditCard() })
  }
}

type DataType = 'person' | 'uuid' | 'email' | 'phone' | 'address' | 'company' | 'date' | 'ip' | 'number'

export function MockDataGeneratorTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [dataType, setDataType] = useState<DataType>(savedState?.dataType as DataType || 'person')
  const [count, setCount] = useState(savedState?.count as number || 5)
  const [includeSensitive, setIncludeSensitive] = useState(false)
  const [output, setOutput] = useState<any[]>([])

  useEffect(() => {
    setToolState(tabId, { dataType, count })
  }, [dataType, count, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && output.length > 0) {
      onOutputChange(JSON.stringify(output, null, 2))
    }
  }, [output, onOutputChange])

  const generate = () => {
    const results: any[] = []
    
    for (let i = 0; i < count; i++) {
      switch (dataType) {
        case 'person':
          results.push(generatePerson(includeSensitive))
          break
        case 'uuid':
          results.push(generateUUID())
          break
        case 'email':
          const fn = randomItem(firstNames).toLowerCase()
          const ln = randomItem(lastNames).toLowerCase()
          results.push(`${fn}.${ln}@${randomItem(domains)}`)
          break
        case 'phone':
          results.push(generatePhone())
          break
        case 'address':
          results.push({
            street: `${randomInt(100, 9999)} ${randomItem(streets)}`,
            city: randomItem(cities),
            state: randomItem(states),
            zip: randomInt(10000, 99999).toString()
          })
          break
        case 'company':
          results.push(randomItem(companies))
          break
        case 'date':
          results.push(generateDate(new Date(2020, 0, 1), new Date()))
          break
        case 'ip':
          results.push(generateIP())
          break
        case 'number':
          results.push(randomInt(1, 1000000))
          break
      }
    }
    
    setOutput(results)
    toast({ title: `Generated ${count} ${dataType}${count > 1 ? 's' : ''}` })
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2))
    toast({ title: "Copied to clipboard" })
  }

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mock-${dataType}-${count}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolShell
      icon={Sparkles}
      title="Mock Data Generator"
      actions={<>
        <Button size="sm" onClick={generate} className="bg-primary hover:bg-primary/90">
          <RefreshCw className="h-3 w-3 mr-1" />
          Generate
        </Button>
        {output.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={copyOutput}>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadJson}>
              <Download className="h-3 w-3 mr-1" />
              JSON
            </Button>
          </>
        )}
      </>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Data Type</Label>
            <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person (Full)</SelectItem>
                <SelectItem value="uuid">UUID</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block">Count</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>
        </div>

        {dataType === 'person' && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="sensitive"
              checked={includeSensitive}
              onCheckedChange={(c) => setIncludeSensitive(!!c)}
            />
            <Label htmlFor="sensitive" className="text-sm cursor-pointer">
              Include fake credit card numbers
            </Label>
          </div>
        )}

        {output.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-3 block">Generated Data ({output.length} items)</Label>
            <ScrollArea className="h-[400px] rounded border">
              <pre className="p-4 text-xs font-mono">
                {JSON.stringify(output, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}
      </div>
    </ToolShell>
  )
}
