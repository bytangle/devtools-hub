# SEO Guidelines and Best Practices

This skill covers SEO implementation for DevTools Hub tool pages.

## SEO Component

Every tool page must include the `SEO` component from `@/components/SEO.tsx`.

```tsx
import { SEO } from "@/components/SEO"

<SEO 
  title="Tool Name - Brief Action Description"
  description="Detailed description of what the tool does (150-160 characters)"
  keywords="keyword1, keyword2, keyword3, keyword phrase"
  canonicalUrl="/tools/tool-slug"
  type="website"
/>
```

## Title Best Practices

### Format
`Tool Name - Action Description | DevTools Hub`

The component auto-appends "- DevTools Hub" if not present.

### Examples
- ✅ "JSON Formatter & Beautifier - Format and Validate JSON Online"
- ✅ "Password Generator - Create Strong & Secure Passwords Online"
- ✅ "Base64 Encoder - Encode Text and Files to Base64 Online"
- ❌ "JSON Formatter" (too short, no description)
- ❌ "The Best JSON Formatting Tool Ever" (keyword stuffing)

### Guidelines
- Keep under 60 characters for full display in SERPs
- Include primary keyword near the beginning
- Add action verb (Format, Generate, Convert, Validate, etc.)
- Include "Online" or "Free" when appropriate

## Description Best Practices

### Length
150-160 characters maximum (will be truncated in search results)

### Format
Start with action phrase, include key features, end with benefit.

### Examples
- ✅ "Free online JSON formatter and validator. Format, beautify, minify and validate JSON data with syntax highlighting and tree view. Professional developer tool."
- ✅ "Generate strong, secure passwords with customizable length and character sets. Include uppercase, lowercase, numbers, and symbols for maximum security."

### Guidelines
- Include primary keyword in first 50 characters
- Mention key features (2-3 max)
- Include "free" or "online" when applicable
- End with benefit or use case
- Write for humans first, search engines second

## Keywords Best Practices

Comma-separated list of relevant keywords and phrases.

### Example
```tsx
keywords="json formatter, json beautifier, json validator, json minifier, json parser, json viewer, format json online"
```

### Guidelines
- Include primary keyword first
- Add variations (formatter, beautifier, etc.)
- Include action phrases ("format json online")
- Include related terms
- Limit to 8-12 keywords
- No keyword stuffing

## Canonical URL

Always set to the tool's path:

```tsx
canonicalUrl="/tools/tool-slug"
```

This is combined with `window.location.origin` to create the full URL.

## Generated Meta Tags

The SEO component generates:

```html
<title>{fullTitle}</title>
<meta name="description" content="{description}" />
<meta name="keywords" content="{keywords}" />
<link rel="canonical" href="{fullCanonicalUrl}" />

<!-- Open Graph -->
<meta property="og:title" content="{fullTitle}" />
<meta property="og:description" content="{description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{fullCanonicalUrl}" />
<meta property="og:site_name" content="DevTools Hub" />

<!-- Twitter -->
<meta name="twitter:title" content="{fullTitle}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:card" content="summary_large_image" />

<!-- Additional -->
<meta name="robots" content="index, follow" />
<meta name="author" content="DevTools Hub" />
```

## Page Content SEO

### Heading Structure

```tsx
// ONE h1 per page - main tool name
<h1 className="text-3xl font-bold">JSON Formatter & Validator</h1>

// h2 for major sections
<h2 className="text-2xl font-semibold">Features</h2>

// h3 for subsections
<h3 className="text-lg">How to Use</h3>
```

### Descriptive Content

Include text descriptions that help search engines understand the page:

```tsx
<p className="text-muted-foreground">
  Format, validate, and beautify your JSON data with syntax highlighting and error detection.
</p>
```

### Feature Lists

```tsx
<CardContent className="space-y-2 text-sm">
  <div>✓ JSON formatting with custom indentation</div>
  <div>✓ JSON validation and error detection</div>
  <div>✓ Minification for production use</div>
</CardContent>
```

## Robots Configuration

`/public/robots.txt` allows all crawlers:

```txt
User-agent: *
Allow: /
```

## Category Page SEO

Category pages should also have proper SEO:

```tsx
// Formatters.tsx example
<SEO 
  title="Code Formatters - JSON, HTML, CSS, SQL Beautifiers"
  description="Professional code formatting tools for JSON, HTML, CSS, and SQL. Beautify and organize your code with proper indentation and syntax highlighting."
  keywords="code formatter, json formatter, html formatter, css formatter, sql formatter, code beautifier"
  canonicalUrl="/formatters"
/>
```

## Homepage SEO

```tsx
<SEO 
  title="DevTools Hub - Code Formatter, JSON Beautifier & Developer Utilities"
  description="Professional developer tools including JSON formatter, code beautifier, XML viewer, base64 converter and more. Clean, fast, and free online utilities."
  keywords="json formatter, code beautifier, developer tools, base64 converter, html formatter, css minifier, password generator, regex tester"
  canonicalUrl="/"
/>
```

## Performance Considerations

1. **SSR/SSG Note**: This is a client-rendered SPA, so search engine compatibility relies on JavaScript rendering support
2. **Core Web Vitals**: Keep page lightweight for fast LCP
3. **Accessible**: Use semantic HTML for better crawling

## Checklist for New Tools

- [ ] SEO component added with all props
- [ ] Title under 60 characters with primary keyword
- [ ] Description 150-160 chars with features/benefits
- [ ] 8-12 relevant keywords
- [ ] Canonical URL matches route
- [ ] Single h1 with tool name
- [ ] Descriptive paragraphs about the tool
- [ ] Feature list in accessible HTML
