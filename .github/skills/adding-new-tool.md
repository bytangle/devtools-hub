# Adding a New Developer Tool

This skill guides you through adding a new tool to DevTools Hub. Follow this pattern to ensure consistency across the codebase.

## Overview

DevTools Hub is a React/TypeScript/Vite application with ShadCN UI components. Each tool follows a consistent structure with:
- A dedicated page component in `src/pages/tools/`
- An entry in `src/data/tools.ts`
- A route in `src/App.tsx`
- SEO metadata via the `SEO` component

## Step-by-Step Process

### 1. Create the Tool Page Component

Create a new file in `src/pages/tools/`. Use this template:

```tsx
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { YourIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function YourToolName() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleAction = () => {
    // Your tool logic here
    toast({
      title: "Action completed",
      description: "Description of what happened",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Your Tool Name - Brief Description"
        description="Detailed description for SEO (150-160 chars)"
        keywords="keyword1, keyword2, keyword3"
        canonicalUrl="/tools/your-tool-slug"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tool Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <YourIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Your Tool Name</h1>
            </div>
            <p className="text-muted-foreground">
              Brief description of what this tool does.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Feature 1</Badge>
              <Badge variant="secondary">Feature 2</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAction} className="bg-gradient-primary">
                  Primary Action
                </Button>
                <Button variant="outline">Secondary Action</Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          {/* Use CodeEditor for code input/output */}
          {/* Use appropriate UI components for your tool */}
        </div>
      </div>
    </div>
  )
}
```

### 2. Add Tool to Data Configuration

Edit `src/data/tools.ts`:

```typescript
{
  id: "your-tool-slug",
  title: "Your Tool Name",
  description: "Brief description for card display",
  icon: YourIcon, // From lucide-react
  href: "/tools/your-tool-slug",
  category: "Formatter" | "Validator" | "Converter" | "Generator" | "Utility",
  featured?: true // Optional: show on homepage featured section
}
```

**Categories:**
- `Formatter` - Code beautification/formatting tools
- `Validator` - Syntax/structure validation tools
- `Converter` - Data transformation tools
- `Generator` - Random/data generation tools
- `Utility` - General purpose developer tools

### 3. Add Route to App.tsx

Add import and route:

```tsx
// At top with other imports
import YourToolName from "./pages/tools/YourToolName"

// In Routes component
<Route path="/tools/your-tool-slug" element={<YourToolName />} />
```

### 4. Required Components

**For code input/output:**
```tsx
import { CodeEditor } from "@/components/ui/code-editor"

<CodeEditor
  value={input}
  onChange={setInput}
  placeholder="Enter your code..."
  language="json" | "html" | "css" | "sql" | "text"
  title="Input Title"
  error={error}
  readOnly={false}
/>
```

**For tree visualization (JSON/HTML/CSS):**
```tsx
import { TreeView } from "@/components/ui/tree-view"
import { parseJsonToTree, parseHtmlToTree } from "@/utils/tree-parsers"

<TreeView 
  data={parseJsonToTree(jsonString)} 
  onNodeClick={(node) => console.log(node)}
/>
```

## Tool Page Structure

1. **Header Section** - Icon + title + description + badges
2. **Action Card** - Primary and secondary action buttons
3. **Main Content** - Input/output areas (often side-by-side grid)
4. **Info Cards** - Features, tips, how-to-use sections

## Common Patterns

### Input/Output Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <CodeEditor value={input} onChange={setInput} />
  <CodeEditor value={output} readOnly />
</div>
```

### Error Handling
```tsx
const [error, setError] = useState("")

// In your handler:
try {
  // logic...
  setError("")
} catch (err) {
  setError(err instanceof Error ? err.message : "An error occurred")
}

// Pass error to CodeEditor
<CodeEditor error={error} />
```

### Toast Notifications
```tsx
const { toast } = useToast()

toast({
  title: "Success title",
  description: "Success description",
})

// For errors:
toast({
  title: "Error",
  description: "Error message",
  variant: "destructive",
})
```

### Clipboard Operations
```tsx
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Content copied successfully",
    })
  } catch (err) {
    toast({
      title: "Copy failed",
      description: "Failed to copy to clipboard",
      variant: "destructive",
    })
  }
}
```

## Checklist

- [ ] Create page component in `src/pages/tools/`
- [ ] Add entry to `src/data/tools.ts`
- [ ] Add route in `src/App.tsx`
- [ ] Include SEO component with proper metadata
- [ ] Use consistent header structure with icon
- [ ] Add appropriate badges
- [ ] Implement toast notifications for actions
- [ ] Handle errors gracefully
- [ ] Test dark mode appearance
- [ ] Test responsive behavior
