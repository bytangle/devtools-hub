import { X, Plus, MoreHorizontal, SplitSquareVertical, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "@/context/workspace-context"
import { tools } from "@/data/tools"
import { cn } from "@/lib/utils"

interface TabBarProps {
  panelId: string
}

export function TabBar({ panelId }: TabBarProps) {
  const { 
    tabs, 
    panels, 
    activeTabId,
    setActiveTab, 
    closeTab,
    openTool,
    layoutMode,
    setLayoutMode,
    moveTabToPanel
  } = useWorkspace()

  const panel = panels.find(p => p.id === panelId)
  const panelTabs = panel?.tabIds
    .map(tabId => tabs.find(t => t.id === tabId))
    .filter(Boolean) ?? []

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    e.dataTransfer.setData("tabId", tabId)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const tabId = e.dataTransfer.getData("tabId")
    if (tabId && panelId) {
      moveTabToPanel(tabId, panelId)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSplitTab = (tabId: string) => {
    if (layoutMode === "single") {
      setLayoutMode("split-horizontal")
    }
    // Move tab to second panel
    const targetPanel = panels[1]
    if (targetPanel) {
      moveTabToPanel(tabId, targetPanel.id)
    }
  }

  return (
    <div 
      className="h-8 border-b border-border/50 bg-card/50 flex items-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ScrollArea className="flex-1">
        <div className="flex items-center h-8">
          {panelTabs.map(tab => {
            if (!tab) return null
            const tool = tools.find(t => t.id === tab.toolId)
            const isActive = tab.id === activeTabId || tab.id === panel?.activeTabId
            
            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tab.id)}
                className={cn(
                  "group relative flex items-center h-8 px-3 gap-2 text-xs font-mono cursor-pointer transition-all",
                  "border-r border-border/30",
                  isActive 
                    ? "bg-background text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
                )}
                
                {tool && <tool.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                <span className="truncate max-w-[100px]">
                  {tab.title.toLowerCase().replace(/\s+/g, '_')}
                </span>
                
                {/* Modified indicator */}
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 opacity-0" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className={cn(
                    "h-4 w-4 rounded flex items-center justify-center ml-1",
                    "opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                  )}
                >
                  <X className="h-2.5 w-2.5" />
                </button>

                {/* Tab Context Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "h-4 w-4 rounded flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                      )}
                    >
                      <MoreHorizontal className="h-2.5 w-2.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 font-mono text-xs">
                    <DropdownMenuItem onClick={() => handleSplitTab(tab.id)}>
                      <SplitSquareVertical className="h-3.5 w-3.5 mr-2" />
                      split_right
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => closeTab(tab.id)}>
                      <X className="h-3.5 w-3.5 mr-2" />
                      close
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      panelTabs.forEach(t => {
                        if (t && t.id !== tab.id) closeTab(t.id)
                      })
                    }}>
                      close_others
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      panelTabs.forEach(t => {
                        if (t) closeTab(t.id)
                      })
                    }}>
                      close_all
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>

      {/* Add Tab Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 mx-1 text-muted-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto font-mono text-xs">
          {tools.map(tool => (
            <DropdownMenuItem key={tool.id} onClick={() => openTool(tool.id)} className="gap-2">
              <tool.icon className="h-3.5 w-3.5" />
              {tool.title.toLowerCase().replace(/\s+/g, '_')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
