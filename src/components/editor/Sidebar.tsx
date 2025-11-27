import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Eye, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AIChatbot, AIChatbotRef } from "./AIChatbot";

interface SidebarProps {
  language: "python" | "javascript" | "cpp";
  onLanguageChange: (lang: "python" | "javascript" | "cpp") => void;
  zoomOnType: boolean;
  onZoomOnTypeChange: (enabled: boolean) => void;
  zoomLevel: number;
  onZoomLevelChange: (level: number) => void;
  onAskChatbot?: (question: string) => void;
}

const languages = [
  { id: "python" as const, name: "Python", icon: "🐍" },
  { id: "javascript" as const, name: "JavaScript", icon: "📜" },
  { id: "cpp" as const, name: "C++", icon: "⚙️" },
];

export const Sidebar = ({ 
  language, 
  onLanguageChange,
  zoomOnType,
  onZoomOnTypeChange,
  zoomLevel,
  onZoomLevelChange,
  onAskChatbot
}: SidebarProps) => {
  const chatbotRef = useRef<AIChatbotRef>(null);

  const handleAskChatbot = (question: string) => {
    chatbotRef.current?.askQuestion(question);
    if (onAskChatbot) onAskChatbot(question);
  };
  return (
    <aside 
      className="w-80 border-r border-border bg-card p-4 overflow-auto flex flex-col gap-6"
      role="complementary"
      aria-label="Editor sidebar"
    >
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Code2 className="h-4 w-4" aria-hidden="true" />
          Language
        </h2>
        <div className="space-y-2" role="radiogroup" aria-label="Select programming language">
          {languages.map((lang) => (
            <Button
              key={lang.id}
              variant={language === lang.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => onLanguageChange(lang.id)}
              role="radio"
              aria-checked={language === lang.id}
            >
              <span className="mr-2" aria-hidden="true">{lang.icon}</span>
              {lang.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Accessibility
        </h2>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <Label 
                htmlFor="zoom-toggle" 
                className="text-sm font-medium cursor-pointer"
              >
                Zoom on Type
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Magnify code while typing
              </p>
            </div>
            <Switch
              id="zoom-toggle"
              checked={zoomOnType}
              onCheckedChange={onZoomOnTypeChange}
              aria-label="Toggle zoom on type"
            />
          </div>

          {zoomOnType && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="zoom-level" className="text-sm font-medium">
                  Zoom Level
                </Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {zoomLevel.toFixed(2)}x
                </span>
              </div>
              <Slider
                id="zoom-level"
                min={1.25}
                max={2.0}
                step={0.05}
                value={[zoomLevel]}
                onValueChange={(values) => onZoomLevelChange(values[0])}
                aria-label="Adjust zoom level"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                1.25x - 2.0x magnification
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="flex-1">
        <AIChatbot ref={chatbotRef} />
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Quick Tips
        </h2>
        <Card className="p-3 text-sm text-muted-foreground space-y-2">
          <p>• Press Ctrl+Enter to run code</p>
          <p>• Use Tab for indentation</p>
          <p>• Click "Read Code" to hear your code</p>
          <p>• Ask the AI assistant for help</p>
        </Card>
      </div>
    </aside>
  );
};
