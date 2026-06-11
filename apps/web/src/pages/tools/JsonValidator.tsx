import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeEditor } from "@/components/ui/code-editor"
import { Header } from "@/components/layout/header"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Code, Shield, Database } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  error?: string
  lineNumber?: number
  column?: number
  suggestions: string[]
}

export default function JsonValidator() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ValidationResult | null>(null)
  const { toast } = useToast()

  const validateJson = () => {
    try {
      if (!input.trim()) {
        toast({
          title: "Validation failed",
          description: "Please enter JSON to validate",
          variant: "destructive",
        })
        return
      }

      const suggestions: string[] = []
      
      // Try to parse JSON
      JSON.parse(input)
      
      // Additional checks for best practices
      if (input.includes("'")) {
        suggestions.push("Use double quotes instead of single quotes for strings")
      }
      
      if (input.includes('undefined')) {
        suggestions.push("'undefined' is not valid JSON, use null instead")
      }
      
      if (input.includes('NaN')) {
        suggestions.push("'NaN' is not valid JSON, use null or a string instead")
      }
      
      if (input.includes('Infinity')) {
        suggestions.push("'Infinity' is not valid JSON, use null or a string instead")
      }
      
      // Check for trailing commas
      if (input.match(/,\s*[}\]]/)) {
        suggestions.push("Remove trailing commas for better compatibility")
      }
      
      // Check for comments (not allowed in JSON)
      if (input.includes('//') || input.includes('/*')) {
        suggestions.push("Comments are not allowed in JSON")
      }
      
      // Check for large numbers that might lose precision
      const numberMatches = input.match(/\d{16,}/g)
      if (numberMatches) {
        suggestions.push("Large numbers may lose precision, consider using strings")
      }
      
      setResult({
        isValid: true,
        suggestions
      })
      
      toast({
        title: "JSON is valid",
        description: "Your JSON is properly formatted",
      })
    } catch (err) {
      let error = "Invalid JSON format"
      let lineNumber: number | undefined
      let column: number | undefined
      
      if (err instanceof SyntaxError) {
        error = err.message
        
        // Try to extract line and column info
        const match = err.message.match(/position (\d+)/)
        if (match) {
          const position = parseInt(match[1])
          const lines = input.substring(0, position).split('\n')
          lineNumber = lines.length
          column = lines[lines.length - 1].length + 1
        }
      }
      
      const suggestions: string[] = []
      
      // Provide helpful suggestions based on common errors
      if (error.includes('Unexpected token')) {
        suggestions.push("Check for missing commas, quotes, or brackets")
        suggestions.push("Ensure all strings are enclosed in double quotes")
      }
      
      if (error.includes('Unexpected end of JSON input')) {
        suggestions.push("Check for unclosed brackets or braces")
        suggestions.push("Ensure the JSON is complete")
      }
      
      if (error.includes('Expected property name')) {
        suggestions.push("Object keys must be strings enclosed in double quotes")
      }
      
      if (error.includes('Unexpected string')) {
        suggestions.push("Check for missing commas between array elements or object properties")
      }
      
      setResult({
        isValid: false,
        error,
        lineNumber,
        column,
        suggestions
      })
      
      toast({
        title: "JSON validation failed",
        description: error,
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
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">JSON Validator</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Validate and verify your JSON data structure and syntax
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">Syntax Validation</Badge>
            <Badge variant="secondary">Error Detection</Badge>
            <Badge variant="secondary">Best Practices</Badge>
            <Badge variant="secondary">Format Checking</Badge>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button onClick={validateJson} disabled={!input.trim()}>
              <Database className="mr-2 h-4 w-4" />
              Validate JSON
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder='{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "coding"],
  "active": true
}'
              title="JSON Input"
              language="json"
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
                    {!result.isValid && result.error && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Error:</strong> {result.error}
                          {result.lineNumber && result.column && (
                            <div className="mt-1">
                              <strong>Location:</strong> Line {result.lineNumber}, Column {result.column}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.suggestions.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Suggestions:</strong>
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
                          Your JSON is valid and properly formatted!
                          {result.suggestions.length === 0 && (
                            <div className="mt-1">No issues or suggestions found.</div>
                          )}
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
              <p className="text-sm">• Line and column reporting</p>
              <p className="text-sm">• Best practice suggestions</p>
              <p className="text-sm">• Common error explanations</p>
              <p className="text-sm">• Format compliance checking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Missing commas or quotes</p>
              <p className="text-sm">• Trailing commas</p>
              <p className="text-sm">• Single quotes instead of double</p>
              <p className="text-sm">• Unclosed brackets or braces</p>
              <p className="text-sm">• Invalid values (undefined, NaN)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                JSON Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Use double quotes for strings</p>
              <p className="text-sm">• No trailing commas allowed</p>
              <p className="text-sm">• No comments in JSON</p>
              <p className="text-sm">• Values: string, number, boolean, null, object, array</p>
              <p className="text-sm">• Keys must be strings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}