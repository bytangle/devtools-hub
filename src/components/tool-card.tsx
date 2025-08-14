import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ToolCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  category: string
}

export function ToolCard({ title, description, icon: Icon, href, category }: ToolCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                {category}
              </span>
              <Button
                variant="ghost" 
                size="sm"
                className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
              >
                <Link to={href}>Open</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}