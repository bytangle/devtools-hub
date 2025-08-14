import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Code2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { tools } from "@/data/tools"

export function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
              DevTools Hub
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center max-w-lg mx-8">
          <Button
            variant="outline"
            className="relative w-full justify-start text-sm text-muted-foreground h-10"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search tools...
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/formatters">Formatters</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/validators">Validators</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/converters">Converters</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/generators">Generators</Link>
            </Button>
          </nav>
          <ThemeToggle />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for tools..." />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.id}
                value={`${tool.title} ${tool.description}`}
                onSelect={() => {
                  navigate(tool.href)
                  setOpen(false)
                }}
                className="flex items-center gap-2"
              >
                <tool.icon className="h-4 w-4" />
                <div>
                  <div>{tool.title}</div>
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