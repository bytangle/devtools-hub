import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"
import { createContext, useContext } from "react"

/**
 * Context to indicate when tools are rendered inside a pipeline step.
 * When true, TwoPanelLayout hides the floating action pill.
 */
const PipelineModeContext = createContext(false)

export function PipelineModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <PipelineModeContext.Provider value={true}>
      {children}
    </PipelineModeContext.Provider>
  )
}

export function usePipelineMode() {
  return useContext(PipelineModeContext)
}

interface ToolShellProps {
  icon: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Shared shell for all tool components in workspace mode.
 * Provides: compact header bar, consistent spacing, full-height flex layout.
 */
export function ToolShell({ icon: Icon, title, description, children, actions, className }: ToolShellProps) {
  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      {/* Compact toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight truncate">{title}</h2>
            {description && (
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Tool-specific content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  )
}

/**
 * Two-panel layout with a floating action pill at the junction.
 * Pill overlaps the gap between input/output, uses icon-only buttons with tooltips.
 */
interface TwoPanelLayoutProps {
  input: React.ReactNode
  output: React.ReactNode
  /** Icon-only action buttons rendered inside the floating pill */
  actions: React.ReactNode
  /** Extra content above the panels (e.g., mode tabs, settings) */
  toolbar?: React.ReactNode
  className?: string
}

export function TwoPanelLayout({ input, output, actions, toolbar, className }: TwoPanelLayoutProps) {
  const isPipelineMode = usePipelineMode()
  
  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      {toolbar}
      <div className="flex-1 min-h-0">
        {/* Desktop: side-by-side grid with floating pill */}
        <div className="hidden md:grid md:grid-cols-2 gap-3 h-full relative">
          <div className="min-w-0 min-h-0 [&>*]:h-full">
            {input}
          </div>
          <div className="min-w-0 min-h-0 [&>*]:h-full">
            {output}
          </div>

          {/* Floating action pill — hovers at the panel junction (hidden in pipeline mode) */}
          {!isPipelineMode && (
            <div className="absolute inset-x-0 top-[35%] pointer-events-none flex justify-center z-10">
              <div className="pointer-events-auto flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border/60 shadow-lg shadow-black/20 h-fit">
                {actions}
              </div>
            </div>
          )}
        </div>

        {/* Mobile: stacked with inline action bar between panels */}
        <div className="flex flex-col gap-3 h-full md:hidden">
          <div className="min-w-0 min-h-0 flex-1 [&>*]:h-full">
            {input}
          </div>

          {!isPipelineMode && (
            <div className="flex justify-center">
              <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/60 shadow-lg shadow-black/20">
                {actions}
              </div>
            </div>
          )}

          <div className="min-w-0 min-h-0 flex-1 [&>*]:h-full">
            {output}
          </div>
        </div>
      </div>
    </div>
  )
}
