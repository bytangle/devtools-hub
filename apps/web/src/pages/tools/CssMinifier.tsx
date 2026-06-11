import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Minimize2, RefreshCw } from "lucide-react";

const CssMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const minifyCSS = (css: string): string => {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around specific characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons before closing braces
      .replace(/;}/g, '}')
      // Remove whitespace at start and end
      .trim();
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast({
        title: "No CSS to minify",
        description: "Please enter some CSS code first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const minified = minifyCSS(input);
      setOutput(minified);
      
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

      toast({
        title: "CSS minified successfully!",
        description: `Size reduced by ${savings}% (${originalSize} → ${minifiedSize} bytes)`,
      });
    } catch (error) {
      toast({
        title: "Error minifying CSS",
        description: "Please check your CSS syntax and try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard!",
      description: "The minified CSS has been copied to your clipboard.",
    });
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minified.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded!",
      description: "The minified CSS file has been downloaded.",
    });
  };

  const loadSample = () => {
    const sampleCSS = `/* Sample CSS for minification */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

.nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
}

.nav li {
  margin: 0 15px;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.nav a:hover {
  color: #007bff;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .nav ul {
    flex-direction: column;
  }
}`;

    setInput(sampleCSS);
    toast({
      title: "Sample CSS loaded!",
      description: "You can now minify the sample CSS.",
    });
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    toast({
      title: "Cleared!",
      description: "All content has been cleared.",
    });
  };

  const getStats = () => {
    if (!input || !output) return null;
    
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([output]).size;
    const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    
    return {
      originalSize,
      minifiedSize,
      savings
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="CSS Minifier - Compress & Optimize CSS Files Online Free"
        description="Free online CSS minifier tool. Compress and optimize CSS files by removing whitespace, comments, and unnecessary characters. Reduce file size for faster loading."
        keywords="css minifier, css compressor, css optimizer, minify css, compress css, css file size reducer"
        canonicalUrl="/tools/minify-css"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Minimize2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">CSS Minifier</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Compress your CSS files for faster loading times
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Input CSS</CardTitle>
              <CardDescription>Paste your CSS code here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="/* Enter your CSS here... */
.container {
  max-width: 1200px;
  margin: 0 auto;
}"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleMinify}>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Minify CSS
                </Button>
                <Button onClick={loadSample} variant="outline">
                  Load Sample
                </Button>
                <Button onClick={clearAll} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minified CSS</CardTitle>
              <CardDescription>Your compressed CSS output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Minified CSS will appear here..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} disabled={!output}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadFile} variant="outline" disabled={!output}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Compression Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{stats.originalSize}</div>
                  <div className="text-sm text-muted-foreground">Original Size (bytes)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.minifiedSize}</div>
                  <div className="text-sm text-muted-foreground">Minified Size (bytes)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.savings}%</div>
                  <div className="text-sm text-muted-foreground">Size Reduction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Remove Comments</Badge>
                <Badge variant="secondary">Strip Whitespace</Badge>
                <Badge variant="secondary">Optimize Selectors</Badge>
                <Badge variant="secondary">Size Statistics</Badge>
                <Badge variant="secondary">Download Results</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Faster page load times</li>
                <li>Reduced bandwidth usage</li>
                <li>Improved SEO performance</li>
                <li>Better user experience</li>
                <li>Lower hosting costs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CssMinifier;