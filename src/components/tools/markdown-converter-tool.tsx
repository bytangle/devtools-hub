import { useState, useEffect, useCallback } from "react"
import { CodeEditor } from "@/components/ui/code-editor"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileDown, Trash2, Zap, Upload, Copy, Download, ClipboardPaste } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type InputFormat = "auto" | "html" | "csv" | "tsv" | "json" | "text"

// ---------------------------------------------------------------------------
// HTML → Markdown
// ---------------------------------------------------------------------------

function escapeMdText(text: string): string {
  // Collapse whitespace like HTML rendering does, escape md-significant chars at line starts
  return text.replace(/\s+/g, " ")
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  // Strip non-content elements
  doc.querySelectorAll("script, style, noscript, template, iframe, svg, head meta, link").forEach(el => el.remove())

  const title = doc.querySelector("title")?.textContent?.trim()
  const body = doc.body
  let md = convertChildren(body, { listDepth: 0 })

  // Collapse 3+ blank lines into one blank line
  md = md.replace(/\n{3,}/g, "\n\n").trim()

  if (title && !md.startsWith("# ")) {
    md = `# ${title}\n\n${md}`
  }
  return md
}

interface ConvertCtx {
  listDepth: number
  ordered?: boolean
  index?: number
}

function convertChildren(node: Node, ctx: ConvertCtx): string {
  let out = ""
  node.childNodes.forEach(child => {
    out += convertNode(child, ctx)
  })
  return out
}

function getCellText(el: Element, ctx: ConvertCtx): string {
  return convertChildren(el, ctx).replace(/\n+/g, " ").replace(/\|/g, "\\|").trim()
}

function tableToMarkdown(table: Element, ctx: ConvertCtx): string {
  const rows: string[][] = []
  let headerRow: string[] | null = null

  const trList = Array.from(table.querySelectorAll("tr"))
  trList.forEach(tr => {
    const cells = Array.from(tr.querySelectorAll("th, td")).map(c => getCellText(c, ctx))
    if (cells.length === 0) return
    const isHeader = !headerRow && (tr.querySelector("th") !== null || tr.closest("thead") !== null)
    if (isHeader) headerRow = cells
    else rows.push(cells)
  })

  if (!headerRow && rows.length > 0) {
    // Promote first row to header (GFM tables require one)
    headerRow = rows.shift()!
  }
  if (!headerRow) return ""

  const colCount = Math.max(headerRow.length, ...rows.map(r => r.length), 1)
  const pad = (r: string[]) => Array.from({ length: colCount }, (_, i) => r[i] ?? "")

  const lines = [
    `| ${pad(headerRow).join(" | ")} |`,
    `| ${Array.from({ length: colCount }, () => "---").join(" | ")} |`,
    ...rows.map(r => `| ${pad(r).join(" | ")} |`),
  ]
  return `\n\n${lines.join("\n")}\n\n`
}

