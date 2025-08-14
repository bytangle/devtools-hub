import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Copy, ExternalLink, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortenedUrls, setShortenedUrls] = useState<Array<{
    original: string;
    short: string;
    clicks: number;
    created: Date;
  }>>([]);
  const { toast } = useToast();

  const generateShortUrl = () => {
    if (!originalUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(originalUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    // Generate short URL (demo implementation)
    const shortCode = customAlias || Math.random().toString(36).substring(2, 8);
    const newShortUrl = `https://short.ly/${shortCode}`;
    
    setShortUrl(newShortUrl);
    
    // Add to history
    const newEntry = {
      original: originalUrl,
      short: newShortUrl,
      clicks: 0,
      created: new Date()
    };
    
    setShortenedUrls(prev => [newEntry, ...prev]);
    
    toast({
      title: "URL Shortened!",
      description: "Your short URL has been generated",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const clearHistory = () => {
    setShortenedUrls([]);
    setShortUrl("");
    toast({
      title: "History cleared",
      description: "All shortened URLs have been removed",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Link className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">URL Shortener</h1>
            </div>
            <p className="text-muted-foreground">
              Create short, trackable links for easier sharing
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">Short Links</Badge>
              <Badge variant="secondary">Click Tracking</Badge>
              <Badge variant="secondary">Custom Aliases</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shorten URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original-url">Original URL</Label>
                  <Input
                    id="original-url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very/long/url/path"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-alias">Custom Alias (Optional)</Label>
                  <Input
                    id="custom-alias"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="my-custom-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for random alias
                  </p>
                </div>

                <Button onClick={generateShortUrl} className="w-full">
                  Shorten URL
                </Button>

                {shortUrl && (
                  <div className="space-y-2">
                    <Label>Shortened URL</Label>
                    <div className="flex gap-2">
                      <Input value={shortUrl} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(shortUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>URL History</CardTitle>
              </CardHeader>
              <CardContent>
                {shortenedUrls.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No URLs shortened yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {shortenedUrls.length} URLs shortened
                      </p>
                      <Button variant="outline" size="sm" onClick={clearHistory}>
                        Clear History
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {shortenedUrls.map((entry, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={entry.short}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              {entry.short}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(entry.short)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.original}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Created: {entry.created.toLocaleDateString()}</span>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              <span>{entry.clicks} clicks</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Generate short, memorable links</div>
                  <div>• Custom aliases for branded links</div>
                  <div>• Click tracking and analytics</div>
                  <div>• URL validation and error checking</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Social media sharing</div>
                  <div>• Email marketing campaigns</div>
                  <div>• QR code generation</div>
                  <div>• Analytics and tracking</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UrlShortener;