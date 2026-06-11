import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Eye, FileText, RefreshCw } from "lucide-react";

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState("");
  const { toast } = useToast();

  const convertMarkdownToHtml = (md: string): string => {
    return md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img alt="$1" src="$2" />')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
      // Line breaks
      .replace(/\n/gim, '<br>')
      // Wrap lists
      .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
      .replace(/<\/ul><br><ul>/gim, '')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  };

  const copyHtml = () => {
    const html = convertMarkdownToHtml(markdown);
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML copied!",
      description: "The HTML has been copied to your clipboard.",
    });
  };

  const downloadHtml = () => {
    const html = convertMarkdownToHtml(markdown);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-output.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML downloaded!",
      description: "The HTML file has been downloaded.",
    });
  };

  const loadSample = () => {
    const sampleMarkdown = `# Welcome to Markdown Preview

## Features

This **Markdown Preview** tool supports:

- **Bold** and *italic* text
- [Links](https://example.com)
- \`inline code\`
- Lists and numbered lists

### Code Example

\`console.log('Hello, World!');\`

### Blockquote

> This is a blockquote example.

![Sample Image](https://via.placeholder.com/200x100)

1. First item
2. Second item
3. Third item`;

    setMarkdown(sampleMarkdown);
    toast({
      title: "Sample loaded!",
      description: "Sample markdown content has been loaded.",
    });
  };

  const clearAll = () => {
    setMarkdown("");
    toast({
      title: "Cleared!",
      description: "All content has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Markdown Preview - Live Markdown Editor & Renderer Online"
        description="Free online markdown preview tool. Write and preview markdown with live rendering, syntax highlighting, and export to HTML. Perfect for documentation."
        keywords="markdown preview, markdown editor, markdown renderer, markdown to html, live markdown"
        canonicalUrl="/tools/markdown-preview"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Markdown Preview</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Write markdown and see the live HTML preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Input
              </CardTitle>
              <CardDescription>Enter your markdown content here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="# Enter your markdown here..."
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[400px] font-mono"
              />
              <div className="flex gap-2">
                <Button onClick={loadSample} variant="outline" size="sm">
                  Load Sample
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                HTML Preview
              </CardTitle>
              <CardDescription>Live preview of your markdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="min-h-[400px] p-4 border rounded-md bg-card prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(markdown) }}
                style={{
                  color: 'hsl(var(--foreground))',
                }}
              />
              <div className="flex gap-2">
                <Button onClick={copyHtml} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
                <Button onClick={downloadHtml} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Syntax</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary"># Headers</Badge>
                <Badge variant="secondary">**Bold** and *Italic*</Badge>
                <Badge variant="secondary">`Code`</Badge>
                <Badge variant="secondary">[Links](url)</Badge>
                <Badge variant="secondary">- Lists</Badge>
                <Badge variant="secondary">![Images](url)</Badge>
                <Badge variant="secondary">&gt; Blockquotes</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Documentation preview</li>
                <li>README file testing</li>
                <li>Blog post drafting</li>
                <li>GitHub markdown validation</li>
                <li>Converting markdown to HTML</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MarkdownPreview;