function convertNode(node: Node, ctx: ConvertCtx): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMdText(node.textContent || "")
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ""

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": {
      const level = parseInt(tag[1])
      const text = convertChildren(el, ctx).trim()
      return text ? `\n\n${"#".repeat(level)} ${text}\n\n` : ""
    }
    case "p": {
      const text = convertChildren(el, ctx).trim()
      return text ? `\n\n${text}\n\n` : ""
    }
    case "br":
      return "  \n"
    case "hr":
      return "\n\n---\n\n"
    case "strong": case "b": {
      const text = convertChildren(el, ctx).trim()
      return text ? `**${text}**` : ""
    }
    case "em": case "i": {
      const text = convertChildren(el, ctx).trim()
      return text ? `*${text}*` : ""
    }
    case "del": case "s": case "strike": {
      const text = convertChildren(el, ctx).trim()
      return text ? `~~${text}~~` : ""
    }
    case "code": {
      // Inline code only — block code handled by <pre>
      const text = el.textContent || ""
      return text ? `\`${text.replace(/`/g, "\\`")}\`` : ""
    }
    case "pre": {
      const codeEl = el.querySelector("code")
      const text = (codeEl ?? el).textContent || ""
      const langMatch = (codeEl?.className || el.className || "").match(/(?:language|lang)-([\w-]+)/)
      const lang = langMatch ? langMatch[1] : ""
      return `\n\n\`\`\`${lang}\n${text.replace(/\n$/, "")}\n\`\`\`\n\n`
    }
    case "a": {
      const href = el.getAttribute("href") || ""
      const text = convertChildren(el, ctx).trim() || href
      if (!href || href.startsWith("javascript:")) return text
      return `[${text}](${href})`
    }
    case "img": {
      const src = el.getAttribute("src") || ""
      const alt = el.getAttribute("alt") || "image"
      if (!src || src.startsWith("data:")) return alt ? `*[${alt}]*` : ""
      return `![${alt}](${src})`
    }
    case "blockquote": {
      const inner = convertChildren(el, ctx).trim()
      if (!inner) return ""
      const quoted = inner.split("\n").map(l => `> ${l}`).join("\n")
      return `\n\n${quoted}\n\n`
    }
    case "ul": case "ol": {
      const ordered = tag === "ol"
      let idx = ordered ? parseInt(el.getAttribute("start") || "1") : 1
      let out = "\n"
      Array.from(el.children).forEach(child => {
        if (child.tagName.toLowerCase() !== "li") return
        out += listItemToMarkdown(child, { listDepth: ctx.listDepth + 1, ordered, index: idx })
        idx++
      })
      return ctx.listDepth === 0 ? `\n${out}\n` : out
    }
    case "table":
      return tableToMarkdown(el, ctx)
    case "input": {
      // Task list checkboxes
      if (el.getAttribute("type") === "checkbox") {
        return el.hasAttribute("checked") ? "[x] " : "[ ] "
      }
      return ""
    }
    case "dt": {
      const text = convertChildren(el, ctx).trim()
      return text ? `\n\n**${text}**\n` : ""
    }
    case "dd": {
      const text = convertChildren(el, ctx).trim()
      return text ? `: ${text}\n` : ""
    }
    case "figcaption": {
      const text = convertChildren(el, ctx).trim()
      return text ? `\n*${text}*\n` : ""
    }
    default:
      // div, span, section, article, main, etc. — pass through
      return convertChildren(el, ctx)
  }
}

function listItemToMarkdown(li: Element, ctx: ConvertCtx): string {
  const indent = "  ".repeat(Math.max(0, ctx.listDepth - 1))
  const marker = ctx.ordered ? `${ctx.index}.` : "-"
  const inner = convertChildren(li, ctx).trim()
  if (!inner) return ""
  const lines = inner.split("\n")
  const first = `${indent}${marker} ${lines[0]}`
  const rest = lines.slice(1).map(l => (l.trim() ? `${indent}  ${l}` : l)).join("\n")
  return rest ? `${first}\n${rest}\n` : `${first}\n`
}

// ---------------------------------------------------------------------------
// CSV / TSV → Markdown table
// ---------------------------------------------------------------------------

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += ch
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(field); field = ""
    } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
      if (ch === "\r") i++
      row.push(field); field = ""
      if (row.some(c => c.trim() !== "")) rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  row.push(field)
  if (row.some(c => c.trim() !== "")) rows.push(row)
  return rows
}

function delimitedToMarkdown(text: string, delimiter: string): string {
  const rows = parseDelimited(text.trim(), delimiter)
  if (rows.length === 0) return ""

  const colCount = Math.max(...rows.map(r => r.length))
  const clean = (v: string) => v.replace(/\|/g, "\\|").replace(/\n/g, " ").trim()
  const pad = (r: string[]) => Array.from({ length: colCount }, (_, i) => clean(r[i] ?? ""))

  const [header, ...body] = rows
  return [
    `| ${pad(header).join(" | ")} |`,
    `| ${Array.from({ length: colCount }, () => "---").join(" | ")} |`,
    ...body.map(r => `| ${pad(r).join(" | ")} |`),
  ].join("\n")
}

// ---------------------------------------------------------------------------
// JSON → Markdown
// ---------------------------------------------------------------------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function formatScalar(v: unknown): string {
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v.replace(/\|/g, "\\|").replace(/\n/g, " ")
  return String(v)
}

