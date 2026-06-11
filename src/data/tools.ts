import { 
  FileText, Code, Database, Hash, Image, 
  FileCode, Palette, Calculator, Lock, 
  Globe, Binary, Clock, FileImage, Search,
  Zap, CheckCircle, RefreshCw, Type, Download,
  GitCompare, Shield, Table, ArrowLeftRight,
  Sparkles, HardDrive, Braces, Key, Minimize2
} from "lucide-react"

export interface Tool {
  id: string
  title: string
  description: string
  icon: any
  href: string
  category: string
  featured?: boolean
  keywords?: string[]
}

export const tools: Tool[] = [
  // Formatters
    {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from text, URLs, and data. Create scannable QR codes instantly for free.",
    icon: FileImage,
    href: "/tools/qr-generator",
    category: "Utility",
    featured: true,
    keywords: ["qr code generator", "qr code maker", "create qr code", "qr code online", "free qr code"]
  },
    // Generators
    {
    id: "image-optimizer",
    title: "Image Optimizer",
    description: "Compress and optimize images online for free. Reduce file size while maintaining quality.",
    icon: Image,
    href: "/tools/image-optimizer",
    category: "Utility",
    featured: true,
    keywords: ["image optimizer", "compress image", "image compressor", "reduce image size", "optimize png jpg"]
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate strong, secure random passwords with custom length, symbols, and character options.",
    icon: Lock,
    href: "/tools/password-generator",
    category: "Generator",
    featured: true,
    keywords: ["password generator", "random password", "secure password", "strong password generator", "password maker"]
  },
    {
    id: "base64-encode",
    title: "Base64 Encoder",
    description: "Encode text and data to Base64 format online. Free Base64 encoding tool for developers.",
    icon: Binary,
    href: "/tools/base64-encode",
    category: "Converter",
    featured: true,
    keywords: ["base64 encoder", "base64 encode", "text to base64", "encode base64 online", "base64 converter"]
  },
  {
    id: "base64-decode",
    title: "Base64 Decoder",
    description: "Decode Base64 strings back to original text. Free online Base64 decoding tool.",
    icon: RefreshCw,
    href: "/tools/base64-decode",
    category: "Converter",
    featured: true,
    keywords: ["base64 decoder", "base64 decode", "base64 to text", "decode base64 online", "base64 decryptor"]
  },
    {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test and debug regular expressions with real-time matching and highlighting. Supports JavaScript regex.",
    icon: Search,
    href: "/tools/regex-tester",
    category: "Utility",
    keywords: ["regex tester", "regex online", "regular expression tester", "regex debugger", "test regex"]
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format, beautify, and validate JSON data online. Pretty-print JSON with syntax highlighting.",
    icon: FileText,
    href: "/tools/json-formatter",
    category: "Formatter",
    featured: true,
    keywords: ["json formatter", "json beautifier", "json pretty print", "format json online", "json viewer"]
  },
  {
    id: "lorem-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate lorem ipsum placeholder text for designs, mockups, and development.",
    icon: Type,
    href: "/tools/lorem-generator",
    category: "Generator",
    keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator", "lorem ipsum online"]
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate UUID v1, v4, v5, and v7 identifiers online. Create unique IDs for databases, APIs, and applications.",
    icon: Zap,
    href: "/tools/uuid-generator",
    category: "Generator",
    featured: true,
    keywords: ["uuid generator", "guid generator", "random uuid", "uuid v4", "uuid v7", "uuid v1", "uuid v5", "generate unique id", "uuid online", "bulk uuid generator"]
  },
  {
    id: "html-formatter",
    title: "HTML Formatter",
    description: "Format, beautify, and clean HTML code with proper indentation. Free online HTML beautifier.",
    icon: Code,
    href: "/tools/html-formatter",
    category: "Formatter",
    featured: true,
    keywords: ["html formatter", "html beautifier", "format html", "html pretty print", "html indenter"]
  },
  {
    id: "css-formatter",
    title: "CSS Formatter",
    description: "Beautify, format, and organize CSS stylesheets online. Free CSS beautifier tool.",
    icon: Palette,
    href: "/tools/css-formatter",
    category: "Formatter",
    keywords: ["css formatter", "css beautifier", "format css", "css pretty print", "beautify css"]
  },
  {
    id: "sql-formatter",
    title: "SQL Formatter",
    description: "Format and beautify SQL queries with proper indentation and structure. Free SQL beautifier.",
    icon: Database,
    href: "/tools/sql-formatter",
    category: "Formatter",
    featured: true,
    keywords: ["sql formatter", "sql beautifier", "format sql", "sql pretty print", "sql query formatter"]
  },

  // Validators
  {
    id: "json-validator",
    title: "JSON Validator",
    description: "Validate JSON syntax and structure online. Check if your JSON is valid with detailed error messages.",
    icon: CheckCircle,
    href: "/tools/json-validator",
    category: "Validator",
    featured: true,
    keywords: ["json validator", "validate json", "json checker", "json lint", "json syntax checker"]
  },
  {
    id: "html-validator",
    title: "HTML Validator",
    description: "Check and validate HTML markup for errors and warnings. Free online HTML checker.",
    icon: Search,
    href: "/tools/html-validator",
    category: "Validator",
    keywords: ["html validator", "html checker", "validate html", "html lint", "html syntax checker"]
  },
  {
    id: "css-validator",
    title: "CSS Validator",
    description: "Validate CSS syntax and properties online. Check your stylesheets for errors.",
    icon: CheckCircle,
    href: "/tools/css-validator",
    category: "Validator",
    keywords: ["css validator", "css checker", "validate css", "css lint", "css syntax checker"]
  },

  // Converters
  {
    id: "url-encode",
    title: "URL Encoder",
    description: "Encode URLs and special characters for safe web transmission. Free online URL encoding tool.",
    icon: Globe,
    href: "/tools/url-encode",
    category: "Converter",
    keywords: ["url encoder", "url encode online", "encode url", "percent encoding", "urlencode"]
  },
  {
    id: "url-decode",
    title: "URL Decoder",
    description: "Decode URL-encoded strings back to readable text. Free online URL decoder.",
    icon: Globe,
    href: "/tools/url-decode",
    category: "Converter",
    keywords: ["url decoder", "url decode online", "decode url", "percent decode", "urldecode"]
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hash values online. Free cryptographic hash calculator.",
    icon: Hash,
    href: "/tools/hash-generator",
    category: "Converter",
    keywords: ["hash generator", "md5 generator", "sha256 hash", "sha1 hash", "hash calculator online"]
  },

  // Utilities
  {
    id: "color-picker",
    title: "Color Picker",
    description: "Pick colors and convert between HEX, RGB, and HSL formats. Free online color picker tool.",
    icon: Palette,
    href: "/tools/color-picker",
    category: "Utility",
    keywords: ["color picker", "color converter", "hex to rgb", "rgb to hex", "hsl color picker"]
  },

  {
    id: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates. Free epoch converter.",
    icon: Clock,
    href: "/tools/timestamp-converter",
    category: "Utility",
    keywords: ["timestamp converter", "unix timestamp", "epoch converter", "date to timestamp", "timestamp to date"]
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and inspect JWT tokens online. View header, payload, and verify signatures.",
    icon: Lock,
    href: "/tools/jwt-decoder",
    category: "Utility",
    featured: true,
    keywords: ["jwt decoder", "jwt token decoder", "decode jwt online", "jwt debugger", "jwt viewer"]
  },
  {
    id: "markdown-preview",
    title: "Markdown Preview",
    description: "Preview and render Markdown with live editing. See formatted output in real-time.",
    icon: FileText,
    href: "/tools/markdown-preview",
    category: "Utility",
    featured: true,
    keywords: ["markdown preview", "markdown editor", "markdown viewer", "markdown renderer", "markdown online"]
  },
  {
    id: "minify-css",
    title: "CSS Minifier",
    description: "Minify and compress CSS for production. Reduce CSS file size for faster page loads.",
    icon: Code,
    href: "/tools/minify-css",
    category: "Formatter",
    featured: true,
    keywords: ["css minifier", "minify css", "css compressor", "compress css", "css minify online"]
  },
  {
    id: "minify-js",
    title: "JavaScript Minifier", 
    description: "Minify and compress JavaScript for production. Reduce JS file size for faster loading.",
    icon: FileCode,
    href: "/tools/minify-js",
    category: "Formatter",
    featured: true,
    keywords: ["javascript minifier", "js minifier", "minify js", "compress javascript", "js minify online"]
  },
  {
    id: "text-counter",
    title: "Text Counter",
    description: "Count characters, words, sentences, and lines in text. Free online word counter.",
    icon: Type,
    href: "/tools/text-counter",
    category: "Utility",
    featured: true,
    keywords: ["text counter", "word counter", "character counter", "word count online", "letter counter"]
  },
  {
    id: "diff-checker",
    title: "Diff Checker",
    description: "Compare two texts and find differences. Free online diff tool with side-by-side view.",
    icon: GitCompare,
    href: "/tools/diff-checker",
    category: "Utility",
    featured: true,
    keywords: ["diff checker", "text compare", "diff tool online", "compare text", "find differences"]
  },
  
  // New Tools
  {
    id: "text-case-converter",
    title: "Text Case Converter",
    description: "Convert text between camelCase, snake_case, PascalCase, UPPER CASE, and more formats.",
    icon: Type,
    href: "/tools/text-case-converter",
    category: "Converter",
    featured: true,
    keywords: ["case converter", "text case converter", "camelcase converter", "snake_case converter", "uppercase lowercase"]
  },
  {
    id: "base-converter",
    title: "Base Converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal. Free number base calculator.",
    icon: Binary,
    href: "/tools/base-converter",
    category: "Converter",
    keywords: ["base converter", "binary converter", "hex converter", "decimal to binary", "number base converter"]
  },
  {
    id: "yaml-formatter",
    title: "YAML Formatter",
    description: "Format, beautify, and validate YAML documents online. Free YAML formatter and validator.",
    icon: FileText,
    href: "/tools/yaml-formatter",
    category: "Formatter",
    featured: true,
    keywords: ["yaml formatter", "yaml beautifier", "format yaml", "yaml validator", "yaml pretty print"]
  },
  {
    id: "json-yaml-converter",
    title: "JSON to YAML Converter",
    description: "Convert between JSON and YAML formats instantly. Free JSON-YAML converter tool.",
    icon: ArrowLeftRight,
    href: "/tools/json-yaml-converter",
    category: "Converter",
    featured: true,
    keywords: ["json to yaml", "yaml to json", "json yaml converter", "convert json to yaml", "yaml converter"]
  },
  {
    id: "cron-builder",
    title: "Cron Expression Builder",
    description: "Build and validate cron expressions visually. Free cron job scheduler and expression generator.",
    icon: Clock,
    href: "/tools/cron-builder",
    category: "Utility",
    featured: true,
    keywords: ["cron expression builder", "cron generator", "crontab generator", "cron schedule builder", "cron job maker"]
  },
  {
    id: "unix-permissions",
    title: "Unix Permissions Calculator",
    description: "Calculate chmod values and symbolic permissions. Free Unix file permission calculator.",
    icon: Shield,
    href: "/tools/unix-permissions",
    category: "Utility",
    keywords: ["chmod calculator", "unix permissions", "file permissions calculator", "chmod command", "permission calculator"]
  },
  {
    id: "csv-json-converter",
    title: "CSV to JSON Converter",
    description: "Convert between CSV and JSON formats online. Free CSV-JSON conversion tool.",
    icon: Table,
    href: "/tools/csv-json-converter",
    category: "Converter",
    featured: true,
    keywords: ["csv to json", "json to csv", "csv json converter", "convert csv to json", "csv converter"]
  },
  {
    id: "xml-formatter",
    title: "XML Formatter",
    description: "Format, beautify, and validate XML documents online. Free XML formatter and viewer.",
    icon: FileCode,
    href: "/tools/xml-formatter",
    category: "Formatter",
    keywords: ["xml formatter", "xml beautifier", "format xml", "xml pretty print", "xml viewer"]
  },
  {
    id: "http-status",
    title: "HTTP Status Codes",
    description: "Complete HTTP status code reference with descriptions. Quick lookup for all HTTP response codes.",
    icon: Globe,
    href: "/tools/http-status",
    category: "Utility",
    keywords: ["http status codes", "http response codes", "status code reference", "http error codes", "http 404 500"]
  },
  {
    id: "mock-data-generator",
    title: "Mock Data Generator",
    description: "Generate realistic fake data for testing. Names, emails, addresses, phone numbers, and more.",
    icon: Sparkles,
    href: "/tools/mock-data-generator",
    category: "Generator",
    featured: true,
    keywords: ["mock data generator", "fake data generator", "test data generator", "random data generator", "dummy data"]
  },
  {
    id: "escape-unescape",
    title: "Escape/Unescape Tool",
    description: "Escape and unescape HTML, URL, JSON, and Unicode strings. Free online escape tool.",
    icon: Code,
    href: "/tools/escape-unescape",
    category: "Converter",
    keywords: ["escape unescape", "html escape", "json escape", "url escape", "string escape tool"]
  },
  {
    id: "byte-unit-converter",
    title: "Byte Unit Converter",
    description: "Convert between bytes, KB, MB, GB, TB, and more. Free data size converter.",
    icon: HardDrive,
    href: "/tools/byte-unit-converter",
    category: "Converter",
    keywords: ["byte converter", "mb to gb", "kb to mb", "data size converter", "file size converter"]
  },
  {
    id: "graphql-formatter",
    title: "GraphQL Formatter",
    description: "Format and beautify GraphQL queries and schemas. Free online GraphQL formatter.",
    icon: Braces,
    href: "/tools/graphql-formatter",
    category: "Formatter",
    keywords: ["graphql formatter", "format graphql", "graphql beautifier", "graphql pretty print", "graphql editor"]
  },
  {
    id: "jwt-generator",
    title: "JWT Generator",
    description: "Generate JWT tokens with custom payloads for testing. Free JWT token creator.",
    icon: Key,
    href: "/tools/jwt-generator",
    category: "Generator",
    featured: true,
    keywords: ["jwt generator", "jwt token generator", "create jwt", "jwt maker", "jwt token creator"]
  },
  {
    id: "prompt-compressor",
    title: "Prompt Compressor",
    description: "Compress prompts for LLMs by removing predictable grammar. Save tokens while preserving meaning.",
    icon: Minimize2,
    href: "/tools/prompt-compressor",
    category: "Utility",
    featured: true,
    keywords: ["prompt compressor", "token optimizer", "compress prompt", "reduce tokens", "llm optimizer", "caveman compression", "chatgpt token saver", "ai prompt optimizer", "gpt token reducer", "token counter", "prompt optimizer"]
  },
  {
    id: "markdown-converter",
    title: "Markdown Converter",
    description: "Convert HTML, CSV, JSON, and rich text to clean Markdown. Perfect for docs and LLM pipelines.",
    icon: FileText,
    href: "/tools/markdown-converter",
    category: "Converter",
    featured: true,
    keywords: ["markdown converter", "html to markdown", "csv to markdown table", "json to markdown", "convert to markdown online", "markitdown alternative", "rich text to markdown", "markdown for llm"]
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