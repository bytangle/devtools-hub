import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GitCompare, RotateCcw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DiffChecker = () => {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffResult, setDiffResult] = useState<Array<{
    type: 'equal' | 'delete' | 'insert';
    value: string;
  }>>([]);
  const { toast } = useToast();

  // Simple diff algorithm (Myers' algorithm simplified)
  const computeDiff = () => {
    if (!leftText && !rightText) {
      toast({
        title: "No text to compare",
        description: "Please enter text in both fields",
        variant: "destructive",
      });
      return;
    }

    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    
    const result: Array<{
      type: 'equal' | 'delete' | 'insert';
      value: string;
    }> = [];

    const maxLen = Math.max(leftLines.length, rightLines.length);
    
    for (let i = 0; i < maxLen; i++) {
      const leftLine = leftLines[i];
      const rightLine = rightLines[i];
      
      if (leftLine === undefined) {
        result.push({ type: 'insert', value: rightLine });
      } else if (rightLine === undefined) {
        result.push({ type: 'delete', value: leftLine });
      } else if (leftLine === rightLine) {
        result.push({ type: 'equal', value: leftLine });
      } else {
        result.push({ type: 'delete', value: leftLine });
        result.push({ type: 'insert', value: rightLine });
      }
    }

    setDiffResult(result);
    toast({
      title: "Diff computed!",
      description: "Text comparison complete",
    });
  };

  const clearAll = () => {
    setLeftText("");
    setRightText("");
    setDiffResult([]);
    toast({
      title: "Cleared",
      description: "All text has been cleared",
    });
  };

  const loadSample = () => {
    const sample1 = `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log("Result:", result);`;

    const sample2 = `function calculateSum(a, b, c = 0) {
  return a + b + c;
}

const result = calculateSum(5, 3, 2);
console.log("Final result:", result);
console.log("Operation completed");`;

    setLeftText(sample1);
    setRightText(sample2);
  };

  const exportDiff = () => {
    if (diffResult.length === 0) {
      toast({
        title: "No diff to export",
        description: "Please compute a diff first",
        variant: "destructive",
      });
      return;
    }

    let diffText = "=== TEXT COMPARISON RESULTS ===\n\n";
    diffResult.forEach((item, index) => {
      const prefix = item.type === 'delete' ? '- ' : item.type === 'insert' ? '+ ' : '  ';
      diffText += `${prefix}${item.value}\n`;
    });

    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-diff.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Diff results saved to file",
    });
  };

  const stats = {
    additions: diffResult.filter(item => item.type === 'insert').length,
    deletions: diffResult.filter(item => item.type === 'delete').length,
    unchanged: diffResult.filter(item => item.type === 'equal').length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GitCompare className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Diff Checker</h1>
            </div>
            <p className="text-muted-foreground">
              Compare two texts and highlight their differences
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">Line by Line</Badge>
              <Badge variant="secondary">Additions</Badge>
              <Badge variant="secondary">Deletions</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="left-text">Text A</Label>
                  <Textarea
                    id="left-text"
                    value={leftText}
                    onChange={(e) => setLeftText(e.target.value)}
                    placeholder="Enter the original text here..."
                    rows={12}
                    className="resize-none font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modified Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="right-text">Text B</Label>
                  <Textarea
                    id="right-text"
                    value={rightText}
                    onChange={(e) => setRightText(e.target.value)}
                    placeholder="Enter the modified text here..."
                    rows={12}
                    className="resize-none font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={computeDiff} className="bg-gradient-primary">
              <GitCompare className="h-4 w-4 mr-2" />
              Compare Texts
            </Button>
            <Button onClick={loadSample} variant="outline">
              Load Sample
            </Button>
            <Button onClick={clearAll} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            {diffResult.length > 0 && (
              <Button onClick={exportDiff} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Diff
              </Button>
            )}
          </div>

          {diffResult.length > 0 && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        +{stats.additions}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Additions</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        -{stats.deletions}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Deletions</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {stats.unchanged}
                      </div>
                      <div className="text-sm text-muted-foreground">Unchanged</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diff Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                    {diffResult.map((item, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${
                          item.type === 'insert'
                            ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : item.type === 'delete'
                            ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-muted/50'
                        }`}
                      >
                        <span className="inline-block w-4 text-xs">
                          {item.type === 'insert' ? '+' : item.type === 'delete' ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre-wrap">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Line-by-line comparison</div>
                  <div>• Visual highlighting of changes</div>
                  <div>• Addition and deletion statistics</div>
                  <div>• Export diff results</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Code review and version comparison</div>
                  <div>• Document revision tracking</div>
                  <div>• Content editing workflow</div>
                  <div>• Data migration validation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiffChecker;