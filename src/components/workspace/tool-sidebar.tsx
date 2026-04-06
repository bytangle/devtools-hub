import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, Search, Terminal, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWorkspace } from "@/context/workspace-context"
import { tools, categories } from "@/data/tools"
import { cn } from "@/lib/utils"

export function ToolSidebar() {
  const [search, setSearch] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.filter(c => c !== "All"))
  )
  const { openTool, tabs, activeTabId, layoutMode, createPipeline, activePipelineId, addToPipeline } = useWorkspace()

  const filteredTools = search
    ? tools.filter(tool => 
        tool.title.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase())
      )
    : tools

  const toolsByCategory = categories
    .filter(c => c !== "All")
    .map(category => ({
      category,
      tools: filteredTools.filter(t => t.category === category)
    }))
    .filter(g => g.tools.length > 0)

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleToolClick = (toolId: string) => {
    if (layoutMode === "pipeline" && activePipelineId) {
      addToPipeline(activePipelineId, toolId)
    } else {
      openTool(toolId)
    }
  }

  const isToolOpen = (toolId: string) => {
    return tabs.some(t => t.toolId === toolId)
  }

  const isToolActive = (toolId: string) => {
    const activeTab = tabs.find(t => t.id === activeTabId)
    return activeTab?.toolId === toolId
  }

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <Terminal className="h-3 w-3" />
          <span>Explorer</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-7 text-xs font-mono bg-sidebar-accent border-sidebar-border placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Pipeline Quick Actions */}
      {layoutMode === "pipeline" && (
        <div className="p-2 border-b border-sidebar-border">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full text-xs font-mono h-7 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => createPipeline(`Pipeline ${Date.now()}`)}
          >
            <Plus className="h-3 w-3 mr-1" />
            new_pipeline
          </Button>
        </div>
      )}

      {/* Tool Categories */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {toolsByCategory.map(({ category, tools: categoryTools }) => (
            <div key={category}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center w-full px-3 py-1.5 text-[11px] font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                {expandedCategories.has(category) ? (
                  <ChevronDown className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                )}
                <Folder className="h-3 w-3 mr-1.5 text-primary/70" />
                <span className="uppercase tracking-wide">{category}</span>
                <span className="ml-auto font-mono text-[9px] text-muted-foreground/70">
                  [{categoryTools.length}]
                </span>
              </button>

              {/* Category Tools */}
              {expandedCategories.has(category) && (
                <div className="space-y-px">
                  {categoryTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className={cn(
                        "flex items-center w-full px-3 pl-8 py-1.5 text-[11px] font-mono transition-all",
                        "hover:bg-sidebar-accent hover:text-foreground",
                        "border-l-2 border-transparent",
                        isToolActive(tool.id) && "bg-primary/10 text-primary border-l-primary",
                        isToolOpen(tool.id) && !isToolActive(tool.id) && "text-primary/80 border-l-primary/50"
                      )}
                    >
                      <tool.icon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                      <span className="truncate text-left lowercase">{tool.title.toLowerCase().replace(/\s+/g, '_')}</span>
                      {isToolOpen(tool.id) && (
                        <span className="ml-auto flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Status Bar Style */}
      <div className="px-3 py-2 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {tabs.length} active
          </span>
          <span>{tools.length} tools</span>
        </div>
      </div>
    </div>
  )
}
