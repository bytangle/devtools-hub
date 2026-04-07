import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Terminal, Search, PanelLeftClose, PanelLeft, Columns, Rows, GitBranch, LayoutGrid, Zap, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useWorkspace, LayoutMode } from "@/context/workspace-context"
import { tools } from "@/data/tools"
import { cn } from "@/lib/utils"

export function WorkspaceHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { 
    sidebarOpen, 
    toggleSidebar, 
    layoutMode, 
    setLayoutMode,
    openTool,
    tabs
  } = useWorkspace()
  const navigate = useNavigate()

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const layoutOptions: { mode: LayoutMode; label: string; icon: typeof LayoutGrid }[] = [
    { mode: "single", label: "Single Panel", icon: LayoutGrid },
    { mode: "split-horizontal", label: "Split Horizontal", icon: Columns },
    { mode: "split-vertical", label: "Split Vertical", icon: Rows },
    { mode: "pipeline", label: "Pipeline Mode", icon: GitBranch },
  ]

  return (
    <header className="h-11 border-b bg-card/80 backdrop-blur-sm flex items-center px-2 sm:px-3 gap-1.5 sm:gap-2 flex-shrink-0">
      {/* Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Logo - Terminal/Engineering Style */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity group"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
          <Terminal className="h-4 w-4 text-primary" />
        </div>
        <div className="hidden sm:flex flex-col leading-none">
          <span className="text-sm font-mono font-bold text-foreground">
            devtools<span className="text-primary">_</span>hub
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            v2.0
          </span>
        </div>
      </button>

      {/* Status indicator */}
      <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded bg-muted/50 border border-border/50">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {tabs.length} active
        </span>
      </div>

      {/* Search - Command Palette Style */}
      <div className="flex-1 max-w-xs sm:max-w-sm mx-2 sm:mx-4">
        <Button
          variant="outline"
          className="w-full justify-start text-sm text-muted-foreground h-8 font-mono bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50"
          onClick={() => setSearchOpen(true)}
        >
          <Command className="mr-2 h-3 w-3" />
          <span className="hidden sm:inline text-xs">Run command...</span>
          <div className="ml-auto hidden sm:flex items-center gap-0.5">
            <kbd className="kbd">⌘</kbd>
            <kbd className="kbd">K</kbd>
          </div>
        </Button>
      </div>

      {/* Layout Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            {(() => {
              const currentOption = layoutOptions.find(o => o.mode === layoutMode)
              if (currentOption) {
                const Icon = currentOption.icon
                return <Icon className="h-4 w-4" />
              }
              return null
            })()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-mono">
          <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {layoutOptions.map((option) => (
            <DropdownMenuItem
              key={option.mode}
              onClick={() => setLayoutMode(option.mode)}
              className={cn("text-sm", layoutMode === option.mode && "bg-primary/10 text-primary")}
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Command Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search for tools..." />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.id}
                value={`${tool.title} ${tool.description}`}
                onSelect={() => {
                  openTool(tool.id)
                  setSearchOpen(false)
                }}
                className="flex items-center gap-2"
              >
                <tool.icon className="h-4 w-4" />
                <div>
                  <div className="text-sm">{tool.title}</div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  )
}
