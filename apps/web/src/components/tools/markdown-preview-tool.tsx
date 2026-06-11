import { useState, useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, Copy, Bold, Italic, Code, Link, List, Heading1, Heading2, Quote, Trash2 } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { Button } from "@/components/ui/button"
import { ToolShell, TwoPanelLayout } from "@/components/tools/shared/tool-shell"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

// Basic HTML sanitizer to prevent XSS attacks
function sanitizeHtml(html: string): string {
  const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'b', 'i', 
    'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div', 'img', 'del', 'sup', 'sub']
  const allowedAttrs = ['class', 'href', 'target', 'rel', 'src', 'alt', 'title']
  
  // Create a temporary DOM element
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Recursively clean nodes
  function cleanNode(node: Element) {
    const tag = node.tagName.toLowerCase()
    
    // Remove disallowed tags (but keep their content)
    if (!allowedTags.includes(tag)) {
      const parent = node.parentNode
      while (node.firstChild) {
        parent?.insertBefore(node.firstChild, node)
      }
      parent?.removeChild(node)
      return
    }
    
    // Remove disallowed attributes
    const attrs = Array.from(node.attributes)
    for (const attr of attrs) {
      if (!allowedAttrs.includes(attr.name)) {
        node.removeAttribute(attr.name)
      } else if (attr.name === 'href' || attr.name === 'src') {
        // Prevent javascript: URLs
        const val = attr.value.toLowerCase().trim()
        if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
          node.removeAttribute(attr.name)
        }
      }
    }
    
    // Force external links to open safely
    if (tag === 'a') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
    
    // Clean children
    Array.from(node.children).forEach(cleanNode)
  }
  
  Array.from(temp.children).forEach(cleanNode)
  return temp.innerHTML
}

