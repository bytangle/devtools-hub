import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Lock, Zap, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([12])
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [passwords, setPasswords] = useState<string[]>([])
  const { toast } = useToast()

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const similarChars = 'il1Lo0O'

    let charset = ''
    if (includeUppercase) charset += uppercaseChars
    if (includeLowercase) charset += lowercaseChars
    if (includeNumbers) charset += numberChars
    if (includeSymbols) charset += symbolChars

    if (excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
    }

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
      description: "New secure password has been created",
    })
  }

  const generateMultiple = () => {
    const newPasswords: string[] = []
    for (let i = 0; i < 10; i++) {
      generatePassword()
      if (password) newPasswords.push(password)
    }
    // Generate them properly
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const similarChars = 'il1Lo0O'

    let charset = ''
    if (includeUppercase) charset += uppercaseChars
    if (includeLowercase) charset += lowercaseChars
    if (includeNumbers) charset += numberChars
    if (includeSymbols) charset += symbolChars

    if (excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
    }

    if (!charset) return

    const generatedPasswords = Array.from({ length: 10 }, () => {
      let result = ''
      for (let i = 0; i < length[0]; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      return result
    })

    setPasswords(generatedPasswords)
    toast({
      title: "Multiple passwords generated",
      description: "10 secure passwords have been created",
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Password has been copied successfully",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy password to clipboard",
        variant: "destructive",
      })
    }
  }

  const getStrengthColor = (password: string) => {
    if (password.length < 8) return 'text-destructive'
    if (password.length < 12) return 'text-warning'
    return 'text-success'
  }

  const getStrengthText = (password: string) => {
    if (password.length < 8) return 'Weak'
    if (password.length < 12) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Password Generator - Create Strong & Secure Passwords Online"
        description="Generate strong, secure passwords with customizable length and character sets. Include uppercase, lowercase, numbers, and symbols for maximum security."
        keywords="password generator, secure password, strong password, random password, password creator"
        canonicalUrl="/tools/password-generator"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Password Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Generate secure, random passwords with customizable options for maximum security.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Secure</Badge>
              <Badge variant="secondary">Customizable</Badge>
              <Badge variant="secondary">No Storage</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Password Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Password Length: {length[0]}</Label>
                  <Slider
                    value={length}
                    onValueChange={setLength}
                    max={128}
                    min={4}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="uppercase" 
                      checked={includeUppercase}
                      onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
                    />
                    <Label htmlFor="uppercase">Include Uppercase (A-Z)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lowercase" 
                      checked={includeLowercase}
                      onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
                    />
                    <Label htmlFor="lowercase">Include Lowercase (a-z)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="numbers" 
                      checked={includeNumbers}
                      onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
                    />
                    <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="symbols" 
                      checked={includeSymbols}
                      onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
                    />
                    <Label htmlFor="symbols">Include Symbols (!@#$%)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="similar" 
                      checked={excludeSimilar}
                      onCheckedChange={(checked) => setExcludeSimilar(checked === true)}
                    />
                    <Label htmlFor="similar">Exclude Similar Characters</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={generatePassword} className="w-full bg-gradient-primary">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Password
                  </Button>
                  <Button onClick={generateMultiple} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate 10 Passwords
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Password */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      value={password} 
                      readOnly 
                      className="font-mono"
                      placeholder="Click generate to create a password"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(password)}
                      disabled={!password}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {password && (
                    <div className="text-sm">
                      Strength: <span className={getStrengthColor(password)}>{getStrengthText(password)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {passwords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Multiple Passwords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {passwords.map((pwd, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input 
                            value={pwd} 
                            readOnly 
                            className="font-mono text-xs"
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => copyToClipboard(pwd)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Use unique passwords for each account</div>
                <div>• Longer passwords are stronger</div>
                <div>• Include mixed character types</div>
                <div>• Avoid personal information</div>
                <div>• Use a password manager</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password Strength</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 8+ characters: Minimum</div>
                <div>• 12+ characters: Good</div>
                <div>• 16+ characters: Excellent</div>
                <div>• Mixed types: Essential</div>
                <div>• No dictionary words</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Generated locally only</div>
                <div>• No data transmission</div>
                <div>• No password storage</div>
                <div>• Secure random generation</div>
                <div>• Client-side processing</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}