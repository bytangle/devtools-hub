# Routing Architecture

This skill explains the routing structure and navigation in DevTools Hub.

## Tech Stack

- **React Router v6** - Client-side routing
- **react-router-dom** - DOM bindings

## Route Structure

Routes are defined in `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"

<BrowserRouter>
  <Routes>
    {/* Home */}
    <Route path="/" element={<Index />} />
    
    {/* Category Pages */}
    <Route path="/formatters" element={<Formatters />} />
    <Route path="/validators" element={<Validators />} />
    <Route path="/converters" element={<Converters />} />
    <Route path="/generators" element={<Generators />} />
    
    {/* Individual Tool Pages */}
    <Route path="/tools/json-formatter" element={<JsonFormatter />} />
    <Route path="/tools/html-formatter" element={<HtmlFormatter />} />
    {/* ... more tools */}
    
    {/* 404 Not Found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

## URL Structure

### Pattern
```
/                          → Home page
/{category}                → Category listing (formatters, validators, etc.)
/tools/{tool-slug}         → Individual tool page
```

### Tool Slugs
Use lowercase kebab-case matching the tool id in `tools.ts`:

| Tool | Slug | Route |
|------|------|-------|
| JSON Formatter | json-formatter | /tools/json-formatter |
| Base64 Encoder | base64-encode | /tools/base64-encode |
| Password Generator | password-generator | /tools/password-generator |

## Navigation Components

### Header Navigation

The header (`src/components/layout/header.tsx`) contains:

1. **Logo Link** - Returns to home
2. **Command Search** - Opens search dialog
3. **Category Links** - Navigate to category pages
4. **Theme Toggle** - Light/dark mode

```tsx
// Category navigation links in header
<nav className="hidden md:flex items-center space-x-1">
  <Button variant="ghost" size="sm" asChild>
    <Link to="/formatters">Formatters</Link>
  </Button>
  <Button variant="ghost" size="sm" asChild>
    <Link to="/validators">Validators</Link>
  </Button>
  {/* ... */}
</nav>
```

### Tool Card Links

ToolCard components link to individual tools:

```tsx
import { Link } from "react-router-dom"

<Button variant="ghost" size="sm" asChild>
  <Link to={href}>Open</Link>
</Button>
```

### Command Palette Search

The header includes a searchable command palette:

```tsx
import { CommandDialog, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

<CommandItem
  value={`${tool.title} ${tool.description}`}
  onSelect={() => {
    navigate(tool.href)
    setOpen(false)
  }}
>
```

## Adding New Routes

### 1. Import the Component

```tsx
import NewTool from "./pages/tools/NewTool"
```

### 2. Add the Route

```tsx
<Route path="/tools/new-tool-slug" element={<NewTool />} />
```

### 3. Update tools.ts

```typescript
{
  id: "new-tool-slug",
  title: "New Tool",
  href: "/tools/new-tool-slug",
  // ...
}
```

The command search automatically picks up new tools from the `tools` array.

## Programmatic Navigation

```tsx
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

// Navigate to a route
navigate("/tools/json-formatter")

// Navigate with options
navigate("/", { replace: true })

// Go back
navigate(-1)
```

## Link vs Navigate

```tsx
// Declarative (for clickable elements)
import { Link } from "react-router-dom"
<Link to="/path">Click me</Link>

// Imperative (for programmatic navigation)
import { useNavigate } from "react-router-dom"
const navigate = useNavigate()
navigate("/path")
```

## Category Page Pattern

Category pages filter tools by category:

```tsx
// src/pages/Formatters.tsx
import { tools } from "@/data/tools"
import { ToolCard } from "@/components/tool-card"

const formatterTools = tools.filter(tool => tool.category === "Formatter")

{formatterTools.map((tool) => (
  <ToolCard 
    key={tool.id} 
    {...tool}
  />
))}
```

## 404 Handling

The catch-all route handles unknown paths:

```tsx
<Route path="*" element={<NotFound />} />
```

NotFound page provides a link back to home.

## Deployment Configuration

For Vercel deployment, `vercel.json` handles SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes are handled by React Router on the client.

## Route Organization Diagram

```
App.tsx (root)
├── / (Index.tsx)
│   ├── Featured Tools
│   └── Popular Tools (filterable)
├── /formatters (Formatters.tsx)
├── /validators (Validators.tsx)
├── /converters (Converters.tsx)
├── /generators (Generators.tsx)
├── /tools/
│   ├── json-formatter
│   ├── html-formatter
│   ├── css-formatter
│   ├── sql-formatter
│   ├── base64-encode
│   ├── base64-decode
│   ├── password-generator
│   └── ... (26+ tool routes)
└── * (NotFound.tsx)
```

## Best Practices

1. **Consistent Slugs**: Tool slug in URL should match `id` in tools.ts
2. **Canonical URLs**: Use SEO component with matching canonicalUrl
3. **Accessible Links**: Use semantic Link/Button components
4. **Loading States**: Consider route-level loading (not currently implemented)
5. **Deep Linking**: All tool routes should work with direct URL access
