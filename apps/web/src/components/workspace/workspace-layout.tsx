import { useWorkspace } from "@/context/workspace-context"
import { ToolSidebar } from "./tool-sidebar"
import { TabBar } from "./tab-bar"
import { ToolPanel } from "./tool-panel"
import { PipelineBuilder } from "./pipeline-builder"
import { WorkspaceHeader } from "./workspace-header"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { Terminal, Zap, Code2, GitBranch, Command } from "lucide-react"

export function WorkspaceLayout() {
  const { 
    layoutMode, 
    sidebarOpen, 
    toggleSidebar,
    sidebarWidth,
    tabs,
    activeTabId,
    panels
  } = useWorkspace()

  const renderMainContent = () => {
    if (layoutMode === "pipeline") {
      return <PipelineBuilder />
    }

    if (tabs.length === 0) {
      return <EmptyState />
    }

    if (layoutMode === "single") {
      return (
        <div className="flex flex-col h-full">
          <TabBar panelId="main" />
          <div className="flex-1 overflow-hidden">
            <ToolPanel tabId={activeTabId} />
          </div>
        </div>
      )
    }

    // Split view
    const direction = layoutMode === "split-horizontal" ? "horizontal" : "vertical"
    
    return (
      <ResizablePanelGroup direction={direction} className="h-full">
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex flex-col h-full">
            <TabBar panelId={panels[0]?.id || "left"} />
            <div className="flex-1 overflow-hidden">
              <ToolPanel tabId={panels[0]?.activeTabId} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border/50 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=horizontal]:w-1" />
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex flex-col h-full">
            <TabBar panelId={panels[1]?.id || "right"} />
            <div className="flex-1 overflow-hidden">
              <ToolPanel tabId={panels[1]?.activeTabId} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <WorkspaceHeader />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - overlay on mobile, side panel on desktop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        <div 
          className={cn(
            "border-r border-border/50 bg-sidebar flex-shrink-0 overflow-hidden z-40 transition-all duration-200",
            // Mobile: overlay drawer
            "fixed lg:relative inset-y-0 left-0 lg:inset-auto",
            sidebarOpen ? "w-60 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0"
          )}
          style={{ width: sidebarOpen ? (typeof sidebarWidth === 'number' ? sidebarWidth : 240) : 0 }}
        >
          {sidebarOpen && <ToolSidebar />}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  const { openTool, setLayoutMode } = useWorkspace()
  
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-background relative">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      <div className="relative max-w-lg space-y-8">
        {/* Terminal-style header */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-mono font-bold">
              <span className="text-primary">$</span> devv.tools <span className="animate-pulse">_</span>
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              // Developer utilities at your fingertips
            </p>
          </div>
        </div>
        
        {/* Quick commands */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            <Command className="h-3 w-3" />
            <span>Quick Start</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <QuickStartButton 
              icon={<Code2 className="h-4 w-4" />}
              label="json_formatter" 
              shortcut="⌘1"
              onClick={() => openTool("json-formatter")} 
            />
            <QuickStartButton 
              icon={<Zap className="h-4 w-4" />}
              label="base64_encode" 
              shortcut="⌘2"
              onClick={() => openTool("base64-encode")} 
            />
            <QuickStartButton 
              icon={<Terminal className="h-4 w-4" />}
              label="regex_tester" 
              shortcut="⌘3"
              onClick={() => openTool("regex-tester")} 
            />
            <QuickStartButton 
              icon={<GitBranch className="h-4 w-4" />}
              label="pipeline_mode" 
              shortcut="⌘4"
              onClick={() => setLayoutMode("pipeline")} 
            />
          </div>
        </div>
        
        {/* Keyboard hint */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-mono">
            Press <kbd className="kbd mx-1">⌘</kbd><kbd className="kbd">K</kbd> to open command palette
          </p>
        </div>
      </div>
    </div>
  )
}

interface QuickStartButtonProps {
  icon: React.ReactNode
  label: string
  shortcut: string
  onClick: () => void
}

function QuickStartButton({ icon, label, shortcut, onClick }: QuickStartButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 p-3 rounded border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-left"
    >
      <span className="text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </span>
      <span className="flex-1 text-xs font-mono text-foreground">{label}</span>
      <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        {shortcut}
      </span>
    </button>
  )
}