// Enhanced markdown parser
function parseMarkdown(md: string): string {
  let html = md
  
  // Escape HTML entities first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  
  // Code blocks (must be first to avoid processing code content)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (_, lang, code) => {
    const langClass = lang ? `language-${lang}` : ''
    return `<pre class="bg-muted/50 border rounded-lg p-4 my-4 overflow-x-auto"><code class="${langClass}">${code.trim()}</code></pre>`
  })
  
  // Inline code (backticks)
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>')
  
  // Headers
  html = html.replace(/^######\s+(.*)$/gm, '<h6 class="text-sm font-semibold mt-4 mb-2 text-muted-foreground">$1</h6>')
  html = html.replace(/^#####\s+(.*)$/gm, '<h5 class="text-base font-semibold mt-4 mb-2">$1</h5>')
  html = html.replace(/^####\s+(.*)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
  html = html.replace(/^###\s+(.*)$/gm, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
  html = html.replace(/^##\s+(.*)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-3 pb-2 border-b">$1</h2>')
  html = html.replace(/^#\s+(.*)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4 pb-2 border-b">$1</h1>')
  
  // Horizontal rules
  html = html.replace(/^(?:[-*_]){3,}$/gm, '<hr class="my-6 border-border" />')
  
  // Bold and italic (order matters)
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  html = html.replace(/~~([^~]+)~~/g, '<del class="text-muted-foreground">$1</del>')
  
  // Blockquotes
  html = html.replace(/^&gt;\s+(.*)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 pr-4 rounded-r">$1</blockquote>')
  
  // Task lists (before regular lists)
  html = html.replace(/^[-*]\s+\[x\]\s+(.*)$/gm, '<li class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="accent-primary" /><span class="line-through text-muted-foreground">$1</span></li>')
  html = html.replace(/^[-*]\s+\[\s?\]\s+(.*)$/gm, '<li class="flex items-center gap-2 my-1"><input type="checkbox" disabled /><span>$1</span></li>')
  
  // Unordered lists
  html = html.replace(/^[-*]\s+(.*)$/gm, '<li class="ml-4 my-1 list-disc">$1</li>')
  
  // Ordered lists
  html = html.replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-4 my-1 list-decimal">$1</li>')
  
  // Links with title
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, text, url, title) => {
    const titleAttr = title ? ` title="${title}"` : ''
    return `<a href="${url}"${titleAttr} class="text-primary underline underline-offset-2 hover:text-primary/80">${text}</a>`
  })
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, alt, src, title) => {
    const titleAttr = title ? ` title="${title}"` : ''
    return `<img src="${src}" alt="${alt}"${titleAttr} class="max-w-full rounded my-4" />`
  })
  
  // Line breaks (double space or \)
  html = html.replace(/  $/gm, '<br />')
  html = html.replace(/\\$/gm, '<br />')
  
  // Paragraphs (blank lines)
  html = html.replace(/\n\n+/g, '</p><p class="my-3">')
  html = '<p class="my-3">' + html + '</p>'
  
  // Clean up empty paragraphs
  html = html.replace(/<p class="my-3"><\/p>/g, '')
  html = html.replace(/<p class="my-3">(<(?:h[1-6]|blockquote|pre|ul|ol|li|hr)[^>]*>)/g, '$1')
  html = html.replace(/(<\/(?:h[1-6]|blockquote|pre|ul|ol|li|hr)>)<\/p>/g, '$1')
  
  return html
}

export function MarkdownPreviewTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()
  
  const [markdown, setMarkdown] = useState(initialInput || savedState?.markdown as string || `# Markdown Preview

    A **powerful** markdown editor with _live preview_.

    ## Features

    - [x] Real-time rendering
    - [x] Code syntax highlighting
    - [ ] Task lists
    - [ ] Tables support

    ### Code Blocks

    \`\`\`typescript
    const greeting = (name: string): string => {
      return \`Hello, \${name}!\`;
    };

    console.log(greeting("World"));
    \`\`\`

    ### Blockquotes

    > "The only way to do great work is to love what you do."  
    > — Steve Jobs

    ### Links & Images

    Check out [GitHub](https://github.com "GitHub Homepage") for more.

    ---

    Made with ♥ using \`devtools_hub\`
  `)

  useEffect(() => {
    setToolState(tabId, { markdown })
  }, [markdown, tabId, setToolState])

  const renderedHtml = useMemo(() => {
    const raw = parseMarkdown(markdown)
    return sanitizeHtml(raw)
  }, [markdown])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(renderedHtml)
    }
  }, [renderedHtml, onOutputChange])

  const insertAtCursor = (before: string, after = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = markdown.substring(start, end)
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end)
    setMarkdown(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const copyHtml = async () => {
    await navigator.clipboard.writeText(renderedHtml)
    toast({ title: "HTML copied to clipboard" })
  }

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toolbarItems = [
    { icon: Bold, action: () => insertAtCursor('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertAtCursor('_', '_'), title: 'Italic' },
    { icon: Code, action: () => insertAtCursor('`', '`'), title: 'Inline Code' },
    { icon: Link, action: () => insertAtCursor('[', '](url)'), title: 'Link' },
    { icon: Heading1, action: () => insertAtCursor('# ', ''), title: 'Heading 1' },
    { icon: Heading2, action: () => insertAtCursor('## ', ''), title: 'Heading 2' },
    { icon: List, action: () => insertAtCursor('- ', ''), title: 'List' },
    { icon: Quote, action: () => insertAtCursor('> ', ''), title: 'Quote' },
  ]

  return (
    <ToolShell
      icon={FileText}
      title="Markdown Preview"
      actions={<>
        {toolbarItems.map((item, i) => (
          <Button key={i} size="sm" variant="ghost" onClick={item.action} title={item.title} className="h-8 w-8 p-0">
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={copyHtml}>
          <Copy className="h-3 w-3 mr-1" />
          Copy HTML
        </Button>
        <Button size="sm" variant="outline" onClick={downloadMd}>
          <Download className="h-3 w-3 mr-1" />
          Export .md
        </Button>
      </>}
    >
      <TooltipProvider delayDuration={200}>
        <TwoPanelLayout
          input={
            <div className="rounded-lg border flex flex-col h-full">
              <div className="p-3 flex-1">
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Write markdown here..."
                  className="h-full min-h-full font-mono text-sm resize-none border-0 focus-visible:ring-0"
                />
              </div>
            </div>
          }
          actions={<>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => setMarkdown("")} className="h-7 w-7 rounded-full text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Clear all</p></TooltipContent>
            </Tooltip>
          </>}
          output={
            <div className="rounded-lg border flex flex-col h-full">
              <div className="p-4 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                </ScrollArea>
              </div>
            </div>
          }
        />
      </TooltipProvider>
    </ToolShell>
  )
}
