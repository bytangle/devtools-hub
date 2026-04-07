# Development Workflow

This skill covers the development workflow, commands, and common tasks for devv.tools.

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Setup
```bash
# Clone and install
git clone <repo-url>
cd devtools_hub
bun install  # or npm install
```

### Development Server
```bash
# Start dev server (http://localhost:8080)
bun dev
```

### Build & Preview
```bash
# Production build
bun build

# Preview production build
bun preview

# Development build (with source maps)
bun build:dev
```

### Linting
```bash
bun lint
```

## File Creation Guide

### Creating a New Tool Page

1. **Create the component file**
   ```
   src/pages/tools/YourTool.tsx
   ```

2. **Follow the template** (see adding-new-tool.md skill)

3. **Register in tools.ts**
   ```typescript
   // src/data/tools.ts
   {
     id: "your-tool",
     title: "Your Tool",
     description: "Description",
     icon: IconName,
     href: "/tools/your-tool",
     category: "Utility",
     featured: false
   }
   ```

4. **Add route in App.tsx**
   ```tsx
   import YourTool from "./pages/tools/YourTool"
   // ...
   <Route path="/tools/your-tool" element={<YourTool />} />
   ```

### Adding a New UI Component

ShadCN components are added via the CLI:

```bash
# Add a component from shadcn/ui
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add card
bunx --bun shadcn@latest add dialog
```

Components are added to `src/components/ui/`.

For custom components, create in `src/components/`:
```
src/components/your-component.tsx
```

## Import Conventions

### Path Aliases
Always use the `@/` alias for imports:
```tsx
// ✅ Good
import { Button } from "@/components/ui/button"
import { tools } from "@/data/tools"
import { cn } from "@/lib/utils"

// ❌ Bad
import { Button } from "../../components/ui/button"
```

### Import Order
1. External dependencies (react, react-router, etc.)
2. Internal components
3. Hooks
4. Data/utilities
5. Types

```tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { useToast } from "@/hooks/use-toast"

import { tools } from "@/data/tools"
import { cn } from "@/lib/utils"
```

## Testing Changes

### Manual Testing Checklist
- [ ] Tool works correctly
- [ ] Dark mode appearance
- [ ] Mobile responsive
- [ ] Toast notifications appear
- [ ] Errors handled gracefully
- [ ] Copy to clipboard works
- [ ] File upload/download (if applicable)
- [ ] Command search finds the tool

### Browser Testing
1. Open `http://localhost:8080`
2. Navigate to your tool
3. Test all functionality
4. Toggle dark mode
5. Resize browser for responsive test

## Debugging Tips

### React Developer Tools
Install the React DevTools browser extension for component inspection.

### Console Logging
```tsx
console.log('Debug:', variable)
```

### Toast for User Feedback
```tsx
toast({
  title: "Debug Info",
  description: JSON.stringify(data),
})
```

### Check Build Output
```bash
bun build
# Check dist/ folder for output
ls -la dist/
```

## Common Issues

### Import Errors
```
Module not found: Can't resolve '@/...'
```
**Solution**: Check `tsconfig.json` paths configuration matches `vite.config.ts` alias.

### Type Errors
```
Property 'x' does not exist on type 'y'
```
**Solution**: Check interface definitions in component props.

### Hydration Errors
```
Text content does not match server-rendered HTML
```
**Solution**: This is a CSR app, so this shouldn't happen. If it does, check for browser-only APIs (like `window`) used during render.

### Dark Mode Issues
**Problem**: Colors not updating in dark mode
**Solution**: Use CSS custom properties (`text-foreground`, `bg-background`) instead of hardcoded colors.

## Git Workflow

### Branching
```bash
# Create feature branch
git checkout -b feature/new-tool-name

# Or fix branch
git checkout -b fix/tool-name-issue
```

### Commits
Use conventional commits:
```
feat: add new tool xyz
fix: correct json formatter edge case
style: improve dark mode colors
docs: update readme
chore: update dependencies
```

### Pull Requests
1. Create feature branch
2. Make changes
3. Test locally
4. Push and create PR
5. Review and merge

## Updating Dependencies

```bash
# Check for updates
bun outdated

# Update all
bun update

# Update specific package
bun add package-name@latest
```

## Adding New Dependencies

```bash
# Production dependency
bun add package-name

# Dev dependency
bun add -D package-name
```

Common dependencies for tools:
- `date-fns` - Date manipulation
- `uuid` - UUID generation (already available via crypto API)
- Specific libraries for specialized tools

## Project Commands Summary

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun preview` | Preview production build |
| `bun lint` | Run ESLint |
| `bunx --bun shadcn@latest add [component]` | Add ShadCN component |
