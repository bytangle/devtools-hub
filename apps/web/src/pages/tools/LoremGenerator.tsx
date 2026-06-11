import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Type, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
  "accusamus", "accusantium", "doloremque", "laudantium", "totam", "rem",
  "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
  "et", "quasi", "architecto", "beatae", "vitae", "dicta", "sunt", "explicabo"
];

const LoremGenerator = () => {
  const [type, setType] = useState<"paragraphs" | "words" | "sentences">("paragraphs");
  const [count, setCount] = useState("3");
  const [generatedText, setGeneratedText] = useState("");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const { toast } = useToast();

  const generateRandomWords = (numWords: number): string[] => {
    const words: string[] = [];
    for (let i = 0; i < numWords; i++) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    return words;
  };

  const generateSentence = (minWords: number = 4, maxWords: number = 15): string => {
    const numWords = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = generateRandomWords(numWords);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };

  const generateParagraph = (minSentences: number = 3, maxSentences: number = 7): string => {
    const numSentences = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    const sentences: string[] = [];
    for (let i = 0; i < numSentences; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(" ");
  };

  const generateLorem = () => {
    const numCount = parseInt(count) || 1;
    let result = "";

    if (type === "paragraphs") {
      const paragraphs: string[] = [];
      for (let i = 0; i < numCount; i++) {
        let paragraph = generateParagraph();
        if (i === 0 && startWithLorem) {
          paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + paragraph.substring(paragraph.indexOf(" ") + 1);
        }
        paragraphs.push(paragraph);
      }
      result = paragraphs.join("\n\n");
    } else if (type === "sentences") {
      const sentences: string[] = [];
      for (let i = 0; i < numCount; i++) {
        let sentence = generateSentence();
        if (i === 0 && startWithLorem) {
          sentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        }
        sentences.push(sentence);
      }
      result = sentences.join(" ");
    } else if (type === "words") {
      let words: string[] = [];
      if (startWithLorem && numCount >= 5) {
        words = ["Lorem", "ipsum", "dolor", "sit", "amet"];
        const remainingWords = generateRandomWords(numCount - 5);
        words = words.concat(remainingWords);
      } else {
        words = generateRandomWords(numCount);
        if (startWithLorem && numCount > 0) {
          words[0] = "Lorem";
        }
      }
      result = words.join(" ");
    }

    setGeneratedText(result);
  };

  const copyToClipboard = async () => {
    if (!generatedText) {
      toast({
        title: "Nothing to copy",
        description: "Generate some lorem ipsum text first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied!",
        description: "Lorem ipsum text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearText = () => {
    setGeneratedText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Type className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Lorem Ipsum Generator</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Generate placeholder text for your designs and layouts
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">Paragraphs</Badge>
              <Badge variant="secondary">Words</Badge>
              <Badge variant="secondary">Sentences</Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generator Settings</CardTitle>
                <CardDescription>
                  Configure your lorem ipsum text generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Text Type</Label>
                  <Select value={type} onValueChange={(value: "paragraphs" | "words" | "sentences") => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraphs</SelectItem>
                      <SelectItem value="sentences">Sentences</SelectItem>
                      <SelectItem value="words">Words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">
                    Number of {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="100"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    placeholder="Enter number"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="startWithLorem"
                    checked={startWithLorem}
                    onChange={(e) => setStartWithLorem(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="startWithLorem">Start with "Lorem ipsum"</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateLorem} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                  <Button variant="outline" onClick={clearText}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Text</CardTitle>
                <CardDescription>
                  Your lorem ipsum placeholder text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    placeholder="Generated lorem ipsum text will appear here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {generatedText && (
                        <>
                          Characters: {generatedText.length} | 
                          Words: {generatedText.split(/\s+/).filter(word => word.length > 0).length} |
                          Paragraphs: {generatedText.split('\n\n').filter(p => p.trim().length > 0).length}
                        </>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyToClipboard}
                      disabled={!generatedText}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>About Lorem Ipsum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries 
                for previewing layouts and visual mockups. It's derived from sections 1.10.32 and 1.10.33 of 
                "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LoremGenerator;