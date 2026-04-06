import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Type, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ")

export function LoremGeneratorTool({ tabId, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  
  const [output, setOutput] = useState(savedState?.output || "")
  const [count, setCount] = useState(savedState?.count || [3])
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">(savedState?.type || "paragraphs")
  const [startWithLorem, setStartWithLorem] = useState(savedState?.startWithLorem ?? true)
  const { toast } = useToast()

  useEffect(() => {
    setToolState(tabId, { output, count, type, startWithLorem })
  }, [output, count, type, startWithLorem, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange && output) {
      onOutputChange(output)
    }
  }, [output, onOutputChange])

  const generateWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]

  const generateSentence = (wordCount = 12) => {
    const words = Array.from({ length: wordCount }, generateWord)
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    return words.join(" ") + "."
  }

  const generateParagraph = (sentenceCount = 5) => {
    return Array.from({ length: sentenceCount }, () => generateSentence(8 + Math.floor(Math.random() * 8))).join(" ")
  }

  const generate = () => {
    let result = ""
    
    if (type === "words") {
      const words = Array.from({ length: count[0] }, generateWord)
      if (startWithLorem && words.length >= 2) {
        words[0] = "lorem"
        words[1] = "ipsum"
      }
      result = words.join(" ")
    } else if (type === "sentences") {
      result = Array.from({ length: count[0] }, () => generateSentence()).join(" ")
      if (startWithLorem) {
        result = "Lorem ipsum dolor sit amet." + result.slice(result.indexOf(".") + 1)
      }
    } else {
      result = Array.from({ length: count[0] }, generateParagraph).join("\n\n")
      if (startWithLorem) {
        result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." + result.slice(result.indexOf(".") + 1)
      }
    }
    
    setOutput(result)
    toast({ title: "Generated!" })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast({ title: "Copied!" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Lorem Ipsum Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(["paragraphs", "sentences", "words"] as const).map(t => (
                <Button 
                  key={t} 
                  size="sm" 
                  variant={type === t ? "default" : "outline"}
                  onClick={() => setType(t)}
                  className="text-xs capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Count: {count[0]}</Label>
              <Slider value={count} onValueChange={setCount} min={1} max={type === "words" ? 500 : 20} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="lorem" checked={startWithLorem} onCheckedChange={(c) => setStartWithLorem(c === true)} />
              <Label htmlFor="lorem" className="text-sm">Start with "Lorem ipsum"</Label>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={generate} className="bg-gradient-primary">
                <RefreshCw className="h-3 w-3 mr-1" />
                Generate
              </Button>
              <Button size="sm" onClick={copyToClipboard} variant="outline" disabled={!output}>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-3">
            <Textarea
              value={output}
              readOnly
              placeholder="Generated text will appear here..."
              className="min-h-[300px] font-serif"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
