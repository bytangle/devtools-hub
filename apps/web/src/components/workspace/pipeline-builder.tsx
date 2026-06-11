import { useState, useCallback, useRef, useEffect } from "react"
import { useWorkspace, type PipelineNode } from "@/context/workspace-context"
import { tools, type Tool } from "@/data/tools"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Plus,
  Play,
  Trash2,
  RotateCcw,
  Copy,
  ArrowRight,
  Check,
  Loader2,
  X,
  Workflow,
  Settings2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import QRCodeStyling from "qr-code-styling"
import { toolComponents, type ToolComponentProps } from "./tool-panel"
import { PipelineModeProvider } from "@/components/tools/shared/tool-shell"

/* ═══════════════════════════════════════════════════════════════
   Tool categories
   ═══════════════════════════════════════════════════════════════ */
const toolCategories: Record<string, string[]> = {
  formatters: ["json-formatter", "html-formatter", "css-formatter", "sql-formatter", "minify-css", "minify-js", "yaml-formatter", "xml-formatter", "graphql-formatter"],
  converters: ["base64-encode", "base64-decode", "url-encode", "url-decode", "timestamp-converter", "text-case-converter", "base-converter", "json-yaml-converter", "csv-json-converter", "escape-unescape", "byte-unit-converter"],
  generators: ["password-generator", "uuid-generator", "hash-generator", "lorem-generator", "qr-generator", "mock-data-generator", "jwt-generator"],
  validators: ["json-validator", "html-validator", "css-validator"],
  utilities: ["regex-tester", "text-counter", "diff-checker", "markdown-preview", "jwt-decoder", "color-picker", "cron-builder", "unix-permissions", "http-status"],
}

const getToolById = (id: string): Tool | undefined => tools.find((t) => t.id === id)

/* ═══════════════════════════════════════════════════════════════
   Per-tool configuration schemas
   ═══════════════════════════════════════════════════════════════ */
interface ConfigField {
  key: string
  label: string
  type: "number" | "select" | "boolean" | "text"
  default: unknown
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
}

const toolConfigSchemas: Record<string, ConfigField[]> = {
  "json-formatter": [
    { key: "indent", label: "Indent Size", type: "number", default: 2, min: 1, max: 8, step: 1 },
    { key: "sortKeys", label: "Sort Keys", type: "boolean", default: false },
  ],
  "password-generator": [
    { key: "length", label: "Length", type: "number", default: 16, min: 4, max: 128, step: 1 },
    { key: "uppercase", label: "Uppercase (A-Z)", type: "boolean", default: true },
    { key: "lowercase", label: "Lowercase (a-z)", type: "boolean", default: true },
    { key: "numbers", label: "Numbers (0-9)", type: "boolean", default: true },
    { key: "symbols", label: "Symbols (!@#$)", type: "boolean", default: true },
  ],
  "text-case-converter": [
    {
      key: "caseType", label: "Case Type", type: "select", default: "camel", options: [
        { value: "camel", label: "camelCase" },
        { value: "snake", label: "snake_case" },
        { value: "pascal", label: "PascalCase" },
        { value: "kebab", label: "kebab-case" },
        { value: "upper", label: "UPPER CASE" },
        { value: "lower", label: "lower case" },
        { value: "title", label: "Title Case" },
      ],
    },
  ],
  "base-converter": [
    {
      key: "inputBase", label: "Input Base", type: "select", default: "10", options: [
        { value: "2", label: "Binary (2)" },
        { value: "8", label: "Octal (8)" },
        { value: "10", label: "Decimal (10)" },
        { value: "16", label: "Hex (16)" },
      ],
    },
    {
      key: "outputBase", label: "Output Base", type: "select", default: "16", options: [
        { value: "2", label: "Binary (2)" },
        { value: "8", label: "Octal (8)" },
        { value: "10", label: "Decimal (10)" },
        { value: "16", label: "Hex (16)" },
      ],
    },
  ],
  "uuid-generator": [
    { key: "count", label: "Count", type: "number", default: 1, min: 1, max: 100, step: 1 },
    { key: "uppercase", label: "Uppercase", type: "boolean", default: false },
  ],
  "lorem-generator": [
    { key: "paragraphs", label: "Paragraphs", type: "number", default: 1, min: 1, max: 10, step: 1 },
  ],
  "hash-generator": [
    {
      key: "algorithm", label: "Algorithm", type: "select", default: "sha256", options: [
        { value: "simple", label: "Simple Hash" },
        { value: "sha256", label: "SHA-256 (sync)" },
      ],
    },
  ],
  "mock-data-generator": [
    { key: "count", label: "Number of Records", type: "number", default: 1, min: 1, max: 50, step: 1 },
  ],
  "byte-unit-converter": [
    {
      key: "inputUnit", label: "Input Unit", type: "select", default: "bytes", options: [
        { value: "bytes", label: "Bytes" },
        { value: "kb", label: "KB" },
        { value: "mb", label: "MB" },
        { value: "gb", label: "GB" },
      ],
    },
  ],
  "escape-unescape": [
    {
      key: "mode", label: "Mode", type: "select", default: "escape", options: [
        { value: "escape", label: "Escape" },
        { value: "unescape", label: "Unescape" },
      ],
    },
    {
      key: "format", label: "Format", type: "select", default: "html", options: [
        { value: "html", label: "HTML" },
        { value: "url", label: "URL" },
        { value: "json", label: "JSON" },
      ],
    },
  ],
  "regex-tester": [
    { key: "pattern", label: "Pattern", type: "text", default: "" },
    { key: "flags", label: "Flags", type: "text", default: "g" },
  ],
  "minify-css": [
    { key: "removeComments", label: "Remove Comments", type: "boolean", default: true },
  ],
  "minify-js": [
    { key: "removeComments", label: "Remove Comments", type: "boolean", default: true },
  ],
  "jwt-generator": [
    { key: "sub", label: "Subject (sub)", type: "text", default: "123" },
    { key: "name", label: "Name", type: "text", default: "Test User" },
    { key: "exp", label: "Expires In (hours)", type: "number", default: 24, min: 1, max: 8760, step: 1 },
    {
      key: "alg", label: "Algorithm", type: "select", default: "HS256", options: [
        { value: "HS256", label: "HS256" },
        { value: "HS384", label: "HS384" },
        { value: "HS512", label: "HS512" },
        { value: "RS256", label: "RS256" },
      ],
    },
  ],
  "jwt-decoder": [
    { key: "prettyPrint", label: "Pretty Print", type: "boolean", default: true },
  ],
  "timestamp-converter": [
    {
      key: "format", label: "Output Format", type: "select", default: "all", options: [
        { value: "all", label: "All Formats" },
        { value: "unix", label: "Unix Timestamp" },
        { value: "iso", label: "ISO 8601" },
        { value: "local", label: "Local String" },
      ],
    },
  ],
  "csv-json-converter": [
    {
      key: "delimiter", label: "Delimiter", type: "select", default: ",", options: [
        { value: ",", label: "Comma (,)" },
        { value: "\t", label: "Tab" },
        { value: ";", label: "Semicolon (;)" },
        { value: "|", label: "Pipe (|)" },
      ],
    },
  ],
  "json-yaml-converter": [
    {
      key: "direction", label: "Direction", type: "select", default: "json-to-yaml", options: [
        { value: "json-to-yaml", label: "JSON → YAML" },
        { value: "yaml-to-json", label: "YAML → JSON" },
      ],
    },
  ],
  "html-formatter": [
    { key: "indentSize", label: "Indent Size", type: "number", default: 2, min: 1, max: 8, step: 1 },
  ],
  "sql-formatter": [
    { key: "uppercase", label: "Uppercase Keywords", type: "boolean", default: true },
  ],
  "markdown-preview": [
    { key: "stripMarkdown", label: "Strip Markdown Syntax", type: "boolean", default: true },
  ],
  "qr-generator": [
    { key: "size", label: "Size", type: "number", default: 200, min: 100, max: 500, step: 50 },
  ],
  "diff-checker": [
    { key: "ignoreWhitespace", label: "Ignore Whitespace", type: "boolean", default: false },
  ],
}

