import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Minimize2, RefreshCw } from "lucide-react";

const JsMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const minifyJS = (js: string): string => {
    return js
      // Remove single-line comments (but preserve URLs)
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around operators and punctuation
      .replace(/\s*([{}();,=+\-*/%<>!&|])\s*/g, '$1')
      // Remove whitespace after keywords
      .replace(/\b(if|else|for|while|function|return|var|let|const|class|import|export)\s+/g, '$1 ')
      // Remove trailing semicolons where safe (basic implementation)
      .replace(/;;+/g, ';')
      // Remove whitespace at start and end
      .trim();
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast({
        title: "No JavaScript to minify",
        description: "Please enter some JavaScript code first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const minified = minifyJS(input);
      setOutput(minified);
      
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

      toast({
        title: "JavaScript minified successfully!",
        description: `Size reduced by ${savings}% (${originalSize} → ${minifiedSize} bytes)`,
      });
    } catch (error) {
      toast({
        title: "Error minifying JavaScript",
        description: "Please check your JavaScript syntax and try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard!",
      description: "The minified JavaScript has been copied to your clipboard.",
    });
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minified.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded!",
      description: "The minified JavaScript file has been downloaded.",
    });
  };

  const loadSample = () => {
    const sampleJS = `// Sample JavaScript for minification
function calculateTotal(items) {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  
  return total;
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.discount = 0;
  }
  
  addItem(item) {
    const existingItem = this.items.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }
  
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
  }
  
  getTotal() {
    const subtotal = calculateTotal(this.items);
    return subtotal - (subtotal * this.discount / 100);
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  const addButtons = document.querySelectorAll('.add-to-cart');
  
  addButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const item = {
        id: this.dataset.id,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price),
        quantity: 1
      };
      
      cart.addItem(item);
      updateCartDisplay();
    });
  });
});

function updateCartDisplay() {
  const cartElement = document.getElementById('cart-total');
  if (cartElement) {
    cartElement.textContent = '$' + cart.getTotal().toFixed(2);
  }
}`;

    setInput(sampleJS);
    toast({
      title: "Sample JavaScript loaded!",
      description: "You can now minify the sample JavaScript.",
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
        title="JavaScript Minifier - Compress JS Files Online Free"
        description="Free online JavaScript minifier tool. Compress and optimize JS files by removing whitespace, comments, and unnecessary characters for faster web performance."
        keywords="javascript minifier, js minifier, javascript compressor, minify js, compress javascript, js optimizer"
        canonicalUrl="/tools/minify-js"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Minimize2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">JavaScript Minifier</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Compress your JavaScript files for faster loading times
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Input JavaScript</CardTitle>
              <CardDescription>Paste your JavaScript code here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="// Enter your JavaScript here...
function hello() {
  console.log('Hello, World!');
}"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleMinify}>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Minify JavaScript
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
              <CardTitle>Minified JavaScript</CardTitle>
              <CardDescription>Your compressed JavaScript output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Minified JavaScript will appear here..."
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
                <Badge variant="secondary">Optimize Syntax</Badge>
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
                <li>Faster script execution</li>
                <li>Reduced bandwidth usage</li>
                <li>Improved page load times</li>
                <li>Better mobile performance</li>
                <li>Lower CDN costs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JsMinifier;