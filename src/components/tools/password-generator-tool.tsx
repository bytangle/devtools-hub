import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Lock, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

export function PasswordGeneratorTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)

  const [password, setPassword] = useState(savedState?.password || "")
  const [length, setLength] = useState(savedState?.length || [16])
  const [includeUppercase, setIncludeUppercase] = useState(savedState?.includeUppercase ?? true)
  const [includeLowercase, setIncludeLowercase] = useState(savedState?.includeLowercase ?? true)
  const [includeNumbers, setIncludeNumbers] = useState(savedState?.includeNumbers ?? true)
  const [includeSymbols, setIncludeSymbols] = useState(savedState?.includeSymbols ?? true)
  const [passwords, setPasswords] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { password, length, includeUppercase, includeLowercase, includeNumbers, includeSymbols })
  }, [password, length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && password) {
      onOutputChange(password)
    }
  }, [password, onOutputChange])

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let charset = ''
    if (includeUppercase) charset += uppercaseChars
    if (includeLowercase) charset += lowercaseChars
    if (includeNumbers) charset += numberChars
    if (includeSymbols) charset += symbolChars

    if (!charset) {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      })
      return
    }

    let result = ''
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(result)
    toast({
      title: "Password generated",
      description: "New secure password created",
    })
  }

  const generateMultiple = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let charset = ''
    if (includeUppercase) charset += uppercaseChars
    if (includeLowercase) charset += lowercaseChars
    if (includeNumbers) charset += numberChars
    if (includeSymbols) charset += symbolChars

    if (!charset) return

    const generated = Array.from({ length: 5 }, () => {
      let result = ''
      for (let i = 0; i < length[0]; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      return result
    })

    setPasswords(generated)
    toast({ title: "Generated 5 passwords" })
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Password Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Length: {length[0]}</Label>
              <Slider
                value={length}
                onValueChange={setLength}
                max={64}
                min={4}
                step={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={(c) => setIncludeUppercase(c === true)} />
                <Label htmlFor="uppercase" className="text-sm">A-Z</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="lowercase" checked={includeLowercase} onCheckedChange={(c) => setIncludeLowercase(c === true)} />
                <Label htmlFor="lowercase" className="text-sm">a-z</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={(c) => setIncludeNumbers(c === true)} />
                <Label htmlFor="numbers" className="text-sm">0-9</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={(c) => setIncludeSymbols(c === true)} />
                <Label htmlFor="symbols" className="text-sm">!@#$</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={generatePassword} className="bg-gradient-primary">
                <RefreshCw className="h-3 w-3 mr-1" />
                Generate
              </Button>
              <Button size="sm" onClick={generateMultiple} variant="outline">
                Generate 5
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Generated Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={password} 
                readOnly 
                className="font-mono text-sm"
                placeholder="Click generate..."
              />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(password)} disabled={!password}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {passwords.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">More passwords:</Label>
                {passwords.map((pwd, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={pwd} readOnly className="font-mono text-xs" />
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(pwd)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
