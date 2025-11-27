import { Button } from "@/components/ui/button";
import { Volume2, Copy } from "lucide-react";
import { audioManager } from "@/lib/audioManager";
import { toast } from "sonner";

interface OutputConsoleProps {
  output: string;
}

export const OutputConsole = ({ output }: OutputConsoleProps) => {
  const handleSpeak = () => {
    if (output.trim()) {
      audioManager.speak(output);
    } else {
      toast.error("No output to read");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Output copied to clipboard");
    } catch {
      toast.error("Failed to copy output");
    }
  };

  return (
    <div className="h-64 flex flex-col bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h2 className="text-sm font-semibold">Output Console</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeak}
            disabled={!output}
            aria-label="Read output aloud"
            title="Read output aloud"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Read Output
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!output}
            aria-label="Copy output"
            title="Copy output"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        className="flex-1 p-4 overflow-auto font-mono text-sm"
        role="log"
        aria-label="Code execution output"
        aria-live="polite"
      >
        <pre className="whitespace-pre-wrap">{output || "No output yet. Run your code to see results here."}</pre>
      </div>
    </div>
  );
};
