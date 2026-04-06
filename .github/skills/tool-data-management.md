# Tool Data Management

This skill covers how tool metadata is structured and used throughout DevTools Hub.

## Tools Data File

All tool metadata is defined in `src/data/tools.ts`.

### Tool Interface

```typescript
export interface Tool {
  id: string           // Unique identifier (used in URL slug)
  title: string        // Display name
  description: string  // Short description for cards
  icon: any            // Lucide icon component
  href: string         // Route path
  category: string     // Category grouping
  featured?: boolean   // Show in featured section
}
```

### Tool Entry Example

```typescript
{
  id: "json-formatter",
  title: "JSON Formatter",
  description: "Format and beautify JSON data with syntax highlighting",
  icon: FileText,
  href: "/tools/json-formatter",
  category: "Formatter",
  featured: true
}
```

## Categories

```typescript
export const categories = [
  "All",
  "Formatter", 
  "Validator",
  "Converter",
  "Generator",
  "Utility"
]
```

| Category | Purpose | Example Tools |
|----------|---------|---------------|
| Formatter | Code beautification | JSON, HTML, CSS, SQL formatters |
| Validator | Syntax validation | JSON, HTML, CSS validators |
| Converter | Data transformation | Base64, URL encoding, Hash generator |
| Generator | Generate content | Password, UUID, Lorem ipsum, QR code |
| Utility | General tools | Color picker, Regex tester, JWT decoder |

## Exported Arrays

```typescript
// All tools
export const tools: Tool[] = [...]

// Category names for filtering
export const categories = ["All", "Formatter", ...]

// Featured tools for homepage hero
export const featuredTools = tools.filter(tool => tool.featured)

// Popular tools for homepage grid
export const popularTools = [
  ...tools.filter(tool => tool.featured),
  ...tools.filter(tool => 
    !tool.featured && 
    ["Generator", "Utility"].includes(tool.category)
  ).slice(0, 6)
]
```

## Usage in Components

### Homepage (Index.tsx)

```tsx
import { featuredTools, popularTools, categories } from "@/data/tools"

// Featured section
{featuredTools.map((tool) => (
  <ToolCard key={tool.id} {...tool} />
))}

// Popular section with category filter
const filteredTools = selectedCategory === "All" 
  ? popularTools 
  : popularTools.filter(tool => tool.category === selectedCategory)
```

### Category Pages

```tsx
import { tools } from "@/data/tools"

const formatterTools = tools.filter(tool => tool.category === "Formatter")
```

### Header Search

```tsx
import { tools } from "@/data/tools"

<CommandGroup heading="Tools">
  {tools.map((tool) => (
    <CommandItem
      key={tool.id}
      value={`${tool.title} ${tool.description}`}
      onSelect={() => navigate(tool.href)}
    >
      <tool.icon className="h-4 w-4" />
      <div>
        <div>{tool.title}</div>
        <div className="text-xs text-muted-foreground">{tool.description}</div>
      </div>
    </CommandItem>
  ))}
</CommandGroup>
```

## Adding a New Tool

### 1. Add to tools array

```typescript
// src/data/tools.ts
export const tools: Tool[] = [
  // ... existing tools
  {
    id: "your-tool-id",
    title: "Your Tool Name",
    description: "Brief description of the tool",
    icon: YourIcon, // Import from lucide-react
    href: "/tools/your-tool-slug",
    category: "Utility", // or Formatter, Validator, etc.
    featured: true // optional
  }
]
```

### 2. Import the icon

```typescript
import { 
  FileText, Code, Database, Hash, Image,
  // Add your icon here
  YourIcon
} from "lucide-react"
```

## Icon Selection Guide

Choose icons that represent the tool's function:

| Tool Type | Suggested Icons |
|-----------|-----------------|
| Formatters | FileText, Code, FileCode |
| Validators | CheckCircle, Search, AlertCircle |
| Converters | RefreshCw, Binary, Hash, Globe |
| Generators | Zap, Lock, Dice, Key |
| Utilities | Palette, Clock, Image, Link |

## Tool State Pattern

Individual tool pages manage their own state:

```tsx
export default function ToolName() {
  // Input state
  const [input, setInput] = useState("")
  
  // Output state
  const [output, setOutput] = useState("")
  
  // Error state
  const [error, setError] = useState("")
  
  // Tool-specific state
  const [options, setOptions] = useState({...})
  
  // Toast notifications
  const { toast } = useToast()
  
  // Core action handler
  const handleAction = () => {
    try {
      if (!input.trim()) {
        setError("Please enter input")
        return
      }
      
      // Tool logic
      const result = processInput(input, options)
      
      setOutput(result)
      setError("")
      
      toast({
        title: "Success",
        description: "Action completed",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred")
      setOutput("")
    }
  }
}
```

## Data Flow Diagram

```
tools.ts (source of truth)
    │
    ├── Index.tsx
    │   ├── featuredTools → Featured section
    │   ├── popularTools → Popular grid
    │   └── categories → Filter buttons
    │
    ├── Header.tsx
    │   └── tools → Command search
    │
    ├── Formatters.tsx
    │   └── tools.filter(category === "Formatter")
    │
    ├── Validators.tsx
    │   └── tools.filter(category === "Validator")
    │
    └── ... other category pages
```

## Maintaining Consistency

### ID Conventions
- Use lowercase kebab-case
- Match the URL slug: `id: "json-formatter"` → `/tools/json-formatter`

### Description Guidelines
- Keep under 60 characters
- Use action verbs: "Format", "Generate", "Convert", "Validate"
- Mention key features

### Featured Selection
- 12-15 tools maximum for homepage balance
- Mix of categories
- Most popular/useful tools

## Search Optimization

The command search matches against both `title` and `description`:

```tsx
value={`${tool.title} ${tool.description}`}
```

Write descriptions with searchable terms users might type.