function jsonArrayToTable(arr: Record<string, unknown>[]): string {
  const keys: string[] = []
  arr.forEach(obj => Object.keys(obj).forEach(k => { if (!keys.includes(k)) keys.push(k) }))
  const lines = [
    `| ${keys.join(" | ")} |`,
    `| ${keys.map(() => "---").join(" | ")} |`,
    ...arr.map(obj => `| ${keys.map(k => {
      const v = obj[k]
      return isPlainObject(v) || Array.isArray(v) ? `\`${JSON.stringify(v).replace(/\|/g, "\\|")}\`` : formatScalar(v)
    }).join(" | ")} |`),
  ]
  return lines.join("\n")
}

function jsonToMarkdown(value: unknown, depth = 1): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && value.every(isPlainObject)) {
      return jsonArrayToTable(value as Record<string, unknown>[])
    }
    return value.map(v =>
      isPlainObject(v) || Array.isArray(v)
        ? `- \`${JSON.stringify(v)}\``
        : `- ${formatScalar(v)}`
    ).join("\n")
  }
  if (isPlainObject(value)) {
    const parts: string[] = []
    const scalars: [string, unknown][] = []
    const nested: [string, unknown][] = []
    Object.entries(value).forEach(([k, v]) => {
      if (isPlainObject(v) || Array.isArray(v)) nested.push([k, v])
      else scalars.push([k, v])
    })
    if (scalars.length > 0) {
      parts.push(scalars.map(([k, v]) => `- **${k}:** ${formatScalar(v)}`).join("\n"))
    }
    nested.forEach(([k, v]) => {
      const heading = "#".repeat(Math.min(depth + 1, 6))
      parts.push(`${heading} ${k}\n\n${jsonToMarkdown(v, depth + 1)}`)
    })
    return parts.join("\n\n")
  }
  return formatScalar(value)
}

// ---------------------------------------------------------------------------
// Format detection
// ---------------------------------------------------------------------------

