import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
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
    <ToolShell
      icon={Type}
      title="Lorem Ipsum Generator"
      actions={<>
        <Button size="sm" onClick={generate} className="bg-primary hover:bg-primary/90">
          <RefreshCw className="h-3 w-3 mr-1" />
          Generate
        </Button>
        {output && (
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        )}
      </>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm mb-2 block">Type</Label>
            <div className="flex gap-2">
              {(['paragraphs', 'sentences', 'words'] as const).map(t => (
                <Button
                  key={t}
                  size="sm"
                  variant={type === t ? 'default' : 'outline'}
                  onClick={() => setType(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block">Count: {count[0]}</Label>
            <Slider value={count} onValueChange={setCount} max={type === 'words' ? 100 : 10} min={1} step={1} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="start-lorem" checked={startWithLorem} onCheckedChange={(c) => setStartWithLorem(c === true)} />
            <Label htmlFor="start-lorem" className="text-sm cursor-pointer">Start with "Lorem ipsum..."</Label>
          </div>
        </div>
        <Textarea
          value={output}
          readOnly
          placeholder="Generated text will appear here..."
          className="min-h-[300px] font-serif"
        />
      </div>
    </ToolShell>
  )
}
