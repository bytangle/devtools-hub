import { 
  FileText, Code, Database, Hash, Image, 
  FileCode, Palette, Calculator, Lock, 
  Globe, Binary, Clock, FileImage, Search,
  Zap, CheckCircle, RefreshCw, Type, Download,
  GitCompare, Link
} from "lucide-react"

export interface Tool {
  id: string
  title: string
  description: string
  icon: any
  href: string
  category: string
  featured?: boolean
}

export const tools: Tool[] = [
  // Formatters
    {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes for text and URLs",
    icon: FileImage,
    href: "/tools/qr-generator",
    category: "Utility",
    featured: true,
  },
    // Generators
    {
    id: "image-optimizer",
    title: "Image Optimizer",
    description: "Compress and optimize images",
    icon: Image,
    href: "/tools/image-optimizer",
    category: "Utility",
    featured: true,
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Create secure random passwords",
    icon: Lock,
    href: "/tools/password-generator",
    category: "Generator",
    featured: true
  },
    {
    id: "base64-encode",
    title: "Base64 Encoder",
    description: "Encode text and files to Base64 format",
    icon: Binary,
    href: "/tools/base64-encode",
    category: "Converter",
    featured: true
  },
  {
    id: "base64-decode",
    title: "Base64 Decoder",
    description: "Decode Base64 strings back to original format",
    icon: RefreshCw,
    href: "/tools/base64-decode",
    category: "Converter",
    featured: true
  },
    {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test and debug regular expressions",
    icon: Search,
    href: "/tools/regex-tester",
    category: "Utility"
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format and beautify JSON data with syntax highlighting",
    icon: FileText,
    href: "/tools/json-formatter",
    category: "Formatter",
    featured: true
  },
  {
    id: "lorem-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for designs",
    icon: Type,
    href: "/tools/lorem-generator",
    category: "Generator"
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate version 4 UUIDs",
    icon: Zap,
    href: "/tools/uuid-generator",
    category: "Generator",
    featured: true
  },
  {
    id: "html-formatter",
    title: "HTML Formatter",
    description: "Clean and format HTML code with proper indentation",
    icon: Code,
    href: "/tools/html-formatter",
    category: "Formatter",
    featured: true
  },
  {
    id: "css-formatter",
    title: "CSS Formatter",
    description: "Beautify and organize CSS stylesheets",
    icon: Palette,
    href: "/tools/css-formatter",
    category: "Formatter"
  },
  {
    id: "sql-formatter",
    title: "SQL Formatter",
    description: "Format SQL queries with proper structure",
    icon: Database,
    href: "/tools/sql-formatter",
    category: "Formatter",
    featured: true
  },

  // Validators
  {
    id: "json-validator",
    title: "JSON Validator",
    description: "Validate JSON syntax and structure",
    icon: CheckCircle,
    href: "/tools/json-validator",
    category: "Validator",
    featured: true
  },
  {
    id: "html-validator",
    title: "HTML Validator",
    description: "Check HTML markup for errors and warnings",
    icon: Search,
    href: "/tools/html-validator",
    category: "Validator"
  },
  {
    id: "css-validator",
    title: "CSS Validator",
    description: "Validate CSS syntax and properties",
    icon: CheckCircle,
    href: "/tools/css-validator",
    category: "Validator"
  },

  // Converters
  {
    id: "url-encode",
    title: "URL Encoder",
    description: "Encode URLs for safe transmission",
    icon: Globe,
    href: "/tools/url-encode",
    category: "Converter"
  },
  {
    id: "url-decode",
    title: "URL Decoder",
    description: "Decode URL-encoded strings",
    icon: Globe,
    href: "/tools/url-decode",
    category: "Converter"
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256 hashes",
    icon: Hash,
    href: "/tools/hash-generator",
    category: "Converter"
  },

  // Utilities
  {
    id: "color-picker",
    title: "Color Picker",
    description: "Pick colors and get HEX, RGB, HSL values",
    icon: Palette,
    href: "/tools/color-picker",
    category: "Utility"
  },

  {
    id: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert between timestamps and dates",
    icon: Clock,
    href: "/tools/timestamp-converter",
    category: "Utility"
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and verify JWT tokens",
    icon: Lock,
    href: "/tools/jwt-decoder",
    category: "Utility",
    featured: true
  },
  {
    id: "markdown-preview",
    title: "Markdown Preview",
    description: "Preview markdown with live rendering",
    icon: FileText,
    href: "/tools/markdown-preview",
    category: "Utility",
    featured: true
  },
  {
    id: "case-converter",
    title: "Case Converter",
    description: "Convert text between different cases",
    icon: Type,
    href: "/tools/case-converter",
    category: "Utility"
  },
  {
    id: "minify-css",
    title: "CSS Minifier",
    description: "Minify CSS for production use",
    icon: Code,
    href: "/tools/minify-css",
    category: "Formatter",
    featured: true
  },
  {
    id: "minify-js",
    title: "JavaScript Minifier", 
    description: "Minify JavaScript for production use",
    icon: FileCode,
    href: "/tools/minify-js",
    category: "Formatter",
    featured: true
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    description: "Create short URLs and track analytics",
    icon: Link,
    href: "/tools/url-shortener",
    category: "Utility",
    featured: true
  },
  {
    id: "text-counter",
    title: "Text Counter",
    description: "Count characters, words, and lines in text",
    icon: Type,
    href: "/tools/text-counter",
    category: "Utility",
    featured: true
  },
  {
    id: "diff-checker",
    title: "Diff Checker",
    description: "Compare two texts and highlight differences",
    icon: GitCompare,
    href: "/tools/diff-checker",
    category: "Utility",
    featured: true
  }
]

export const categories = [
  "All",
  "Formatter", 
  "Validator",
  "Converter",
  "Generator",
  "Utility"
]

export const featuredTools = tools.filter(tool => tool.featured)
export const popularTools = [
  ...tools.filter(tool => tool.featured),
  ...tools.filter(tool => !tool.featured && ["Generator", "Utility"].includes(tool.category)).slice(0, 6)
]