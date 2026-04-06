import { useParams, Navigate } from "react-router-dom"
import { Header } from "@/components/layout/header"
import { SEO } from "@/components/SEO"
import { tools } from "@/data/tools"

// Import tool components from the workspace tool registry
import { JsonFormatterTool } from "@/components/tools/json-formatter-tool"
import { HtmlFormatterTool } from "@/components/tools/html-formatter-tool"
import { CssFormatterTool } from "@/components/tools/css-formatter-tool"
import { SqlFormatterTool } from "@/components/tools/sql-formatter-tool"
import { Base64EncoderTool } from "@/components/tools/base64-encoder-tool"
import { Base64DecoderTool } from "@/components/tools/base64-decoder-tool"
import { PasswordGeneratorTool } from "@/components/tools/password-generator-tool"
import { UuidGeneratorTool } from "@/components/tools/uuid-generator-tool"
import { HashGeneratorTool } from "@/components/tools/hash-generator-tool"
import { UrlEncoderTool } from "@/components/tools/url-encoder-tool"
import { UrlDecoderTool } from "@/components/tools/url-decoder-tool"
import { CssValidatorTool } from "@/components/tools/css-validator-tool"
import { HtmlValidatorTool } from "@/components/tools/html-validator-tool"
import { JsonValidatorTool } from "@/components/tools/json-validator-tool"
import { ColorPickerTool } from "@/components/tools/color-picker-tool"
import { ImageOptimizerTool } from "@/components/tools/image-optimizer-tool"
import { QrGeneratorTool } from "@/components/tools/qr-generator-tool"
import { TimestampConverterTool } from "@/components/tools/timestamp-converter-tool"
import { RegexTesterTool } from "@/components/tools/regex-tester-tool"
import { UrlShortenerTool } from "@/components/tools/url-shortener-tool"
import { TextCounterTool } from "@/components/tools/text-counter-tool"
import { DiffCheckerTool } from "@/components/tools/diff-checker-tool"
import { LoremGeneratorTool } from "@/components/tools/lorem-generator-tool"
import { MarkdownPreviewTool } from "@/components/tools/markdown-preview-tool"
import { JwtDecoderTool } from "@/components/tools/jwt-decoder-tool"
import { CssMinifierTool } from "@/components/tools/css-minifier-tool"
import { JsMinifierTool } from "@/components/tools/js-minifier-tool"
import { TextCaseConverterTool } from "@/components/tools/text-case-converter-tool"
import { BaseConverterTool } from "@/components/tools/base-converter-tool"
import { YamlFormatterTool } from "@/components/tools/yaml-formatter-tool"
import { JsonYamlConverterTool } from "@/components/tools/json-yaml-converter-tool"
import { CronBuilderTool } from "@/components/tools/cron-builder-tool"
import { UnixPermissionsTool } from "@/components/tools/unix-permissions-tool"
import { CsvJsonConverterTool } from "@/components/tools/csv-json-converter-tool"
import { XmlFormatterTool } from "@/components/tools/xml-formatter-tool"
import { HttpStatusTool } from "@/components/tools/http-status-tool"
import { MockDataGeneratorTool } from "@/components/tools/mock-data-generator-tool"
import { EscapeUnescapeTool } from "@/components/tools/escape-unescape-tool"
import { ByteUnitConverterTool } from "@/components/tools/byte-unit-converter-tool"
import { GraphqlFormatterTool } from "@/components/tools/graphql-formatter-tool"
import { JwtGeneratorTool } from "@/components/tools/jwt-generator-tool"

const toolComponents: Record<string, React.ComponentType<any>> = {
  "json-formatter": JsonFormatterTool,
  "html-formatter": HtmlFormatterTool,
  "css-formatter": CssFormatterTool,
  "sql-formatter": SqlFormatterTool,
  "base64-encode": Base64EncoderTool,
  "base64-decode": Base64DecoderTool,
  "password-generator": PasswordGeneratorTool,
  "uuid-generator": UuidGeneratorTool,
  "hash-generator": HashGeneratorTool,
  "url-encode": UrlEncoderTool,
  "url-decode": UrlDecoderTool,
  "css-validator": CssValidatorTool,
  "html-validator": HtmlValidatorTool,
  "json-validator": JsonValidatorTool,
  "color-picker": ColorPickerTool,
  "image-optimizer": ImageOptimizerTool,
  "qr-generator": QrGeneratorTool,
  "timestamp-converter": TimestampConverterTool,
  "regex-tester": RegexTesterTool,
  "url-shortener": UrlShortenerTool,
  "text-counter": TextCounterTool,
  "diff-checker": DiffCheckerTool,
  "lorem-generator": LoremGeneratorTool,
  "markdown-preview": MarkdownPreviewTool,
  "jwt-decoder": JwtDecoderTool,
  "minify-css": CssMinifierTool,
  "minify-js": JsMinifierTool,
  "text-case-converter": TextCaseConverterTool,
  "base-converter": BaseConverterTool,
  "yaml-formatter": YamlFormatterTool,
  "json-yaml-converter": JsonYamlConverterTool,
  "cron-builder": CronBuilderTool,
  "unix-permissions": UnixPermissionsTool,
  "csv-json-converter": CsvJsonConverterTool,
  "xml-formatter": XmlFormatterTool,
  "http-status": HttpStatusTool,
  "mock-data-generator": MockDataGeneratorTool,
  "escape-unescape": EscapeUnescapeTool,
  "byte-unit-converter": ByteUnitConverterTool,
  "graphql-formatter": GraphqlFormatterTool,
  "jwt-generator": JwtGeneratorTool,
}

export default function GenericToolPage() {
  const { toolId } = useParams<{ toolId: string }>()

  const tool = tools.find(t => t.id === toolId)
  if (!tool) {
    return <Navigate to="/not-found" replace />
  }

  const ToolComponent = toolComponents[tool.id]
  if (!ToolComponent) {
    return <Navigate to="/not-found" replace />
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "description": tool.description,
    "url": `https://devtools-hub.com${tool.href}`,
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
      "url": "https://devtools-hub.com"
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
        "item": "https://devtools-hub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${tool.category}s`,
        "item": `https://devtools-hub.com/${tool.category.toLowerCase()}s`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.title,
        "item": `https://devtools-hub.com${tool.href}`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${tool.title} - Free Online ${tool.category} Tool`}
        description={tool.description}
        keywords={tool.keywords?.join(", ")}
        canonicalUrl={tool.href}
        jsonLd={jsonLd}
      />
      {/* Breadcrumb structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* SEO-friendly heading visible to crawlers */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{tool.title}</h1>
          <p className="text-muted-foreground mt-2">{tool.description}</p>
        </div>
        <ToolComponent tabId={`page-${tool.id}`} />
      </main>
    </div>
  )
}
