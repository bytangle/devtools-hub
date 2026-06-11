import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeEditor } from "@/components/ui/code-editor"
import { Header } from "@/components/layout/header"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Code, Shield, Zap } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export default function CssValidator() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ValidationResult | null>(null)
  const { toast } = useToast()

  const validateCss = () => {
    try {
      if (!input.trim()) {
        toast({
          title: "Validation failed",
          description: "Please enter CSS code to validate",
          variant: "destructive",
        })
        return
      }

      const errors: string[] = []
      const warnings: string[] = []
      const suggestions: string[] = []

      // Basic CSS validation checks
      const lines = input.split('\n')
      let braceCount = 0
      let inRule = false
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        const lineNum = index + 1
        
        // Check for unmatched braces
        const openBraces = (line.match(/{/g) || []).length
        const closeBraces = (line.match(/}/g) || []).length
        braceCount += openBraces - closeBraces
        
        if (openBraces > 0) inRule = true
        if (closeBraces > 0) inRule = false
        
        // Check for missing semicolons
        if (inRule && trimmedLine.includes(':') && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && trimmedLine !== '') {
          warnings.push(`Line ${lineNum}: Missing semicolon`)
        }
        
        // Check for invalid property names
        if (inRule && trimmedLine.includes(':')) {
          const property = trimmedLine.split(':')[0].trim()
          if (property && !/^[a-z-]+$/i.test(property) && !property.startsWith('--')) {
            errors.push(`Line ${lineNum}: Invalid property name "${property}"`)
          }
        }
        
        // Check for empty rules
        if (trimmedLine === '{}') {
          warnings.push(`Line ${lineNum}: Empty CSS rule`)
        }
        
        // Suggestions for best practices
        if (trimmedLine.includes('!important')) {
          suggestions.push(`Line ${lineNum}: Consider avoiding !important for better maintainability`)
        }
        
        // Check for common typos
        if (trimmedLine.includes('colour:')) {
          suggestions.push(`Line ${lineNum}: Did you mean "color" instead of "colour"?`)
        }
      })
      
      // Check for unmatched braces at the end
      if (braceCount !== 0) {
        errors.push(`Unmatched braces: ${braceCount > 0 ? 'missing closing' : 'extra closing'} brace(s)`)
      }
      
      // Check for basic syntax patterns
      if (input.includes(';;')) {
        warnings.push('Double semicolons found')
      }
      
      if (input.includes('::')) {
        const doubleColons = input.match(/::[a-z-]+/g)
        if (doubleColons && doubleColons.some(pseudo => !['::before', '::after', '::first-line', '::first-letter'].includes(pseudo))) {
          warnings.push('Potential invalid pseudo-element syntax')
        }
      }

      const isValid = errors.length === 0
      
      setResult({
        isValid,
        errors,
        warnings,
        suggestions
      })
      
      toast({
        title: isValid ? "CSS is valid" : "CSS validation failed",
        description: isValid 
          ? "No errors found in your CSS" 
          : `Found ${errors.length} error(s) and ${warnings.length} warning(s)`,
        variant: isValid ? "default" : "destructive",
      })
    } catch (err) {
      toast({
        title: "Validation error",
        description: "An error occurred during validation",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setInput("")
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">CSS Validator</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Validate your CSS code for syntax errors and best practices
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">Syntax Validation</Badge>
            <Badge variant="secondary">Error Detection</Badge>
            <Badge variant="secondary">Best Practices</Badge>
            <Badge variant="secondary">CSS3 Support</Badge>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button onClick={validateCss} disabled={!input.trim()}>
              <Shield className="mr-2 h-4 w-4" />
              Validate CSS
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="/* Enter your CSS code here */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}"
              title="CSS Input"
              language="css"
            />
            
            <div className="space-y-4">
              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {result.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Validation Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.errors.length > 0 && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Errors ({result.errors.length}):</strong>
                          <ul className="mt-2 space-y-1">
                            {result.errors.map((error, index) => (
                              <li key={index} className="text-sm">• {error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Warnings ({result.warnings.length}):</strong>
                          <ul className="mt-2 space-y-1">
                            {result.warnings.map((warning, index) => (
                              <li key={index} className="text-sm">• {warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.suggestions.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Suggestions ({result.suggestions.length}):</strong>
                          <ul className="mt-2 space-y-1">
                            {result.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm">• {suggestion}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.isValid && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your CSS is valid! No syntax errors detected.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Validation Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Syntax error detection</p>
              <p className="text-sm">• Brace matching</p>
              <p className="text-sm">• Property validation</p>
              <p className="text-sm">• Missing semicolon detection</p>
              <p className="text-sm">• Best practice suggestions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Unmatched braces</p>
              <p className="text-sm">• Missing semicolons</p>
              <p className="text-sm">• Invalid property names</p>
              <p className="text-sm">• Empty CSS rules</p>
              <p className="text-sm">• Overuse of !important</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Use consistent indentation</p>
              <p className="text-sm">• Avoid !important when possible</p>
              <p className="text-sm">• Use meaningful class names</p>
              <p className="text-sm">• Group related properties</p>
              <p className="text-sm">• Comment complex styles</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}