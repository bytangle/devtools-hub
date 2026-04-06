# Styling and Design System

This skill covers the styling conventions, design tokens, and Tailwind CSS usage in DevTools Hub.

## Tech Stack

- **Tailwind CSS v3** - Utility-first CSS
- **@tailwindcss/typography** - Prose styling
- **tailwindcss-animate** - Animation utilities
- **tailwind-merge** - Intelligent class merging
- **class-variance-authority** - Component variants

## Design Tokens (CSS Custom Properties)

All design tokens are defined in `src/index.css` using HSL format for easy theming.

### Color Tokens

```css
:root {
  /* Core */
  --background: 250 100% 99%;
  --foreground: 240 10% 3.9%;
  
  /* Primary (Purple gradient) */
  --primary: 270 95% 65%;
  --primary-glow: 270 100% 75%;
  --primary-foreground: 0 0% 100%;
  
  /* Secondary */
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 10% 3.9%;
  
  /* Muted */
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  
  /* Accent */
  --accent: 240 5% 96%;
  --accent-foreground: 240 10% 3.9%;
  
  /* Cards & Borders */
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  
  /* Semantic */
  --destructive: 0 85% 60%;
  --success: 142 76% 36%;
  --warning: 45 93% 47%;
  --info: 217 91% 60%;
  
  /* Focus ring */
  --ring: 270 95% 65%;
}
```

### Dark Mode Tokens

Dark mode is triggered by `.dark` class on `<html>`:

```css
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --border: 240 4% 16%;
  /* ... additional overrides */
}
```

### Gradients

```css
--gradient-primary: linear-gradient(135deg, hsl(270 95% 65%), hsl(280 100% 70%));
--gradient-hero: linear-gradient(135deg, hsl(270 95% 65%) 0%, hsl(280 100% 70%) 50%, hsl(290 95% 75%) 100%);
--gradient-card: linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(240 10% 98%) 100%);
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 hsl(240 10% 3.9% / 0.05);
--shadow-md: 0 4px 6px -1px hsl(240 10% 3.9% / 0.1), 0 2px 4px -1px hsl(240 10% 3.9% / 0.06);
--shadow-lg: 0 10px 15px -3px hsl(240 10% 3.9% / 0.1), 0 4px 6px -2px hsl(240 10% 3.9% / 0.05);
--shadow-glow: 0 0 20px hsl(270 95% 65% / 0.3);
```

## Tailwind Configuration

Key extensions in `tailwind.config.ts`:

```typescript
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... etc
      },
      borderRadius: {
        lg: 'var(--radius)',     // 0.75rem
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  }
}
```

## Common Utility Patterns

### Container & Spacing

```tsx
// Main content container
<div className="container mx-auto px-4 py-8">
  <div className="max-w-7xl mx-auto space-y-8">
    {/* Content */}
  </div>
</div>

// Narrower container for single-column
<div className="max-w-4xl mx-auto space-y-8">
```

### Gradient Usage

```tsx
// Primary gradient button
<Button className="bg-gradient-primary">Action</Button>

// Gradient text
<h1 className="bg-gradient-primary bg-clip-text text-transparent">
  DevTools Hub
</h1>

// Hero section background
<section className="bg-gradient-hero">
  <div className="bg-background/90 dark:bg-background/95">
```

### Card Styling

```tsx
// Standard card
<Card className="border-border/50 bg-gradient-card">

// Hoverable card (tool cards)
<Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">

// Glowing hover effect
<Button className="hover:shadow-glow transition-all duration-300">
```

### Typography

```tsx
// Page title
<h1 className="text-3xl font-bold">Title</h1>
<h1 className="text-4xl font-bold">Section Title</h1>

// Description text
<p className="text-muted-foreground">Description text</p>
<p className="text-sm text-muted-foreground">Smaller description</p>

// Code/mono text
<span className="font-mono text-sm">code here</span>
```

### Interactive States

```tsx
// Hover effects
<div className="hover:bg-muted/50 transition-colors">

// Group hover (parent triggers child)
<div className="group">
  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
```

### Responsive Design

```tsx
// Grid breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

// Show/hide based on screen size
<nav className="hidden md:flex">
<button className="md:hidden">

// Responsive text
<p className="text-lg sm:text-xl">
```

### Icon Container Pattern

```tsx
// Primary-colored icon container
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
  <Icon className="h-5 w-5 text-white" />
</div>

// Muted icon container
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
  <Icon className="h-5 w-5" />
</div>
```

### Badge Styling

```tsx
// Category badge
<Badge variant="secondary">Category Name</Badge>

// Custom styled badge
<span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
  {category}
</span>
```

## Animation Classes

From `tailwindcss-animate`:

```tsx
// Fade in/out
<div className="animate-in fade-in duration-300">
<div className="animate-out fade-out duration-300">

// Slide
<div className="animate-in slide-in-from-bottom">
<div className="animate-in slide-in-from-right">

// Built-in Tailwind
<div className="animate-spin">  // Loading spinner
<div className="animate-pulse"> // Skeleton loading
```

## Transitions

Standard transitions used throughout:

```tsx
// Color/background transitions
<div className="transition-colors">

// All properties
<div className="transition-all duration-300">

// Specific timing
<div className="transition-all duration-300 ease-in-out">
```

## Dark Mode Considerations

1. Colors auto-switch via CSS custom properties
2. Use semantic color classes (`text-foreground`, `bg-background`)
3. Background overlays: `bg-background/90 dark:bg-background/95`
4. Gradient backgrounds may need dark variant: `bg-gradient-card`

## cn() Utility

Use `cn()` from `@/lib/utils` for conditional classes:

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class another-class",
  isActive && "active-class",
  error && "border-destructive",
  className // passed prop
)} />
```

## File Structure

```
src/
  index.css        # Global styles, CSS custom properties
  App.css          # App-specific overrides (minimal)
tailwind.config.ts # Tailwind configuration
postcss.config.js  # PostCSS plugins
```
