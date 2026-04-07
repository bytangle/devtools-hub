import { useEffect, useRef } from "react"
import { useParams, Navigate } from "react-router-dom"
import { SEO } from "@/components/SEO"
import { tools } from "@/data/tools"
import { useWorkspace } from "@/context/workspace-context"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"

/**
 * Renders the workspace layout with the requested tool auto-opened in a tab.
 * Also injects SEO meta tags + JSON-LD so crawlers get proper per-tool metadata.
 */
export default function GenericToolPage() {
  const { toolId } = useParams<{ toolId: string }>()
  const { openTool } = useWorkspace()
  const hasOpened = useRef(false)

  const tool = tools.find(t => t.id === toolId)

  // Auto-open the tool in the workspace on mount
  useEffect(() => {
    if (tool && !hasOpened.current) {
      hasOpened.current = true
      openTool(tool.id)
    }
  }, [tool, openTool])

  if (!tool) {
    return <Navigate to="/not-found" replace />
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "description": tool.description,
    "url": `https://devv.tools${tool.href}`,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "DevTools Hub",
      "url": "https://devv.tools"
    }
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "DevTools Hub",
        "item": "https://devv.tools"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${tool.category}s`,
        "item": `https://devv.tools/${tool.category.toLowerCase()}s`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.title,
        "item": `https://devv.tools${tool.href}`
      }
    ]
  }

  return (
    <>
      <SEO
        title={`${tool.title} - Free Online ${tool.category} Tool`}
        description={tool.description}
        keywords={tool.keywords?.join(", ")}
        canonicalUrl={tool.href}
        jsonLd={jsonLd}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <WorkspaceLayout />
    </>
  )
}
