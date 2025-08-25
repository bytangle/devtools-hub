import { useState } from "react"
import { Header } from "@/components/layout/header"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SEO } from "@/components/SEO"
import { featuredTools, popularTools, categories } from "@/data/tools"
import { TrendingUp } from "lucide-react"

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredTools = selectedCategory === "All" 
    ? popularTools 
    : popularTools.filter(tool => tool.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="DevTools Hub - Code Formatter, JSON Beautifier & Developer Utilities"
        description="Professional developer tools including JSON formatter, code beautifier, XML viewer, base64 converter and more. Clean, fast, and free online utilities."
        keywords="json formatter, code beautifier, developer tools, base64 converter, html formatter, css minifier, password generator, regex tester"
        canonicalUrl="/"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-background/90 dark:bg-background/95" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <Badge variant="secondary" className="mb-4">
              Professional Developer Tools
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-primary bg-clip-text text-transparent">
              DevTools Hub
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Code Formatter, JSON Beautifier, Validators & More
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Professional online developer utilities for formatting, validating, converting, and generating code. 
              Clean, fast, and completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-md mx-auto sm:max-w-none">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 w-full sm:w-auto"
                onClick={() => document.getElementById('popular-tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Tools
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary/20 hover:bg-primary/5 w-full sm:w-auto"
                onClick={() => document.getElementById('featured-tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Popular
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Featured Tools */}
        <section id="featured-tools" className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-semibold">Featured Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <section id="popular-tools" className="space-y-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Popular Tools</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;

