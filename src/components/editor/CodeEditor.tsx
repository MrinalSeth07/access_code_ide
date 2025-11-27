import { Button } from "@/components/ui/button";
import { Play, Volume2, MessageSquare } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { audioManager } from "@/lib/audioManager";
import { toast } from "sonner";

interface CodeEditorProps {
  code: string;
  language: "python" | "javascript" | "cpp";
  onChange: (value: string) => void;
  onRun: () => void;
  isRunning: boolean;
  zoomOnType?: boolean;
  zoomLevel?: number;
  onAskChatbot?: (selectedText: string) => void;
  stdin?: string;
  onStdinChange?: (value: string) => void;
}

const languageMap = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
};

export const CodeEditor = ({ 
  code, 
  language, 
  onChange, 
  onRun, 
  isRunning,
  zoomOnType = true,
  zoomLevel = 1.35,
  onAskChatbot,
  stdin = "",
  onStdinChange
}: CodeEditorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [selectedText, setSelectedText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const baseFontSize = 16;

  useEffect(() => {
    if (zoomOnType && isTyping) {
      setCurrentFontSize(baseFontSize * zoomLevel);
    } else {
      setCurrentFontSize(baseFontSize);
    }
  }, [isTyping, zoomOnType, zoomLevel]);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
    
    if (zoomOnType) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSpeak = () => {
    const textToSpeak = selectedText || code;
    if (textToSpeak.trim()) {
      audioManager.speak(textToSpeak);
    } else {
      toast.error("No code to read");
    }
  };

  const handleAskChatbot = () => {
    if (selectedText && onAskChatbot) {
      onAskChatbot(selectedText);
      setSelectedText("");
      toast.success("Question sent to AI assistant");
    } else {
      toast.error("Please select some code first");
    }
  };

  // Keyboard shortcut for reading selected text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'r') {
        e.preventDefault();
        handleSpeak();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedText, code]);

  // Keyboard shortcut for Ctrl+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRun]);

  return (
    <div className="flex-1 flex flex-col border-b border-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <h2 className="text-sm font-semibold">Code Editor</h2>
        <div className="flex gap-2">
          {selectedText && onAskChatbot && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAskChatbot}
                    aria-label="Ask AI about selection"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ask AI about selected code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeak}
            aria-label="Read code aloud"
            title="Read code aloud"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Read Code
          </Button>
          <Button
            size="sm"
            onClick={onRun}
            disabled={isRunning}
            aria-label="Run code"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative" role="textbox" aria-label="Code editor">
        <Editor
          height="100%"
          language={languageMap[language]}
          value={code}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editor.onDidChangeCursorSelection((e) => {
              const selection = editor.getModel()?.getValueInRange(e.selection);
              setSelectedText(selection || "");
            });
          }}
          theme="vs-dark"
          options={{
            fontSize: currentFontSize,
            lineHeight: currentFontSize * 1.5,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            accessibilitySupport: "on",
            ariaLabel: "Code editor",
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
            transitionSupport: true,
          }}
        />
      </div>

      {onStdinChange && (
        <div className="border-t border-border bg-card p-4">
          <label htmlFor="stdin-input" className="text-sm font-semibold block mb-2">
            Program Input (stdin)
          </label>
          <textarea
            id="stdin-input"
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Enter program input here (for input() or scanf)"
            className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Program input for stdin"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tip: Press Ctrl+Enter to run code with this input
          </p>
        </div>
      )}
    </div>
  );
};