function detectFormat(input: string): Exclude<InputFormat, "auto"> {
  const trimmed = input.trim()
  if (!trimmed) return "text"

  // HTML: starts with a tag or contains common html tags
  if (/^\s*(<!doctype html|<html|<body|<div|<p[\s>]|<h[1-6]|<table|<ul|<ol|<section|<article|<span|<a\s)/i.test(trimmed) ||
      (/<\/[a-z][\w-]*>/i.test(trimmed) && /<[a-z][\w-]*[^>]*>/i.test(trimmed))) {
    return "html"
  }
  // JSON
  if (/^[[{]/.test(trimmed)) {
    try { JSON.parse(trimmed); return "json" } catch { /* not json */ }
  }
  // TSV before CSV: consistent tabs across lines
  const lines = trimmed.split("\n").filter(l => l.trim())
  if (lines.length >= 2) {
    const tabCounts = lines.slice(0, 5).map(l => (l.match(/\t/g) || []).length)
    if (tabCounts[0] > 0 && tabCounts.every(c => c === tabCounts[0])) return "tsv"
    const commaCounts = lines.slice(0, 5).map(l => parseDelimited(l, ",")[0]?.length ?? 0)
    if (commaCounts[0] > 1 && commaCounts.every(c => c === commaCounts[0])) return "csv"
  }
  return "text"
}

function textToMarkdown(text: string): string {
  // Normalize plain text into Markdown paragraphs, keep existing structure
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .join("\n\n")
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<Exclude<InputFormat, "auto">, string> = {
  html: "HTML",
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  text: "Plain text",
}

export function MarkdownConverterTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()

  const [input, setInput] = useState<string>(initialInput || (savedState?.input as string) || "")
  const [format, setFormat] = useState<InputFormat>((savedState?.format as InputFormat) || "auto")
  const [frontMatter, setFrontMatter] = useState<boolean>((savedState?.frontMatter as boolean) ?? false)
  const [output, setOutput] = useState("")
  const [detected, setDetected] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>((savedState?.fileName as string) || "")

  useEffect(() => {
    if (initialInput) setInput(initialInput)
  }, [initialInput])

  useEffect(() => {
    setToolState(tabId, { input, format, frontMatter, fileName })
  }, [input, format, frontMatter, fileName, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) onOutputChange(output)
  }, [output, onOutputChange])

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput("")
      setDetected(null)
      return
    }
    const effective = format === "auto" ? detectFormat(input) : format
    setDetected(format === "auto" ? FORMAT_LABELS[effective] : null)

    let md = ""
    try {
      switch (effective) {
        case "html": md = htmlToMarkdown(input); break
        case "csv": md = delimitedToMarkdown(input, ","); break
        case "tsv": md = delimitedToMarkdown(input, "\t"); break
        case "json": md = jsonToMarkdown(JSON.parse(input)); break
        default: md = textToMarkdown(input)
      }
    } catch (e) {
      toast({
        title: "Conversion failed",
        description: e instanceof Error ? e.message : "Invalid input for the selected format",
        variant: "destructive",
      })
      return
    }

    if (frontMatter) {
      const fm = [
        "---",
        fileName ? `source: ${fileName}` : null,
        `format: ${effective}`,
        `converted: ${new Date().toISOString()}`,
        "---",
      ].filter(Boolean).join("\n")
      md = `${fm}\n\n${md}`
    }

    setOutput(md)
    toast({ title: `Converted ${FORMAT_LABELS[effective]} to Markdown` })
  }, [input, format, frontMatter, fileName, toast])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setInput((event.target?.result as string) || "")
      setFileName(file.name)
      const ext = file.name.split(".").pop()?.toLowerCase()
      if (ext === "html" || ext === "htm") setFormat("html")
      else if (ext === "csv") setFormat("csv")
      else if (ext === "tsv") setFormat("tsv")
      else if (ext === "json") setFormat("json")
      else setFormat("auto")
      toast({ title: `Loaded ${file.name}` })
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const pasteRichText = async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        if (item.types.includes("text/html")) {
          const blob = await item.getType("text/html")
          const html = await blob.text()
          setInput(html)
          setFormat("html")
          toast({ title: "Pasted rich text as HTML — hit Convert" })
          return
        }
      }
      const text = await navigator.clipboard.readText()
      setInput(text)
      setFormat("auto")
      toast({ title: "Pasted plain text from clipboard" })
    } catch {
      toast({ title: "Clipboard access denied", description: "Paste directly into the input panel instead.", variant: "destructive" })
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast({ title: "Markdown copied to clipboard" })
  }

  const downloadOutput = () => {
    if (!output) return
    const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "converted"
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${base}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setDetected(null)
    setFileName("")
  }

  return (
    <ToolShell
      icon={FileDown}
      title="Markdown Converter"
      description="Convert HTML, CSV, JSON & rich text to Markdown"
    >
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Format:</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as InputFormat)}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="tsv">TSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Plain text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch id={`fm-${tabId}`} checked={frontMatter} onCheckedChange={setFrontMatter} />
                <Label htmlFor={`fm-${tabId}`} className="text-xs cursor-pointer">Front matter</Label>
              </div>

              <label className="cursor-pointer">
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".html,.htm,.csv,.tsv,.json,.txt,.xml,.log,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <Button size="sm" variant="outline" onClick={pasteRichText}>
                <ClipboardPaste className="h-3 w-3 mr-1" />
                Paste rich text
              </Button>

              {detected && (
                <span className="text-xs text-muted-foreground">Detected: <span className="font-medium text-foreground">{detected}</span></span>
              )}
            </div>
          }
          input={
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Paste HTML, CSV, TSV, JSON, or plain text here — or upload a file..."
              language={format === "json" ? "json" : "text"}
              title={fileName ? `Input — ${fileName}` : "Input"}
            />
          }
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={convert} className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Convert to Markdown</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={copyOutput} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Copy Markdown</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={downloadOutput} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Download .md</p></TooltipContent>
            </Tooltip>
            <div className="w-4 h-px md:w-px md:h-4 bg-border/60" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={clearAll} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Markdown output..."
              language="markdown"
              title="Markdown"
              readOnly
            />
          }
        />
      </TooltipProvider>
    </ToolShell>
  )
}
