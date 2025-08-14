import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Hash, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TextCounter = () => {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim() !== '').length;
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);
    
    // Speaking time (average 150 words per minute)
    const speakingTime = Math.ceil(words / 150);

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      readingTime,
      speakingTime
    };
  }, [text]);

  const copyStats = () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Lines: ${stats.lines}
Paragraphs: ${stats.paragraphs}
Reading time: ${stats.readingTime} minute(s)
Speaking time: ${stats.speakingTime} minute(s)`;

    navigator.clipboard.writeText(statsText);
    toast({
      title: "Copied!",
      description: "Statistics copied to clipboard",
    });
  };

  const clearText = () => {
    setText("");
    toast({
      title: "Text cleared",
      description: "All text has been removed",
    });
  };

  const loadSampleText = () => {
    const sample = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;
    
    setText(sample);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Text Counter - Count Characters, Words & Lines Online Free"
        description="Free online text counter tool. Count characters, words, lines, paragraphs, and reading time. Real-time text analysis with detailed statistics."
        keywords="text counter, character counter, word counter, line counter, text statistics, reading time calculator"
        canonicalUrl="/tools/text-counter"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Hash className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Text Counter</h1>
            </div>
            <p className="text-muted-foreground">
              Count words, characters, lines, and analyze your text
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">Words</Badge>
              <Badge variant="secondary">Characters</Badge>
              <Badge variant="secondary">Reading Time</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Enter your text</Label>
                  <Textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    rows={12}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={loadSampleText} variant="outline" size="sm">
                    Load Sample
                  </Button>
                  <Button onClick={clearText} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.characters.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Characters</div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.charactersNoSpaces.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Without spaces</div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.words.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.lines.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Lines</div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.paragraphs.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Paragraphs</div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.readingTime}
                    </div>
                    <div className="text-sm text-muted-foreground">Min to read</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Speaking time:</span>
                      <span className="text-sm">{stats.speakingTime} minute(s)</span>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average word length:</span>
                      <span className="text-sm">
                        {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0} chars
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={copyStats} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Statistics
                </Button>
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
                  <div>• Real-time character and word counting</div>
                  <div>• Line and paragraph analysis</div>
                  <div>• Reading and speaking time estimates</div>
                  <div>• Average word length calculation</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Social media post optimization</div>
                  <div>• Academic writing requirements</div>
                  <div>• Content creation planning</div>
                  <div>• SEO meta description limits</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextCounter;