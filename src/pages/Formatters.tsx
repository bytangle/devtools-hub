import { tools } from "@/data/tools";
import { Header } from "@/components/layout/header";
import { ToolCard } from "@/components/tool-card";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, Palette, Database } from "lucide-react";

const Formatters = () => {
  const formatterTools = tools.filter(tool => tool.category === "Formatter");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Code Formatters</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beautify and format your code with proper indentation and syntax highlighting
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">JSON</Badge>
            <Badge variant="secondary">HTML</Badge>
            <Badge variant="secondary">CSS</Badge>
            <Badge variant="secondary">SQL</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {formatterTools.map((tool) => (
            <ToolCard 
              key={tool.id} 
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
              category={tool.category}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Formatters;