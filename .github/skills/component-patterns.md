# Component Patterns and Conventions

This skill covers the UI component patterns and conventions used in DevTools Hub.

## Component Library

DevTools Hub uses ShadCN UI components built on Radix primitives with Tailwind CSS styling. Components are located in `src/components/ui/`.

## Core Custom Components

### CodeEditor (`src/components/ui/code-editor.tsx`)

A syntax-highlighted code editor with file upload, download, copy, and clear functionality.

```tsx
import { CodeEditor } from "@/components/ui/code-editor"

<CodeEditor
  value={input}
  onChange={setInput}
  placeholder="Enter code here..."
  language="json" // json, html, xml, css, sql, text
  title="Input JSON"
  error={error}  // Shows error message styling
  readOnly={false}
/>
```

**Features:**
- Syntax highlighting (JSON, HTML, XML, CSS, SQL)
- Line numbers
- Copy to clipboard button
- Download file button
- File upload button
- Clear button
- Error state display
- Dark mode support

### TreeView (`src/components/ui/tree-view.tsx`)

Expandable tree visualization for structured data.

```tsx
import { TreeView } from "@/components/ui/tree-view"
import { parseJsonToTree, parseHtmlToTree } from "@/utils/tree-parsers"

<TreeView 
  data={parseJsonToTree(jsonString)} 
  onNodeClick={(node) => handleNodeClick(node)}
  className="max-h-96"
/>
```

**TreeNode Interface:**
```typescript
interface TreeNode {
  id: string
  label: string
  type: 'object' | 'array' | 'property' | 'value' | 'tag' | 'attribute' | 'text' | 'rule' | 'selector' | 'declaration'
  children?: TreeNode[]
  value?: any
  expanded?: boolean
}
```

### ToolCard (`src/components/tool-card.tsx`)

Card component for displaying tools on listing pages.

```tsx
import { ToolCard } from "@/components/tool-card"

<ToolCard 
  title="Tool Name"
  description="Tool description"
  icon={IconComponent}
  href="/tools/tool-slug"
  category="Formatter"
/>
```

### Header (`src/components/layout/header.tsx`)

Main application header with navigation and command search.

```tsx
import { Header } from "@/components/layout/header"

<Header />
```

**Features:**
- Logo/brand link
- Command palette search (Cmd/Ctrl+K)
- Category navigation links
- Theme toggle

### SEO (`src/components/SEO.tsx`)

SEO metadata component using react-helmet-async.

```tsx
import { SEO } from "@/components/SEO"

<SEO 
  title="Page Title - Description"
  description="Meta description (150-160 chars)"
  keywords="keyword1, keyword2, keyword3"
  canonicalUrl="/tools/page-slug"
  type="website" // or "article"
/>
```

### ThemeProvider & ThemeToggle

Theme management components for light/dark mode.

```tsx
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"

// App.tsx wrap
<ThemeProvider defaultTheme="light" storageKey="devtools-theme">
  {/* app content */}
</ThemeProvider>

// Use toggle anywhere
<ThemeToggle />
```

## ShadCN UI Components Used

All components are in `src/components/ui/`:

### Form Elements
- `button.tsx` - Button variants (default, outline, ghost, link, destructive)
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line text input
- `checkbox.tsx` - Checkbox with label
- `radio-group.tsx` - Radio button group
- `select.tsx` - Dropdown select
- `slider.tsx` - Range slider
- `switch.tsx` - Toggle switch
- `label.tsx` - Form labels
- `form.tsx` - Form with react-hook-form + zod validation

### Display Components
- `card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent
- `badge.tsx` - Status badges
- `alert.tsx` - Alert messages
- `separator.tsx` - Horizontal/vertical separators
- `tabs.tsx` - Tab navigation
- `accordion.tsx` - Collapsible sections
- `avatar.tsx` - User avatars
- `tooltip.tsx` - Hover tooltips
- `progress.tsx` - Progress bars

### Overlays
- `dialog.tsx` - Modal dialogs
- `sheet.tsx` - Slide-out panels
- `popover.tsx` - Floating content
- `dropdown-menu.tsx` - Dropdown menus
- `command.tsx` - Command palette (used for search)
- `toast.tsx` & `toaster.tsx` - Toast notifications

### Layout
- `scroll-area.tsx` - Scrollable container
- `resizable.tsx` - Resizable panels
- `collapsible.tsx` - Collapsible content

## Button Usage Patterns

```tsx
// Primary action - gradient background
<Button className="bg-gradient-primary">
  <Icon className="h-4 w-4 mr-2" />
  Primary Action
</Button>

// Secondary action - outline
<Button variant="outline">Secondary Action</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost button (minimal)
<Button variant="ghost" size="sm">Link</Button>

// Icon-only button
<Button variant="outline" size="icon">
  <Copy className="h-4 w-4" />
</Button>
```

## Card Layout Pattern

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg flex items-center">
      <Icon className="h-5 w-5 mr-2 text-primary" />
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    <div>✓ Feature item</div>
    <div>✓ Another feature</div>
  </CardContent>
</Card>
```

## Grid Layout Patterns

```tsx
// Two-column responsive grid
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left side */}
  {/* Right side */}
</div>

// Three-column grid for info cards
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// Tool listing grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {tools.map(tool => <ToolCard key={tool.id} {...tool} />)}
</div>
```

## Toast Notifications

```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Success
toast({
  title: "Success",
  description: "Operation completed successfully",
})

// Error
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
})
```

## Icon Usage

All icons from `lucide-react`. Common icons:

```tsx
import { 
  FileText, Code, Database, Hash, Image,
  FileCode, Palette, Calculator, Lock, 
  Globe, Binary, Clock, FileImage, Search,
  Zap, CheckCircle, RefreshCw, Type, Download,
  GitCompare, Link, Copy, Upload, RotateCcw,
  AlertCircle, ChevronRight, ChevronDown
} from "lucide-react"

// Standard icon sizing
<Icon className="h-4 w-4" />  // Small (buttons)
<Icon className="h-5 w-5" />  // Medium (card headers)
<Icon className="h-6 w-6" />  // Large (page headers)
<Icon className="h-8 w-8" />  // XL (hero sections)
```

## Utility Function

```tsx
import { cn } from "@/lib/utils"

// Combine class names conditionally
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```
