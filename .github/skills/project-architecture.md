# Project Architecture Overview

This skill provides a comprehensive overview of the DevTools Hub architecture.

## What is DevTools Hub?

DevTools Hub is a collection of free, browser-based developer tools. It provides utilities for:

- **Formatting** code (JSON, HTML, CSS, SQL)
- **Validating** syntax (JSON, HTML, CSS)
- **Converting** data (Base64, URL encoding, timestamps)
- **Generating** content (passwords, UUIDs, QR codes, Lorem ipsum)
- **Utilities** (color picker, regex tester, JWT decoder, diff checker)

All tools run entirely in the browser with no server processing required.

## Tech Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server

### UI/Styling
- **Tailwind CSS v3** - Utility-first CSS
- **ShadCN UI** - Component library built on Radix primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants

### Routing & State
- **React Router v6** - Client-side routing
- **TanStack Query (React Query)** - Server state management (if needed)
- **next-themes** - Theme (light/dark mode) management

### Libraries
- **react-hook-form** + **zod** - Form handling and validation
- **react-helmet-async** - SEO meta tag management
- **qr-code-styling** - QR code generation
- **date-fns** - Date utilities
- **recharts** - Charts (if needed)

## Directory Structure

```
devtools_hub/
├── public/
│   ├── robots.txt         # SEO robots configuration
│   └── BingSiteAuth.xml   # Bing verification
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with routes
│   ├── App.css            # App-specific styles
│   ├── index.css          # Global styles, design tokens
│   ├── vite-env.d.ts      # Vite type definitions
│   ├── components/
│   │   ├── SEO.tsx        # SEO meta tags component
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   ├── tool-card.tsx  # Tool listing card
│   │   ├── layout/
│   │   │   └── header.tsx # Main navigation header
│   │   └── ui/            # ShadCN UI components (50+)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── code-editor.tsx  # Custom component
│   │       ├── tree-view.tsx    # Custom component
│   │       └── ...
│   ├── data/
│   │   └── tools.ts       # Tool definitions and metadata
│   ├── hooks/
│   │   ├── use-mobile.tsx # Mobile breakpoint hook
│   │   └── use-toast.ts   # Toast notification hook
│   ├── lib/
│   │   └── utils.ts       # cn() utility function
│   ├── pages/
│   │   ├── Index.tsx      # Homepage
│   │   ├── Formatters.tsx # Formatter category
│   │   ├── Validators.tsx # Validator category
│   │   ├── Converters.tsx # Converter category
│   │   ├── Generators.tsx # Generator category
│   │   ├── NotFound.tsx   # 404 page
│   │   └── tools/         # Individual tool pages (26+)
│   │       ├── JsonFormatter.tsx
│   │       ├── PasswordGenerator.tsx
│   │       └── ...
│   └── utils/
│       └── tree-parsers.ts # JSON/HTML tree parsing
├── .github/
│   └── skills/            # Development skills docs
├── tailwind.config.ts     # Tailwind configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── components.json        # ShadCN UI configuration
├── package.json           # Dependencies
├── vercel.json            # Vercel deployment config
└── index.html             # HTML entry point
```

## Application Flow

```
index.html
    └── main.tsx (React mount)
        └── App.tsx (providers + routes)
            ├── ThemeProvider (dark/light mode)
            ├── QueryClientProvider (React Query)
            ├── TooltipProvider
            ├── Toaster + Sonner (notifications)
            └── BrowserRouter (React Router)
                └── Routes
                    ├── / → Index.tsx
                    ├── /{category} → Category pages
                    ├── /tools/{slug} → Tool pages
                    └── * → NotFound.tsx
```

## Component Hierarchy

```
Tool Page
├── SEO (head metadata)
├── Header (navigation)
│   ├── Logo/Home link
│   ├── Command search dialog
│   ├── Category nav links
│   └── Theme toggle
└── Main content
    ├── Tool header (icon, title, description, badges)
    ├── Action buttons card
    ├── Input/output areas
    │   ├── CodeEditor (for code tools)
    │   └── TreeView (for structured data)
    └── Info cards (features, tips)
```

## Data Flow

### Tool Configuration
```
src/data/tools.ts
    → exports tools[] array
    → used by Index.tsx (featured/popular)
    → used by category pages (filtered)
    → used by Header.tsx (search)
```

### State Management
- **Local State**: useState for tool inputs/outputs
- **Theme State**: ThemeProvider context
- **Toasts**: useToast hook for notifications
- **No Global State**: Each tool manages its own state

## Build & Development

### Commands
```bash
# Development server (port 8080)
bun dev

# Production build
bun build

# Preview production build
bun preview

# Lint
bun lint
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Path Aliases
`@/` maps to `./src/`:
```tsx
import { Button } from "@/components/ui/button"
import { tools } from "@/data/tools"
```

## Deployment

### Vercel
- Automatic deployments from Git
- SPA routing via `vercel.json`
- No serverless functions needed

### Configuration
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Key Patterns

1. **All Client-Side**: No server processing; tools run in browser
2. **Static Export**: Can be deployed as static files
3. **Category Organization**: Tools grouped by function
4. **Consistent UX**: Same header, layout, styling across all pages
5. **SEO Optimized**: Every page has meta tags
6. **Accessible**: Semantic HTML, keyboard navigation
7. **Themeable**: Full dark mode support

## Common File Locations

| What | Where |
|------|-------|
| Add new tool page | `src/pages/tools/NewTool.tsx` |
| Register tool metadata | `src/data/tools.ts` |
| Add new route | `src/App.tsx` |
| Add UI component | `src/components/ui/` |
| Modify design tokens | `src/index.css` |
| Configure Tailwind | `tailwind.config.ts` |
| Configure Vite | `vite.config.ts` |
