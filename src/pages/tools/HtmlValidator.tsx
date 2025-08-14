import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeEditor } from "@/components/ui/code-editor"
import { Header } from "@/components/layout/header"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Code, Shield, Globe } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export default function HtmlValidator() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ValidationResult | null>(null)
  const { toast } = useToast()

  const validateHtml = () => {
    try {
      if (!input.trim()) {
        toast({
          title: "Validation failed",
          description: "Please enter HTML code to validate",
          variant: "destructive",
        })
        return
      }

      const errors: string[] = []
      const warnings: string[] = []
      const suggestions: string[] = []

      // Basic HTML validation checks
      const lines = input.split('\n')
      const openTags: string[] = []
      const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']
      
      lines.forEach((line, index) => {
        const lineNum = index + 1
        
        // Find all tags in the line
        const tagMatches = line.match(/<\/?[^>]+>/g) || []
        
        tagMatches.forEach(tag => {
          const isClosing = tag.startsWith('</')
          const isSelfClosing = tag.endsWith('/>')
          const tagName = tag.replace(/<\/?|>|\/>/g, '').split(' ')[0].toLowerCase()
          
          if (isClosing) {
            // Check if there's a matching opening tag
            const lastOpenIndex = openTags.lastIndexOf(tagName)
            if (lastOpenIndex === -1) {
              errors.push(`Line ${lineNum}: Closing tag </${tagName}> without matching opening tag`)
            } else {
              openTags.splice(lastOpenIndex, 1)
            }
          } else if (!isSelfClosing && !selfClosingTags.includes(tagName)) {
            openTags.push(tagName)
          }
          
          // Check for common HTML5 semantic tags
          if (['div', 'span'].includes(tagName) && !tag.includes('class') && !tag.includes('id')) {
            suggestions.push(`Line ${lineNum}: Consider using semantic HTML5 tags instead of generic <${tagName}>`)
          }
          
          // Check for missing alt attributes on images
          if (tagName === 'img' && !tag.includes('alt=')) {
            errors.push(`Line ${lineNum}: <img> tag missing required alt attribute`)
          }
          
          // Check for deprecated tags
          const deprecatedTags = ['center', 'font', 'marquee', 'blink', 'big', 'tt']
          if (deprecatedTags.includes(tagName)) {
            warnings.push(`Line ${lineNum}: <${tagName}> is deprecated, use CSS instead`)
          }
          
          // Check for inline styles
          if (tag.includes('style=')) {
            suggestions.push(`Line ${lineNum}: Consider using external CSS instead of inline styles`)
          }
        })
        
        // Check for missing DOCTYPE
        if (index === 0 && !line.toLowerCase().includes('<!doctype')) {
          warnings.push('Missing DOCTYPE declaration')
        }
        
        // Check for unclosed tags
        const unclosedMatches = line.match(/<[^\/][^>]*[^\/]>/g) || []
        unclosedMatches.forEach(tag => {
          const tagName = tag.replace(/<|>/g, '').split(' ')[0].toLowerCase()
          if (selfClosingTags.includes(tagName) && !tag.endsWith('/>')) {
            suggestions.push(`Line ${lineNum}: Consider self-closing <${tagName}> tag with />`)
          }
        })
      })
      
      // Check for unclosed tags at the end
      if (openTags.length > 0) {
        openTags.forEach(tag => {
          errors.push(`Unclosed tag: <${tag}>`)
        })
      }
      
      // Check for basic HTML structure
      const hasHtml = input.toLowerCase().includes('<html')
      const hasHead = input.toLowerCase().includes('<head')
      const hasBody = input.toLowerCase().includes('<body')
      const hasTitle = input.toLowerCase().includes('<title')
      
      if (!hasHtml) {
        suggestions.push('Consider adding <html> root element')
      }
      if (!hasHead) {
        suggestions.push('Consider adding <head> section')
      }
      if (!hasBody) {
        suggestions.push('Consider adding <body> element')
      }
      if (!hasTitle && hasHead) {
        warnings.push('Missing <title> element in <head>')
      }
      
      // Check for common accessibility issues
      if (input.includes('<a ') && !input.includes('href=')) {
        warnings.push('Anchor tags should have href attributes')
      }
      
      if (input.includes('<button') && !input.includes('type=')) {
        suggestions.push('Consider specifying button type (button, submit, reset)')
      }

      const isValid = errors.length === 0
      
      setResult({
        isValid,
        errors,
        warnings,
        suggestions
      })
      
      toast({
        title: isValid ? "HTML is valid" : "HTML validation failed",
        description: isValid 
          ? "No errors found in your HTML" 
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
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">HTML Validator</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Validate your HTML code for syntax errors and best practices
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">HTML5 Validation</Badge>
            <Badge variant="secondary">Accessibility</Badge>
            <Badge variant="secondary">Semantic HTML</Badge>
            <Badge variant="secondary">Error Detection</Badge>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button onClick={validateHtml} disabled={!input.trim()}>
              <Globe className="mr-2 h-4 w-4" />
              Validate HTML
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>"
              title="HTML Input"
              language="html"
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
                          Your HTML is valid! No syntax errors detected.
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
              <p className="text-sm">• Tag matching validation</p>
              <p className="text-sm">• Attribute requirements</p>
              <p className="text-sm">• HTML5 compliance</p>
              <p className="text-sm">• Accessibility checks</p>
              <p className="text-sm">• Semantic HTML suggestions</p>
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
              <p className="text-sm">• Unclosed tags</p>
              <p className="text-sm">• Missing alt attributes</p>
              <p className="text-sm">• Deprecated elements</p>
              <p className="text-sm">• Missing DOCTYPE</p>
              <p className="text-sm">• Invalid nesting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Use semantic HTML5 elements</p>
              <p className="text-sm">• Include proper metadata</p>
              <p className="text-sm">• Ensure accessibility</p>
              <p className="text-sm">• Validate regularly</p>
              <p className="text-sm">• Use external CSS</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}