import { useParams, Navigate, Link } from "react-router-dom"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { blogPosts } from "@/data/blog-posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react"

function renderMarkdown(content: string): string {
  let html = content
    // Code blocks (fenced)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trimEnd()
      return `<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono" data-lang="${lang}">${escaped}</code></pre>`
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_match, header, body) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean)
      const rows = body.trim().split('\n').map((r: string) =>
        r.split('|').map((c: string) => c.trim()).filter(Boolean)
      )
      return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse text-sm"><thead><tr>${headers.map((h: string) => `<th class="border border-border bg-muted px-3 py-2 text-left font-medium">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row: string[]) => `<tr>${row.map((c: string) => `<td class="border border-border px-3 py-2">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc mb-1">$1</li>')
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, (line) => {
      if (line.startsWith('<li') || line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<div') || line.startsWith('<table')) return line
      return `<p class="mb-4 text-muted-foreground leading-relaxed">${line}</p>`
    })
  
  // Wrap consecutive list items
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-4 space-y-1">$1</ul>')

  return html
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()

  const post = blogPosts.find(p => p.slug === slug)
  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const postIndex = blogPosts.indexOf(post)
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null
  const nextPost = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Organization",
      "name": "DevTools Hub",
      "url": "https://devtools-hub.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DevTools Hub",
      "url": "https://devtools-hub.com",
      "logo": { "@type": "ImageObject", "url": "https://dev-tools-hub.s3.us-east-1.amazonaws.com/og.png" }
    },
    "mainEntityOfPage": `https://devtools-hub.com/blog/${post.slug}`,
    "keywords": post.keywords.join(", "),
    "wordCount": post.content.split(/\s+/).length,
    "timeRequired": `PT${post.readingTime}M`
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "DevTools Hub", "item": "https://devtools-hub.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://devtools-hub.com/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://devtools-hub.com/blog/${post.slug}` }
    ]
  }

  const faqLd = post.content.includes('##') ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.content
      .split('\n## ')
      .slice(1, 4)
      .map(section => {
        const lines = section.split('\n')
        const question = lines[0].replace(/^#+\s*/, '')
        const answer = lines.slice(1).join(' ').replace(/[#`*\[\]()]/g, '').trim().slice(0, 300)
        return {
          "@type": "Question",
          "name": question,
          "acceptedAnswer": { "@type": "Answer", "text": answer }
        }
      })
  } : undefined

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.keywords.join(", ")}
        canonicalUrl={`/blog/${post.slug}`}
        type="article"
        jsonLd={jsonLd}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <span>/</span>
          <span className="text-foreground truncate">{post.title}</span>
        </nav>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground">{post.description}</p>
          </header>

          {/* Article Content */}
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Tool CTA */}
          {post.toolId && (
            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Try This Tool Now</h3>
              <p className="text-muted-foreground mb-4">Use the tool mentioned in this article — free, no signup required.</p>
              <Button asChild>
                <Link to={`/tools/${post.toolId}`}>Open Tool →</Link>
              </Button>
            </div>
          )}
        </article>

        {/* Navigation */}
        <nav className="flex justify-between mt-12 pt-8 border-t">
          {prevPost ? (
            <Link to={`/blog/${prevPost.slug}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Previous</div>
                <div className="font-medium line-clamp-1 max-w-[200px]">{prevPost.title}</div>
              </div>
            </Link>
          ) : <div />}
          {nextPost ? (
            <Link to={`/blog/${nextPost.slug}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors text-right">
              <div>
                <div className="text-xs text-muted-foreground">Next</div>
                <div className="font-medium line-clamp-1 max-w-[200px]">{nextPost.title}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : <div />}
        </nav>
      </main>
    </div>
  )
}
