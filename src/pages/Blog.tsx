import { Link } from "react-router-dom"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { blogPosts } from "@/data/blog-posts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"

export default function Blog() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "DevTools Hub Blog",
    "description": "Developer guides, tutorials, and best practices for using online developer tools.",
    "url": "https://devv.tools/blog",
    "publisher": {
      "@type": "Organization",
      "name": "DevTools Hub",
      "url": "https://devv.tools"
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
      "url": `https://devv.tools/blog/${post.slug}`,
      "author": { "@type": "Organization", "name": "DevTools Hub" }
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Developer Blog: Guides, Tutorials & Best Practices - DevTools Hub"
        description="Learn about JSON formatting, password security, Base64 encoding, regex patterns, JWT tokens, and more. Free developer guides with practical examples."
        keywords="developer blog, programming tutorials, json guide, regex tutorial, jwt explained, coding best practices"
        canonicalUrl="/blog"
        jsonLd={jsonLd}
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Developer Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Guides, tutorials, and best practices for developers. Learn how to use our tools effectively and level up your workflow.
          </p>
        </div>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
              <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} min read
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all gap-1">
                    Read more <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
