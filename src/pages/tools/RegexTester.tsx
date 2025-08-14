import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Copy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [globalFlag, setGlobalFlag] = useState(true);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const { toast } = useToast();

  const regexResult = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [], isValid: true, error: null };
    }

    try {
      let flags = "";
      if (globalFlag) flags += "g";
      if (caseInsensitive) flags += "i";
      if (multiline) flags += "m";

      const regex = new RegExp(pattern, flags);
      const matches = [];
      
      if (globalFlag) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            fullMatch: match
          });
          
          // Prevent infinite loop
          if (!regex.global) break;
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            fullMatch: match
          });
        }
      }

      return { matches, isValid: true, error: null };
    } catch (error) {
      return { 
        matches: [], 
        isValid: false, 
        error: error instanceof Error ? error.message : "Invalid regex pattern"
      };
    }
  }, [pattern, testString, globalFlag, caseInsensitive, multiline]);

  const highlightMatches = () => {
    if (!regexResult.isValid || regexResult.matches.length === 0) {
      return testString;
    }

    let highlighted = testString;
    let offset = 0;

    regexResult.matches.forEach((match) => {
      const startTag = '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">';
      const endTag = '</mark>';
      const insertIndex = match.index + offset;
      
      highlighted = 
        highlighted.slice(0, insertIndex) + 
        startTag + 
        match.match + 
        endTag + 
        highlighted.slice(insertIndex + match.match.length);
      
      offset += startTag.length + endTag.length;
    });

    return highlighted;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const commonPatterns = [
    { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
    { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)" },
    { name: "Phone (US)", pattern: "\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})" },
    { name: "IP Address", pattern: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b" },
    { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
    { name: "Hex Color", pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})" },
    { name: "Word", pattern: "\\b\\w+\\b" },
    { name: "Digits", pattern: "\\d+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Regex Tester</h1>
            </div>
            <p className="text-muted-foreground">
              Test and debug regular expressions with live matching and explanations
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">JavaScript</Badge>
              <Badge variant="secondary">PCRE</Badge>
              <Badge variant="secondary">Live Testing</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regular Expression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pattern</Label>
                    <div className="flex gap-2">
                      <Input
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        placeholder="Enter regex pattern"
                        className={`flex-1 ${!regexResult.isValid ? 'border-destructive' : ''}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(pattern, "Pattern")}
                        disabled={!pattern}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {!regexResult.isValid && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {regexResult.error}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Flags</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="global" 
                          checked={globalFlag}
                          onCheckedChange={(checked) => setGlobalFlag(checked === true)}
                        />
                        <Label htmlFor="global" className="text-sm">Global (g)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="case-insensitive" 
                          checked={caseInsensitive}
                          onCheckedChange={(checked) => setCaseInsensitive(checked === true)}
                        />
                        <Label htmlFor="case-insensitive" className="text-sm">Case Insensitive (i)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="multiline" 
                          checked={multiline}
                          onCheckedChange={(checked) => setMultiline(checked === true)}
                        />
                        <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test String</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Input Text</Label>
                    <Textarea
                      value={testString}
                      onChange={(e) => setTestString(e.target.value)}
                      placeholder="Enter text to test against the regex pattern"
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Matches Found</Label>
                      <Badge variant={regexResult.matches.length > 0 ? "default" : "secondary"}>
                        {regexResult.matches.length}
                      </Badge>
                    </div>
                    
                    {regexResult.isValid && testString && (
                      <div 
                        className="p-3 bg-muted rounded-lg min-h-[100px] whitespace-pre-wrap font-mono text-sm"
                        dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                      />
                    )}
                  </div>

                  {regexResult.matches.length > 0 && (
                    <div className="space-y-2">
                      <Label>Match Details</Label>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {regexResult.matches.map((match, index) => (
                          <div key={index} className="p-2 bg-muted rounded text-sm">
                            <div><strong>Match {index + 1}:</strong> "{match.match}"</div>
                            <div><strong>Position:</strong> {match.index}-{match.index + match.match.length}</div>
                            {match.groups.length > 0 && (
                              <div><strong>Groups:</strong> [{match.groups.map(g => `"${g}"`).join(', ')}]</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {commonPatterns.map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="justify-start h-auto py-2 px-3"
                        onClick={() => setPattern(item.pattern)}
                      >
                        <div className="text-left">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.pattern}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Regex Basics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm font-mono">
                  <div><code>.</code> - Any character</div>
                  <div><code>*</code> - Zero or more</div>
                  <div><code>+</code> - One or more</div>
                  <div><code>?</code> - Zero or one</div>
                  <div><code>^</code> - Start of string</div>
                  <div><code>$</code> - End of string</div>
                  <div><code>[]</code> - Character class</div>
                  <div><code>()</code> - Capture group</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>g (global):</strong> Find all matches</div>
                  <div><strong>i (case insensitive):</strong> Ignore case</div>
                  <div><strong>m (multiline):</strong> ^ and $ match line breaks</div>
                  <div><strong>s (dotall):</strong> . matches newlines</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegexTester;