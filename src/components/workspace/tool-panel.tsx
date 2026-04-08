import { useWorkspace } from "@/context/workspace-context"
import { ScrollArea } from "@/components/ui/scroll-area"

// Tool Components (will be refactored to embeddable versions)
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
import { TextCounterTool } from "@/components/tools/text-counter-tool"
import { DiffCheckerTool } from "@/components/tools/diff-checker-tool"
import { LoremGeneratorTool } from "@/components/tools/lorem-generator-tool"
import { MarkdownPreviewTool } from "@/components/tools/markdown-preview-tool"
import { JwtDecoderTool } from "@/components/tools/jwt-decoder-tool"
import { CssMinifierTool } from "@/components/tools/css-minifier-tool"
import { JsMinifierTool } from "@/components/tools/js-minifier-tool"
// New tools
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

interface ToolPanelProps {
  tabId: string | null | undefined
}

// Tool component registry
export const toolComponents: Record<string, React.ComponentType<ToolComponentProps>> = {
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
  "text-counter": TextCounterTool,
  "diff-checker": DiffCheckerTool,
  "lorem-generator": LoremGeneratorTool,
  "markdown-preview": MarkdownPreviewTool,
  "jwt-decoder": JwtDecoderTool,
  "minify-css": CssMinifierTool,
  "minify-js": JsMinifierTool,
  // New tools
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

export interface ToolComponentProps {
  tabId: string
  initialInput?: string
  onOutputChange?: (output: string) => void
}

export function ToolPanel({ tabId }: ToolPanelProps) {
  const { getTabById, getToolState, setToolState } = useWorkspace()

  if (!tabId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>No tool selected</p>
      </div>
    )
  }

  const tab = getTabById(tabId)
  if (!tab) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Tab not found</p>
      </div>
    )
  }

  const ToolComponent = toolComponents[tab.toolId]
  if (!ToolComponent) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Tool "{tab.toolId}" not found</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <ToolComponent 
          tabId={tabId}
        />
      </div>
    </div>
  )
}