function getConfigValue(node: PipelineNode, key: string, schema: ConfigField[]): unknown {
  const field = schema.find((f) => f.key === key)
  return node.config?.[key] ?? field?.default
}

/* ═══════════════════════════════════════════════════════════════
   Simple hash for key generation
   ═══════════════════════════════════════════════════════════════ */
function quickHash(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

/* ═══════════════════════════════════════════════════════════════
   Passthrough tools — these analyse/validate input without
   transforming it.  In a pipeline the *original* input is
   forwarded to the next step so the chain isn't broken.
   ═══════════════════════════════════════════════════════════════ */
const PASSTHROUGH_TOOLS = new Set([
  "json-validator",
  "html-validator",
  "css-validator",
  "text-counter",
  "hash-generator",
  "regex-tester",
  "byte-unit-converter",
  "timestamp-converter",
])

/* ═══════════════════════════════════════════════════════════════
   Tool processor  (config-aware)
   ═══════════════════════════════════════════════════════════════ */
async function processToolStep(
  toolId: string,
  input: string,
  config?: Record<string, unknown>,
): Promise<string> {
  const cfg = config || {}

  switch (toolId) {
    case "json-formatter":
      try {
        const indent = (cfg.indent as number) || 2
        const parsed = JSON.parse(input)
        if (cfg.sortKeys) {
          const sortObj = (o: unknown): unknown => {
            if (Array.isArray(o)) return o.map(sortObj)
            if (o && typeof o === "object") {
              return Object.keys(o as Record<string, unknown>)
                .sort()
                .reduce((r, k) => {
                  ;(r as Record<string, unknown>)[k] = sortObj(
                    (o as Record<string, unknown>)[k],
                  )
                  return r
                }, {} as Record<string, unknown>)
            }
            return o
          }
          return JSON.stringify(sortObj(parsed), null, indent)
        }
        return JSON.stringify(parsed, null, indent)
      } catch {
        return "Error: Invalid JSON\n\nInput:\n" + input
      }

    case "base64-encode":
      try {
        return btoa(unescape(encodeURIComponent(input)))
      } catch {
        return "Error: Cannot encode to Base64\n\nInput:\n" + input
      }

    case "base64-decode":
      try {
        return decodeURIComponent(escape(atob(input.trim())))
      } catch {
        return "Error: Invalid Base64 string\n\nInput:\n" + input
      }

    case "url-encode":
      return encodeURIComponent(input)

    case "url-decode":
      try {
        return decodeURIComponent(input)
      } catch {
        return "Error: Invalid URL encoding\n\nInput:\n" + input
      }

    case "json-validator":
      try {
        JSON.parse(input)
        return "\u2713 Valid JSON\n\n" + input
      } catch (e) {
        return (
          "\u2717 Invalid JSON: " +
          (e instanceof Error ? e.message : "Unknown error") +
          "\n\nInput:\n" +
          input
        )
      }

    case "text-counter": {
      const chars = input.length
      const words = input.trim() ? input.trim().split(/\s+/).length : 0
      const lines = input.split("\n").length
      const bytes = new Blob([input]).size
      return (
        "Characters: " +
        chars +
        "\nWords: " +
        words +
        "\nLines: " +
        lines +
        "\nBytes: " +
        bytes +
        "\n\n---\n" +
        input
      )
    }

    case "minify-css":
      return input
        .replace(
          cfg.removeComments !== false ? /\/\*[\s\S]*?\*\//g : /(?!)/g,
          "",
        )
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .trim()

    case "minify-js":
      return input
        .replace(
          cfg.removeComments !== false ? /\/\*[\s\S]*?\*\//g : /(?!)/g,
          "",
        )
        .replace(cfg.removeComments !== false ? /\/\/.*$/gm : /(?!)/g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}():;,=+\-*/<>!&|])\s*/g, "$1")
        .trim()

    case "hash-generator": {
      let hash = 0
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }
      return (
        "Hash: " +
        Math.abs(hash).toString(16).padStart(8, "0") +
        "\nLength: " +
        input.length +
        " chars\n\n---\n" +
        input
      )
    }

    case "html-formatter":
      try {
        let indent = 0
        const lines: string[] = []
        input.split(/(<[^>]+>)/g).forEach((part) => {
          if (!part.trim()) return
          if (part.match(/^<\//)) indent = Math.max(0, indent - 1)
          lines.push("  ".repeat(indent) + part.trim())
          if (
            part.match(/^<[^/!][^>]*[^/]>$/) &&
            !part.match(/^<(br|hr|img|input|meta|link)/i)
          )
            indent++
        })
        return lines.join("\n")
      } catch {
        return input
      }

    case "css-formatter":
      try {
        return input
          .replace(/\{/g, " {\n  ")
          .replace(/;/g, ";\n  ")
          .replace(/\}/g, "\n}\n")
          .replace(/ {2}\n\}/g, "}")
          .trim()
      } catch {
        return input
      }

    case "sql-formatter":
      try {
        const kw = [
          "SELECT",
          "FROM",
          "WHERE",
          "AND",
          "OR",
          "JOIN",
          "LEFT",
          "RIGHT",
          "INNER",
          "OUTER",
          "ON",
          "ORDER BY",
          "GROUP BY",
          "HAVING",
          "INSERT",
          "UPDATE",
          "DELETE",
          "CREATE",
          "DROP",
          "ALTER",
          "TABLE",
          "INTO",
          "VALUES",
          "SET",
          "LIMIT",
          "OFFSET",
          "UNION",
          "AS",
        ]
        let f = input.toUpperCase()
        kw.forEach((k) => {
          f = f.replace(new RegExp("\\b" + k + "\\b", "gi"), "\n" + k)
        })
        return f.trim().replace(/^\n/, "")
      } catch {
        return input
      }

    case "uuid-generator": {
      const count = (cfg.count as number) || 1
      const upper = cfg.uppercase as boolean
      const uuids: string[] = []
      for (let c = 0; c < count; c++) {
        let u = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          (ch) => {
            const r = (Math.random() * 16) | 0
            return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16)
          },
        )
        if (upper) u = u.toUpperCase()
        uuids.push(u)
      }
      return uuids.join("\n")
    }

    case "password-generator": {
      const len = (cfg.length as number) || 16
      let charset = ""
      if (cfg.uppercase !== false) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      if (cfg.lowercase !== false) charset += "abcdefghijklmnopqrstuvwxyz"
      if (cfg.numbers !== false) charset += "0123456789"
      if (cfg.symbols !== false) charset += "!@#$%^&*"
      if (!charset)
        charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let pw = ""
      for (let i = 0; i < len; i++)
        pw += charset.charAt(Math.floor(Math.random() * charset.length))
      return pw
    }

    case "lorem-generator": {
      const paras = (cfg.paragraphs as number) || 1
      const base =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
      return Array.from({ length: paras }, () => base).join("\n\n")
    }

    case "timestamp-converter": {
      const now = Date.now()
      const d = new Date(now)
      return (
        "Unix: " +
        Math.floor(now / 1000) +
        "\nISO: " +
        d.toISOString() +
        "\nLocal: " +
        d.toLocaleString() +
        "\n\n" +
        (input ? "Input: " + input : "")
      )
    }

    case "regex-tester": {
      const pattern = (cfg.pattern as string) || ""
      const flags = (cfg.flags as string) || "g"
      if (!pattern) return "(no pattern configured)\n\n" + input
      try {
        const re = new RegExp(pattern, flags)
        const matches = [...input.matchAll(re)]
        return (
          "Pattern: /" +
          pattern +
          "/" +
          flags +
          "\nMatches: " +
          matches.length +
          "\n\n" +
          (matches
            .map(
              (m, i) => "[" + i + '] "' + m[0] + '" at index ' + m.index,
            )
            .join("\n") || "(no matches)") +
          "\n\n---\n" +
          input
        )
      } catch (e) {
        return (
          "Error: " +
          (e instanceof Error ? e.message : "Invalid regex") +
          "\n\n" +
          input
        )
      }
    }

    case "color-picker":
      return input

    case "jwt-decoder":
      try {
        const parts = input.trim().split(".")
        if (parts.length !== 3)
          return (
            "Error: Invalid JWT format (expected 3 parts, got " +
            parts.length +
            ")\n\nInput:\n" +
            input
          )
        const header = JSON.parse(atob(parts[0]))
        const payload = JSON.parse(atob(parts[1]))
        return (
          "Header:\n" +
          JSON.stringify(header, null, 2) +
          "\n\nPayload:\n" +
          JSON.stringify(payload, null, 2)
        )
      } catch {
        return "Error: Could not decode JWT\n\nInput:\n" + input
      }

    case "markdown-preview":
      return input
        .replace(/^### (.*$)/gim, "$1")
        .replace(/^## (.*$)/gim, "$1")
        .replace(/^# (.*$)/gim, "$1")
        .replace(/\*\*(.*)\*\*/gim, "$1")
        .replace(/\*(.*)\*/gim, "$1")
        .replace(/`(.*)`/gim, "$1")

    case "text-case-converter": {
      const caseType = (cfg.selectedCase as string) || (cfg.caseType as string) || "camel"
      const words = input
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_\-./\\]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0)
      switch (caseType) {
        case "camel":
          return words
            .map((w, i) =>
              i === 0
                ? w.toLowerCase()
                : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
            )
            .join("")
        case "pascal":
          return words
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
        case "snake":
          return words.map((w) => w.toLowerCase()).join("_")
        case "kebab":
          return words.map((w) => w.toLowerCase()).join("-")
        case "upper":
          return words.map((w) => w.toUpperCase()).join(" ")
        case "lower":
          return words.map((w) => w.toLowerCase()).join(" ")
        case "title":
          return words
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        default:
          return input
      }
    }

    case "base-converter": {
      const inBase = parseInt((cfg.fromBase as string) || (cfg.inputBase as string) || "10")
      const outBase = parseInt((cfg.toBase as string) || (cfg.outputBase as string) || "16")
      const num = parseInt(input.trim(), inBase)
      if (isNaN(num))
        return (
          "Error: Invalid number for base " +
          inBase +
          "\n\nInput:\n" +
          input
        )
      return num.toString(outBase).toUpperCase()
    }

    case "yaml-formatter":
    case "xml-formatter":
    case "graphql-formatter":
      return input

    case "json-yaml-converter": {
      const trimmed = input.trim()
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const data = JSON.parse(trimmed)
          return JSON.stringify(data, null, 2)
            .replace(/"/g, "")
            .replace(/,$/gm, "")
            .replace(/[{}[\]]/g, "")
        } catch {
          return input
        }
      }
      return input
    }

    case "csv-json-converter": {
      const csvMode = (cfg.mode as string) || "csv-to-json"
      const delim = (cfg.delimiter as string) || ","
      if (csvMode === "json-to-csv") {
        try {
          const data = JSON.parse(input)
          if (!Array.isArray(data)) return "Error: JSON must be an array of objects\n\nInput:\n" + input
          const keys = new Set<string>()
          data.forEach((obj: Record<string, unknown>) => {
            if (typeof obj === "object" && obj !== null) Object.keys(obj).forEach(k => keys.add(k))
          })
          const headers = Array.from(keys)
          const escape = (val: unknown): string => {
            if (val === null || val === undefined) return ""
            const str = String(val)
            if (str.includes(delim) || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`
            return str
          }
          return [headers.map(escape).join(delim), ...data.map((obj: Record<string, unknown>) => headers.map(h => escape(obj[h])).join(delim))].join("\n")
        } catch {
          return "Error: Invalid JSON\n\nInput:\n" + input
        }
      } else {
        const lines = input.trim().split("\n")
        if (lines.length < 2) return input
        const parseCSVLine = (line: string, d: string): string[] => {
          const result: string[] = []; let current = ""; let inQ = false
          for (let i = 0; i < line.length; i++) {
            const c = line[i]
            if (c === '"') { if (inQ && line[i + 1] === '"') { current += '"'; i++ } else inQ = !inQ }
            else if (c === d && !inQ) { result.push(current); current = "" }
            else current += c
          }
          result.push(current); return result
        }
        const headers = parseCSVLine(lines[0], delim).map(h => h.trim())
        const rows = lines.slice(1).map(line => {
          const vals = parseCSVLine(line, delim)
          const obj: Record<string, unknown> = {}
          headers.forEach((h, i) => {
            let v: unknown = vals[i]?.trim() ?? ""
            if (typeof v === "string") {
              if (/^-?\d+$/.test(v)) v = parseInt(v)
              else if (/^-?\d+\.\d+$/.test(v)) v = parseFloat(v)
              else if ((v as string).toLowerCase() === "true") v = true
              else if ((v as string).toLowerCase() === "false") v = false
              else if (v === "") v = null
            }
            obj[h] = v
          })
          return obj
        })
        return JSON.stringify(rows, null, 2)
      }
    }

    case "escape-unescape": {
      const mode = (cfg.mode as string) || "escape"
      const fmt = (cfg.escapeType as string) || (cfg.format as string) || "html"
      if (mode === "escape") {
        if (fmt === "html")
          return input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
        if (fmt === "url") return encodeURIComponent(input)
        if (fmt === "json") return JSON.stringify(input)
      } else {
        if (fmt === "html")
          return input
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
        if (fmt === "url")
          try {
            return decodeURIComponent(input)
          } catch {
            return input
          }
        if (fmt === "json")
          try {
            return JSON.parse(input)
          } catch {
            return input
          }
      }
      return input
    }

    case "byte-unit-converter": {
      const num = parseFloat(input.trim())
      if (isNaN(num)) return "Error: Invalid number\n\nInput:\n" + input
      const unit = (cfg.fromUnit as string) || (cfg.inputUnit as string) || "bytes"
      const multipliers: Record<string, number> = {
        bytes: 1,
        kb: 1000,
        mb: 1e6,
        gb: 1e9,
      }
      const bytes = num * (multipliers[unit] || 1)
      return (
        "Bytes: " +
        bytes +
        "\nKB: " +
        (bytes / 1000).toFixed(2) +
        "\nMB: " +
        (bytes / 1e6).toFixed(4) +
        "\nGB: " +
        (bytes / 1e9).toFixed(6) +
        "\nTB: " +
        (bytes / 1e12).toFixed(8)
      )
    }

    case "mock-data-generator": {
      const count = (cfg.count as number) || 1
      const names = ["John", "Jane", "Bob", "Alice", "Charlie", "Diana"]
      const domains = ["example.com", "test.com", "dev.io"]
      const records = Array.from({ length: count }, () => {
        const name = names[Math.floor(Math.random() * names.length)]
        const email =
          name.toLowerCase() +
          "@" +
          domains[Math.floor(Math.random() * domains.length)]
        return { id: crypto.randomUUID(), name, email }
      })
      return JSON.stringify(count === 1 ? records[0] : records, null, 2)
    }

    case "jwt-generator": {
      const alg = (cfg.alg as string) || "HS256"
      const sub = (cfg.sub as string) || "123"
      const name = (cfg.name as string) || input || "Test"
      const expHours = (cfg.exp as number) || 24
      const iat = Math.floor(Date.now() / 1000)
      const exp = iat + expHours * 3600
      const header = btoa(
        JSON.stringify({ alg, typ: "JWT" }),
      ).replace(/=/g, "")
      const payload = btoa(
        JSON.stringify({ sub, name, iat, exp }),
      ).replace(/=/g, "")
      return header + "." + payload + ".signature"
    }

    case "qr-generator": {
      if (!input.trim()) return "Error: No input to generate QR code from"
      const size = (cfg.size as number) || 200
      try {
        const qr = new QRCodeStyling({
          width: size,
          height: size,
          type: "svg",
          data: input,
          dotsOptions: { color: "#14b8a6", type: "rounded" },
          cornersSquareOptions: { color: "#14b8a6", type: "extra-rounded" },
          cornersDotOptions: { color: "#0d9488", type: "dot" },
          backgroundOptions: { color: "#0a0a0a" },
        })
        const blob = await qr.getRawData("svg")
        if (!blob) return "Error: Failed to generate QR code"
        const svgText = await new Response(blob as Blob).text()
        const dataUrl = "data:image/svg+xml;base64," + btoa(svgText)
        return dataUrl
      } catch (e) {
        return "Error: QR generation failed — " + (e instanceof Error ? e.message : "unknown")
      }
    }

    case "cron-builder":
    case "unix-permissions":
    case "http-status":
      return input

    default:
      return input
  }
}

/* ═══════════════════════════════════════════════════════════════
   Canvas Node dimensions
   ═══════════════════════════════════════════════════════════════ */
const NODE_W = 220
const NODE_H = 72
const NODE_GAP_X = 80
const INITIAL_X = 60
const INITIAL_Y = 80

function defaultPosition(index: number): { x: number; y: number } {
  return { x: INITIAL_X + index * (NODE_W + NODE_GAP_X), y: INITIAL_Y }
}

/* ═══════════════════════════════════════════════════════════════
   Smart connector positioning helpers
   ═══════════════════════════════════════════════════════════════ */
type ConnectionSide = "left" | "right" | "top" | "bottom"

interface ConnectionPoints {
  startSide: ConnectionSide
  endSide: ConnectionSide
  x1: number
  y1: number
  x2: number
  y2: number
}

function getSmartConnectionPoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): ConnectionPoints {
  // Calculate centers
  const c1x = p1.x + NODE_W / 2
  const c1y = p1.y + NODE_H / 2
  const c2x = p2.x + NODE_W / 2
  const c2y = p2.y + NODE_H / 2

  // Calculate differences
  const dx = c2x - c1x
  const dy = c2y - c1y

  // Determine primary direction based on which delta is larger
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  let startSide: ConnectionSide
  let endSide: ConnectionSide

  if (absDx >= absDy) {
    // Horizontal is dominant
    if (dx >= 0) {
      // Target is to the right
      startSide = "right"
      endSide = "left"
    } else {
      // Target is to the left
      startSide = "left"
      endSide = "right"
    }
  } else {
    // Vertical is dominant
    if (dy >= 0) {
      // Target is below
      startSide = "bottom"
      endSide = "top"
    } else {
      // Target is above
      startSide = "top"
      endSide = "bottom"
    }
  }

  // Calculate actual connection coordinates
  const getPoint = (pos: { x: number; y: number }, side: ConnectionSide) => {
    switch (side) {
      case "left":
        return { x: pos.x, y: pos.y + NODE_H / 2 }
      case "right":
        return { x: pos.x + NODE_W, y: pos.y + NODE_H / 2 }
      case "top":
        return { x: pos.x + NODE_W / 2, y: pos.y }
      case "bottom":
        return { x: pos.x + NODE_W / 2, y: pos.y + NODE_H }
    }
  }

  const start = getPoint(p1, startSide)
  const end = getPoint(p2, endSide)

  return {
    startSide,
    endSide,
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
  }
}

/* ═══════════════════════════════════════════════════════════════
   Output Renderer — detects data URLs and renders images
   ═══════════════════════════════════════════════════════════════ */
function OutputRenderer({
  output,
  className,
  emptyText,
}: {
  output: string | undefined | null
  className?: string
  emptyText?: string
}) {
  if (!output) {
    return (
      <pre className={cn("text-muted-foreground", className)}>
        <span className="italic">{emptyText || "No output"}</span>
      </pre>
    )
  }

  const isImage = output.startsWith("data:image/")
  const hasError = output.startsWith("Error:")

  if (isImage) {
    return (
      <div className={cn("flex flex-col items-center gap-2 p-3", className)}>
        <img
          src={output}
          alt="Generated output"
          className="max-w-full rounded-lg border border-border"
        />
        <span className="text-[10px] text-muted-foreground font-mono">
          Image output ({Math.round(output.length / 1024)}KB)
        </span>
      </div>
    )
  }

  return (
    <pre
      className={cn(
        "whitespace-pre-wrap break-all",
        hasError ? "text-red-400" : "text-emerald-400",
        className,
      )}
    >
      {output}
    </pre>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Mobile Step List — vertical list view for small screens
   ═══════════════════════════════════════════════════════════════ */
interface MobileStepListProps {
  nodes: PipelineNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  onRemoveNode: (id: string) => void
  onRunStep: (index: number) => void
  onInsertAt: (index: number) => void
  onAddTool: (toolId: string) => void
  getNodeStatus: (index: number) => "idle" | "running" | "done" | "error"
}

function MobileStepList({
  nodes,
  selectedNodeId,
  onSelectNode,
  onRemoveNode,
  onRunStep,
  onInsertAt,
  onAddTool,
  getNodeStatus,
}: MobileStepListProps) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {nodes.map((node, index) => {
        const tool = getToolById(node.toolId)
        if (!tool) return null
        const Icon = tool.icon
        const status = getNodeStatus(index)
        const isSelected = selectedNodeId === node.id
        const prevNode = index > 0 ? nodes[index - 1] : null
        const prevTool = prevNode ? getToolById(prevNode.toolId) : null

        return (
          <div key={node.id} className="flex flex-col">
            {/* Insert button before (except first) */}
            {index > 0 && (
              <div className="flex justify-center -my-1 relative z-10">
                <ToolPicker onSelect={onAddTool}>
                  <button
                    onClick={() => onInsertAt(index)}
                    className="w-6 h-6 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-card"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </ToolPicker>
              </div>
            )}

            {/* Step card */}
            <div
              className={cn(
                "rounded-xl border-2 bg-card p-3 transition-all",
                status === "done" && "border-emerald-500/50",
                status === "running" && "border-primary/60",
                status === "error" && "border-red-500/50",
                status === "idle" && "border-border",
                isSelected && "ring-2 ring-primary/40 border-primary/60",
              )}
              onClick={() => onSelectNode(isSelected ? null : node.id)}
            >
              <div className="flex items-center gap-3">
                {/* Status & Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                    status === "done" && "bg-emerald-500/10 text-emerald-500",
                    status === "running" && "bg-primary/10 text-primary",
                    status === "error" && "bg-red-500/10 text-red-500",
                    status === "idle" && "bg-muted text-muted-foreground",
                  )}
                >
                  {status === "running" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {tool.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Step {index + 1}
                    {index > 0 && prevTool && (
                      <span className="ml-1">← {prevTool.title}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRunStep(index)
                    }}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="Run to this step"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveNode(node.id)
                    }}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                    title="Remove step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status indicator */}
              {status === "done" && (
                <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                  <span>Output ready ({node.output?.length} chars)</span>
                </div>
              )}
              {status === "error" && (
                <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs text-red-500">
                  <X className="h-3.5 w-3.5" />
                  <span>Error occurred</span>
                </div>
              )}
            </div>

            {/* Connection line to next */}
            {index < nodes.length - 1 && (
              <div className="flex justify-center h-4">
                <div className={cn(
                  "w-0.5 h-full",
                  node.output ? "bg-primary" : "bg-border border-dashed"
                )} />
              </div>
            )}
          </div>
        )
      })}

      {/* Add step button at end */}
      <div className="flex justify-center mt-2">
        <ToolPicker onSelect={onAddTool}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Step</span>
          </button>
        </ToolPicker>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Tool Picker Popover
   ═══════════════════════════════════════════════════════════════ */
function ToolPicker({
  onSelect,
  children,
}: {
  onSelect: (toolId: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const filtered = tools.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase())
    if (category === "all") return matchesSearch
    const ids = toolCategories[category] || []
    return matchesSearch && ids.includes(t.id)
  })

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) {
          setSearch("")
          setCategory("all")
        }
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" sideOffset={8}>
        <div className="p-3 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm pl-8"
              autoFocus
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {[
              "all",
              "formatters",
              "converters",
              "generators",
              "validators",
              "utilities",
            ].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded-full transition-colors",
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "all"
                  ? "All"
                  : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="p-1">
            {filtered.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelect(tool.id)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent text-left transition-colors group"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm truncate flex-1">
                    {tool.title}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No tools found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG Connections between nodes (with smart positioning)
   ═══════════════════════════════════════════════════════════════ */
function Connections({ 
  nodes, 
  onInsertAt 
}: { 
  nodes: PipelineNode[]
  onInsertAt?: (index: number) => void 
}) {
  if (nodes.length < 2) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="hsl(var(--primary) / 0.5)" />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="hsl(var(--primary))" />
        </marker>
      </defs>
      {nodes.slice(0, -1).map((node, i) => {
        const next = nodes[i + 1]
        const p1 = node.position || defaultPosition(i)
        const p2 = next.position || defaultPosition(i + 1)
        
        // Use smart positioning to determine connection sides
        const conn = getSmartConnectionPoints(p1, p2)
        const { x1, y1, x2, y2, startSide, endSide } = conn
        
        // Calculate control points based on connection sides
        let d: string
        if (startSide === "right" && endSide === "left") {
          const dx = (x2 - x1) * 0.5
          d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
        } else if (startSide === "left" && endSide === "right") {
          const dx = (x1 - x2) * 0.5
          d = `M${x1},${y1} C${x1 - dx},${y1} ${x2 + dx},${y2} ${x2},${y2}`
        } else if (startSide === "bottom" && endSide === "top") {
          const dy = (y2 - y1) * 0.5
          d = `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`
        } else if (startSide === "top" && endSide === "bottom") {
          const dy = (y1 - y2) * 0.5
          d = `M${x1},${y1} C${x1},${y1 - dy} ${x2},${y2 + dy} ${x2},${y2}`
        } else {
          // Fallback to simple curve
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          d = `M${x1},${y1} Q${mx},${y1} ${mx},${my} Q${mx},${y2} ${x2},${y2}`
        }
        
        const hasOutput = !!node.output
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2

        return (
          <g key={"conn-" + i}>
            <path
              d={d}
              fill="none"
              stroke={
                hasOutput
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground) / 0.2)"
              }
              strokeWidth={hasOutput ? 2 : 1.5}
              strokeDasharray={hasOutput ? "none" : "6 4"}
              markerEnd={
                hasOutput
                  ? "url(#arrowhead-active)"
                  : "url(#arrowhead)"
              }
            />
            {/* Insert button at midpoint */}
            {onInsertAt && (
              <g 
                className="pointer-events-auto cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => onInsertAt(i + 1)}
              >
                <circle
                  cx={midX}
                  cy={midY}
                  r={12}
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--border))"
                  strokeWidth={1.5}
                  className="hover:stroke-primary transition-colors"
                />
                <line
                  x1={midX - 4}
                  y1={midY}
                  x2={midX + 4}
                  y2={midY}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  className="hover:stroke-primary"
                />
                <line
                  x1={midX}
                  y1={midY - 4}
                  x2={midX}
                  y2={midY + 4}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  className="hover:stroke-primary"
                />
              </g>
            )}
            {hasOutput && !onInsertAt && (
              <circle
                cx={midX}
                cy={midY}
                r={3}
                fill="hsl(var(--primary))"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Canvas Node component
   ═══════════════════════════════════════════════════════════════ */
interface CanvasNodeProps {
  node: PipelineNode
  index: number
  totalNodes: number
  prevNode?: PipelineNode
  nextNode?: PipelineNode
  status: "idle" | "running" | "done" | "error"
  selected: boolean
  onSelect: () => void
  onPositionChange: (pos: { x: number; y: number }) => void
  onRemove: () => void
  onRunStep: () => void
  zoom: number
}

function CanvasNode({
  node,
  index,
  totalNodes,
  prevNode,
  nextNode,
  status,
  selected,
  onSelect,
  onPositionChange,
  onRemove,
  onRunStep,
  zoom,
}: CanvasNodeProps) {
  const tool = getToolById(node.toolId)
  const dragRef = useRef<{
    startX: number
    startY: number
    startPos: { x: number; y: number }
  } | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  if (!tool) return null
  const Icon = tool.icon
  const pos = node.position || defaultPosition(index)

  // Calculate input/output port positions based on neighboring nodes
  const getInputSide = (): ConnectionSide => {
    if (!prevNode) return "left"
    const prevPos = prevNode.position || defaultPosition(index - 1)
    const conn = getSmartConnectionPoints(prevPos, pos)
    return conn.endSide
  }

  const getOutputSide = (): ConnectionSide => {
    if (!nextNode) return "right"
    const nextPos = nextNode.position || defaultPosition(index + 1)
    const conn = getSmartConnectionPoints(pos, nextPos)
    return conn.startSide
  }

  const inputSide = index > 0 ? getInputSide() : null
  const outputSide = index < totalNodes - 1 ? getOutputSide() : "right"

  const getPortStyle = (side: ConnectionSide) => {
    const base = "absolute w-3.5 h-3.5 rounded-full border-2 bg-card transition-colors"
    switch (side) {
      case "left":
        return `${base} top-1/2 -left-2 -translate-y-1/2`
      case "right":
        return `${base} top-1/2 -right-2 -translate-y-1/2`
      case "top":
        return `${base} left-1/2 -top-2 -translate-x-1/2`
      case "bottom":
        return `${base} left-1/2 -bottom-2 -translate-x-1/2`
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    e.stopPropagation()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...pos },
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = (ev.clientX - dragRef.current.startX) / zoom
      const dy = (ev.clientY - dragRef.current.startY) / zoom
      onPositionChange({
        x: Math.max(0, dragRef.current.startPos.x + dx),
        y: Math.max(0, dragRef.current.startPos.y + dy),
      })
    }

    const handleMouseUp = () => {
      dragRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute select-none cursor-grab active:cursor-grabbing group",
        "transition-shadow duration-150",
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width: NODE_W,
        height: NODE_H,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={cn(
          "h-full rounded-xl border-2 bg-card shadow-sm transition-all",
          "hover:shadow-md",
          status === "done" && "border-emerald-500/50",
          status === "running" &&
            "border-primary/60 shadow-primary/10 shadow-lg",
          status === "error" && "border-red-500/50",
          status === "idle" && "border-border",
          selected &&
            "ring-2 ring-primary/40 border-primary/60 shadow-lg",
        )}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        {/* Status bar at top */}
        <div
          className={cn(
            "h-1 rounded-t-[10px] transition-colors",
            status === "done" && "bg-emerald-500",
            status === "running" && "bg-primary animate-pulse",
            status === "error" && "bg-red-500",
            status === "idle" && "bg-transparent",
          )}
        />

        <div className="flex items-center gap-2.5 px-3 py-2">
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
              status === "done" && "bg-emerald-500/10 text-emerald-500",
              status === "running" && "bg-primary/10 text-primary",
              status === "error" && "bg-red-500/10 text-red-500",
              status === "idle" && "bg-muted text-muted-foreground",
            )}
          >
            {status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">
              {tool.title}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Step {index + 1}
            </div>
          </div>

          {/* Status dot */}
          {status === "done" && (
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          )}
        </div>

        {/* Run step button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRunStep()
          }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
          title="Run up to this step"
        >
          <Play className="h-2.5 w-2.5" />
        </button>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Config indicator */}
        {node.config && Object.keys(node.config).length > 0 && (
          <div className="absolute -bottom-1.5 right-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-card border text-[9px] text-muted-foreground font-mono">
            <Settings2 className="h-2.5 w-2.5" />
            configured
          </div>
        )}

        {/* Output port (dynamic position) */}
        {outputSide && (
          <div
            className={cn(
              getPortStyle(outputSide),
              status === "done"
                ? "border-emerald-500 bg-emerald-500"
                : "border-border",
            )}
          />
        )}

        {/* Input port (dynamic position) */}
        {inputSide && (
          <div
            className={cn(
              getPortStyle(inputSide),
              node.input ? "border-primary bg-primary" : "border-border",
            )}
          />
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step Editor — embeds the actual tool component for full config
   ═══════════════════════════════════════════════════════════════ */
function StepEditor({
  node,
  index,
  prevNode,
  onClose,
  onRunStep,
  isRunning,
  onOutputCapture,
}: {
  node: PipelineNode
  index: number
  prevNode?: PipelineNode
  onClose: () => void
  onRunStep: () => void
  isRunning: boolean
  onOutputCapture: (output: string) => void
}) {
  const tool = getToolById(node.toolId)
  const prevTool = prevNode ? getToolById(prevNode.toolId) : null
  if (!tool) return null

  const Icon = tool.icon
  const ToolComponent = toolComponents[node.toolId]
  
  // For non-first steps, input comes from previous step's output
  const effectiveInput = index > 0 && prevNode?.output ? prevNode.output : node.input

  return (
    <div className="w-full md:w-[480px] md:max-w-[50vw] border-t md:border-t-0 md:border-l flex flex-col bg-card shrink-0 h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 shrink-0">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold truncate block">
              Step {index + 1}: {tool.title}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {index > 0 && prevTool ? (
                <>← from {prevTool.title}</>
              ) : effectiveInput ? (
                `${effectiveInput.length} chars input`
              ) : (
                "No input yet"
              )}
              {node.output && !node.output.startsWith("Error:") && " → output ready"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={onRunStep}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {isRunning ? "Running..." : "Run Pipeline"}
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Input source indicator for chained steps */}
      {index > 0 && prevNode?.output && (
        <div className="px-3 py-1.5 border-b bg-primary/5 flex items-center gap-2 text-xs">
          <ArrowRight className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Input from</span>
          <span className="font-medium text-primary">{prevTool?.title}</span>
          <span className="text-muted-foreground font-mono">({prevNode.output.length} chars)</span>
        </div>
      )}

      {/* Tool Component or Fallback Config */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {ToolComponent ? (
            <PipelineModeProvider>
              <ToolComponent
                key={`pipeline-${node.id}-${quickHash(effectiveInput || "")}`}
                tabId={`pipeline-${node.id}`}
                initialInput={effectiveInput || ""}
                onOutputChange={onOutputCapture}
              />
            </PipelineModeProvider>
          ) : (
            <FallbackConfig
              node={{ ...node, input: effectiveInput }}
              index={index}
              onUpdateConfig={() => {}}
              onCopy={() => {}}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Fallback Config — for tools without a registered component
   ═══════════════════════════════════════════════════════════════ */
function FallbackConfig({
  node,
  index,
  onUpdateConfig,
  onCopy,
}: {
  node: PipelineNode
  index: number
  onUpdateConfig: (key: string, value: unknown) => void
  onCopy: (text: string, label: string) => void
}) {
  const tool = getToolById(node.toolId)
  if (!tool) return null

  const schema = toolConfigSchemas[node.toolId] || []
  const hasOutput = !!node.output

  return (
    <div className="space-y-5">
      {schema.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Configuration
            </span>
          </div>
          {schema.map((field) => {
            const value = getConfigValue(node, field.key, schema)
            return (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {field.label}
                </Label>
                {field.type === "number" && (
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[value as number]}
                      onValueChange={([v]) => onUpdateConfig(field.key, v)}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-8 text-right tabular-nums">
                      {value as number}
                    </span>
                  </div>
                )}
                {field.type === "select" && (
                  <Select
                    value={String(value)}
                    onValueChange={(v) => onUpdateConfig(field.key, v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "boolean" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(v) => onUpdateConfig(field.key, v)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {value ? "On" : "Off"}
                    </span>
                  </div>
                )}
                {field.type === "text" && (
                  <Input
                    value={String(value || "")}
                    onChange={(e) => onUpdateConfig(field.key, e.target.value)}
                    className="h-8 text-xs font-mono"
                    placeholder={"Enter " + field.label.toLowerCase()}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* I/O Preview */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Input
          </span>
          {node.input && (
            <button onClick={() => onCopy(node.input!, "Input")} className="ml-auto p-0.5 text-muted-foreground hover:text-foreground">
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
        <pre className="text-[11px] font-mono text-muted-foreground bg-muted/50 rounded-md p-2 max-h-32 overflow-auto whitespace-pre-wrap break-all">
          {node.input || <span className="italic">No input yet</span>}
        </pre>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground rotate-180" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Output
          </span>
          {hasOutput && (
            <button onClick={() => onCopy(node.output!, "Output")} className="ml-auto p-0.5 text-muted-foreground hover:text-foreground">
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
        <OutputRenderer
          output={node.output}
          className="text-[11px] font-mono rounded-md p-2 max-h-48 overflow-auto"
          emptyText="Not run yet"
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Pipeline Builder
   ═══════════════════════════════════════════════════════════════ */
export function PipelineBuilder() {
  const {
    activePipeline,
    addPipelineNode,
    insertPipelineNode,
    removePipelineNode,
    updatePipelineNode,
    clearPipeline,
    getToolState,
  } = useWorkspace()
  const { toast } = useToast()

  const [isRunning, setIsRunning] = useState(false)
  const [runningStepIndex, setRunningStepIndex] = useState<number | null>(
    null,
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panRef = useRef<{
    startX: number
    startY: number
    startOffset: { x: number; y: number }
  } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const nodes = activePipeline.nodes
  const selectedNode = nodes.find((n) => n.id === selectedNodeId)
  const selectedIndex = selectedNode ? nodes.indexOf(selectedNode) : -1

  // Assign default positions to nodes that don't have them
  useEffect(() => {
    nodes.forEach((node, i) => {
      if (!node.position) {
        updatePipelineNode(node.id, { position: defaultPosition(i) })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length])

  const handleAddTool = useCallback(
    (toolId: string) => {
      if (insertAtIndex !== null) {
        insertPipelineNode(toolId, insertAtIndex - 1)
        setInsertAtIndex(null)
      } else {
        addPipelineNode(toolId)
      }
    },
    [addPipelineNode, insertPipelineNode, insertAtIndex],
  )

  const handleInsertAt = useCallback((index: number) => {
    setInsertAtIndex(index)
  }, [])

  const handlePositionChange = useCallback(
    (nodeId: string, pos: { x: number; y: number }) => {
      updatePipelineNode(nodeId, { position: pos })
    },
    [updatePipelineNode],
  )

  const handleConfigChange = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      updatePipelineNode(nodeId, {
        config: { ...node.config, [key]: value },
      })
    },
    [nodes, updatePipelineNode],
  )

  // Canvas pan
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return
      setSelectedNodeId(null)
      if (e.button === 1 || e.ctrlKey || e.metaKey) {
        setIsPanning(true)
        panRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startOffset: { ...canvasOffset },
        }
      }
    },
    [canvasOffset],
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !panRef.current) return
      setCanvasOffset({
        x:
          panRef.current.startOffset.x +
          (e.clientX - panRef.current.startX),
        y:
          panRef.current.startOffset.y +
          (e.clientY - panRef.current.startY),
      })
    },
    [isPanning],
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false)
    panRef.current = null
  }, [])

  // Zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom((z) => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)))
    }
  }, [])

  const fitToView = useCallback(() => {
    if (nodes.length === 0) return
    setZoom(1)
    setCanvasOffset({ x: 0, y: 0 })
  }, [nodes.length])

  // Run pipeline
  const runFromStep = useCallback(
    async (targetIndex: number) => {
      if (nodes.length === 0) return
      setIsRunning(true)
      try {
        let startIndex = 0
        for (let i = 0; i <= targetIndex; i++) {
          if (i === 0) {
            startIndex = 0
            break
          }
          if (!nodes[i - 1]?.output) {
            startIndex = i - 1
            break
          }
          startIndex = i
        }
        let currentInput =
          startIndex === 0
            ? nodes[0]?.input || ""
            : nodes[startIndex - 1]?.output || ""

        for (let i = startIndex; i <= targetIndex; i++) {
          const node = nodes[i]
          setRunningStepIndex(i)
          if (i === 0) currentInput = node.input || ""
          else updatePipelineNode(node.id, { input: currentInput })
          await new Promise((r) => setTimeout(r, 300))
          // Merge node.config with tool component state for config-aware processing
          const toolState = getToolState(`pipeline-${node.id}`) || {}
          const mergedConfig = { ...node.config, ...toolState }
          const output = await processToolStep(
            node.toolId,
            currentInput,
            mergedConfig,
          )
          updatePipelineNode(node.id, { output })
          // Passthrough tools (validators, counters, etc.) show their
          // result but forward the original input to the next step.
          if (!PASSTHROUGH_TOOLS.has(node.toolId)) {
            currentInput = output
          }
        }
      } finally {
        setIsRunning(false)
        setRunningStepIndex(null)
      }
    },
    [nodes, updatePipelineNode],
  )

  const runAll = useCallback(async () => {
    if (nodes.length === 0) return
    await runFromStep(nodes.length - 1)
  }, [nodes.length, runFromStep])

  const handleReset = useCallback(() => {
    nodes.forEach((node, i) => {
      updatePipelineNode(node.id, { output: undefined })
      if (i > 0) updatePipelineNode(node.id, { input: undefined })
    })
    setSelectedNodeId(null)
  }, [nodes, updatePipelineNode])

  const getNodeStatus = (
    index: number,
  ): "idle" | "running" | "done" | "error" => {
    if (runningStepIndex === index) return "running"
    const node = nodes[index]
    if (!node?.output) return "idle"
    if (node.output.startsWith("Error:")) return "error"
    return "done"
  }

  const copyText = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text)
      toast({ title: label + " copied" })
    },
    [toast],
  )

  const firstInput = nodes.length > 0 ? nodes[0]?.input : ""
  const lastOutput =
    nodes.length > 0 ? nodes[nodes.length - 1]?.output : null

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b px-3 sm:px-4 py-2 flex items-center justify-between gap-2 bg-card/50 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Workflow className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-sm">Pipeline</span>
          {nodes.length > 0 && (
            <div className="hidden md:flex items-center text-xs text-muted-foreground font-mono">
              <span>
                {nodes.length} step{nodes.length !== 1 ? "s" : ""}
              </span>
              <span className="mx-2 text-border">|</span>
              {nodes.map((n, i) => {
                const t = getToolById(n.toolId)
                return (
                  <span key={n.id} className="flex items-center">
                    <button
                      onClick={() => setSelectedNodeId(n.id)}
                      className={cn(
                        "hover:text-primary transition-colors truncate max-w-[100px]",
                        selectedNodeId === n.id && "text-primary",
                      )}
                    >
                      {t?.title || n.toolId}
                    </button>
                    {i < nodes.length - 1 && (
                      <ArrowRight className="h-2.5 w-2.5 mx-1 text-muted-foreground/40" />
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {nodes.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleReset}
                disabled={isRunning}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                onClick={clearPipeline}
                disabled={isRunning}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
            </>
          )}
          <ToolPicker onSelect={handleAddTool}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Step
            </Button>
          </ToolPicker>
          {nodes.length > 0 && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs gap-1.5"
              onClick={runAll}
              disabled={
                nodes.length === 0 || isRunning || !firstInput
              }
            >
              {isRunning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {isRunning ? "Running..." : "Run All"}
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {nodes.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Workflow className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1.5">
                Build a Pipeline
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Chain tools together. Output of each step flows into
                the next. Click a step to configure it.
              </p>
              <ToolPicker onSelect={handleAddTool}>
                <Button
                  variant="outline"
                  className="mb-5 border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add first step
                </Button>
              </ToolPicker>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Quick start
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    {
                      label: "JSON > Base64",
                      steps: ["json-formatter", "base64-encode"],
                    },
                    {
                      label: "Base64 > JSON",
                      steps: ["base64-decode", "json-formatter"],
                    },
                    {
                      label: "URL Decode > JSON",
                      steps: ["url-decode", "json-formatter"],
                    },
                    {
                      label: "Minify CSS > Base64",
                      steps: ["minify-css", "base64-encode"],
                    },
                    {
                      label: "JSON > YAML",
                      steps: [
                        "json-formatter",
                        "json-yaml-converter",
                      ],
                    },
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      onClick={() =>
                        tpl.steps.forEach((s) =>
                          addPipelineNode(s),
                        )
                      }
                      className="px-2.5 py-1 text-xs rounded-full border border-dashed hover:border-primary hover:text-primary transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Left: Input panel */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-col shrink-0 max-h-32 md:max-h-none">
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pipeline Input
                </span>
                {firstInput && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {firstInput.length}c
                  </span>
                )}
              </div>
              <Textarea
                value={firstInput || ""}
                onChange={(e) => {
                  if (nodes.length > 0)
                    updatePipelineNode(nodes[0].id, {
                      input: e.target.value,
                    })
                }}
                placeholder="Paste or type your input..."
                className="flex-1 border-0 rounded-none resize-none text-sm font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Center: Mobile List View (hidden on md+) */}
            <div className="flex-1 overflow-auto md:hidden">
              <MobileStepList
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                onRemoveNode={(id) => {
                  removePipelineNode(id)
                  if (selectedNodeId === id) setSelectedNodeId(null)
                }}
                onRunStep={runFromStep}
                onInsertAt={handleInsertAt}
                onAddTool={handleAddTool}
                getNodeStatus={getNodeStatus}
              />
            </div>

            {/* Center: Canvas (hidden on mobile) */}
            <div
              className="hidden md:flex flex-1 relative overflow-hidden bg-[hsl(var(--background))]"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleWheel}
              style={{
                cursor: isPanning ? "grabbing" : "default",
              }}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px)",
                  backgroundSize:
                    24 * zoom + "px " + 24 * zoom + "px",
                  backgroundPosition:
                    canvasOffset.x + "px " + canvasOffset.y + "px",
                }}
              />

              {/* Canvas content (zoomable, pannable) */}
              <div
                ref={canvasRef}
                className="absolute inset-0"
                style={{
                  transform:
                    "translate(" +
                    canvasOffset.x +
                    "px, " +
                    canvasOffset.y +
                    "px) scale(" +
                    zoom +
                    ")",
                  transformOrigin: "0 0",
                }}
              >
                {/* SVG Connections */}
                <Connections nodes={nodes} onInsertAt={handleInsertAt} />

                {/* Insert tool picker (shown when clicking a connection midpoint) */}
                {insertAtIndex !== null && nodes.length >= 2 && (() => {
                  const prevIdx = insertAtIndex - 1
                  const nextIdx = insertAtIndex
                  if (prevIdx < 0 || nextIdx >= nodes.length) return null
                  const p1 = nodes[prevIdx].position || defaultPosition(prevIdx)
                  const p2 = nodes[nextIdx].position || defaultPosition(nextIdx)
                  const conn = getSmartConnectionPoints(p1, p2)
                  const midX = (conn.x1 + conn.x2) / 2
                  const midY = (conn.y1 + conn.y2) / 2
                  return (
                    <div
                      style={{
                        position: "absolute",
                        left: midX,
                        top: midY,
                        transform: "translate(-50%, -50%)",
                        zIndex: 50,
                      }}
                    >
                      <ToolPicker 
                        onSelect={(toolId) => {
                          handleAddTool(toolId)
                        }}
                      >
                        <button 
                          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-pulse"
                          onClick={() => setInsertAtIndex(null)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </ToolPicker>
                      <button
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-card border text-muted-foreground hover:text-foreground flex items-center justify-center"
                        onClick={() => setInsertAtIndex(null)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )
                })()}

                {/* Nodes */}
                {nodes.map((node, index) => (
                  <div key={node.id} data-node>
                    <CanvasNode
                      node={node}
                      index={index}
                      totalNodes={nodes.length}
                      prevNode={index > 0 ? nodes[index - 1] : undefined}
                      nextNode={index < nodes.length - 1 ? nodes[index + 1] : undefined}
                      status={getNodeStatus(index)}
                      selected={selectedNodeId === node.id}
                      onSelect={() =>
                        setSelectedNodeId(
                          selectedNodeId === node.id
                            ? null
                            : node.id,
                        )
                      }
                      onPositionChange={(pos) =>
                        handlePositionChange(node.id, pos)
                      }
                      onRemove={() => {
                        removePipelineNode(node.id)
                        if (selectedNodeId === node.id)
                          setSelectedNodeId(null)
                      }}
                      onRunStep={() => runFromStep(index)}
                      zoom={zoom}
                    />
                  </div>
                ))}

                {/* "Add" button after last node */}
                {nodes.length > 0 &&
                  (() => {
                    const lastPos =
                      nodes[nodes.length - 1].position ||
                      defaultPosition(nodes.length - 1)
                    return (
                      <div
                        style={{
                          position: "absolute",
                          left: lastPos.x + NODE_W + 30,
                          top:
                            lastPos.y + NODE_H / 2 - 14,
                        }}
                      >
                        <ToolPicker onSelect={handleAddTool}>
                          <button className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-card">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </ToolPicker>
                      </div>
                    )
                  })()}
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-card/80 backdrop-blur border rounded-lg p-1 shadow-sm">
                <button
                  onClick={() =>
                    setZoom((z) => Math.min(2, z + 0.1))
                  }
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono text-muted-foreground w-10 text-center tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() =>
                    setZoom((z) => Math.max(0.3, z - 0.1))
                  }
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-4 bg-border mx-0.5" />
                <button
                  onClick={fitToView}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Fit to view"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Step Editor OR Output panel */}
            {selectedNode ? (
              <StepEditor
                node={selectedNode}
                index={selectedIndex}
                prevNode={selectedIndex > 0 ? nodes[selectedIndex - 1] : undefined}
                onClose={() => setSelectedNodeId(null)}
                onRunStep={() => runFromStep(selectedIndex)}
                isRunning={isRunning}
                onOutputCapture={(output) => {
                  updatePipelineNode(selectedNode.id, { output })
                }}
              />
            ) : (
              <div className="w-full md:w-64 border-t md:border-t-0 md:border-l flex flex-col shrink-0">
                <div className="px-3 py-2 border-b flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Final Output
                  </span>
                  {lastOutput && (
                    <button
                      onClick={() =>
                        copyText(lastOutput, "Output")
                      }
                      className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <OutputRenderer
                    output={lastOutput}
                    className={cn(
                      "p-3 text-sm font-mono",
                      lastOutput?.startsWith("Error:")
                        ? "text-red-400"
                        : lastOutput
                          ? "text-emerald-400"
                          : "text-muted-foreground",
                    )}
                    emptyText="Run the pipeline to see results"
                  />
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
