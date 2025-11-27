import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Mic, Code, BookOpen, Map } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";

const AudioMode = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [currentCommand, setCurrentCommand] = useState("");

  const voiceCommands = [
    { command: "go to editor", action: () => navigate("/editor"), description: "Open the code editor" },
    { command: "go to tutorials", action: () => navigate("/tutorials"), description: "Open tutorials" },
    { command: "go to docs", action: () => navigate("/docs"), description: "Open documentation" },
    { command: "go to roadmap", action: () => navigate("/roadmap"), description: "Open roadmap" },
    { command: "go home", action: () => navigate("/"), description: "Go to home page" },
  ];

  useEffect(() => {
    // Announce the page on load
    const welcomeMessage = "Welcome to Audio Mode. This is a voice-controlled environment optimized for screen readers. Press the microphone button or say 'start listening' to begin.";
    speak(welcomeMessage);

    // Keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "m" && e.ctrlKey) {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser");
      speak("Speech recognition is not supported in this browser");
      return;
    }

    setIsListening(!isListening);
    
    if (!isListening) {
      speak("Listening for commands");
      startListening();
    } else {
      speak("Stopped listening");
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setCurrentCommand(command);
      speak(`You said: ${command}`);
      
      const matchedCommand = voiceCommands.find(vc => 
        command.includes(vc.command)
      );

      if (matchedCommand) {
        speak(`Executing: ${matchedCommand.description}`);
        setTimeout(() => matchedCommand.action(), 1000);
      } else {
        speak("Command not recognized. Please try again.");
      }
      
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      speak("Error recognizing speech. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCommandClick = (command: typeof voiceCommands[0]) => {
    speak(command.description);
    setTimeout(() => command.action(), 1000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <BackButton />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Audio Mode</h1>
            <p className="text-muted-foreground text-lg">
              Full voice-controlled environment for screen reader users
            </p>
          </div>
        </header>

        <div className="space-y-6">
          <Card className="p-8 text-center">
            <Button
              size="lg"
              onClick={toggleListening}
              className={`w-full h-24 text-xl ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <Mic className="w-8 h-8 mr-4" />
              {isListening ? "Listening..." : "Start Voice Command (Ctrl+M)"}
            </Button>
            {currentCommand && (
              <p className="mt-4 text-muted-foreground" aria-live="polite">
                Last command: {currentCommand}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Volume2 className="w-6 h-6" />
              Available Voice Commands
            </h2>
            <nav className="space-y-3" role="navigation" aria-label="Voice commands">
              {voiceCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => handleCommandClick(cmd)}
                  className="w-full p-4 rounded-lg hover:bg-accent transition-colors text-left flex items-center gap-3 border border-border"
                  aria-label={`${cmd.command} - ${cmd.description}`}
                >
                   {cmd.command.includes("editor") && <Code className="w-5 h-5" />}
                  {cmd.command.includes("tutorials") && <BookOpen className="w-5 h-5" />}
                  {cmd.command.includes("docs") && <BookOpen className="w-5 h-5" />}
                  {cmd.command.includes("roadmap") && <Map className="w-5 h-5" />}
                  <div>
                    <p className="font-semibold text-foreground">"{cmd.command}"</p>
                    <p className="text-sm text-muted-foreground">{cmd.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Keyboard Shortcuts</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><kbd className="px-2 py-1 bg-secondary rounded">Ctrl + M</kbd> - Toggle voice listening</li>
              <li><kbd className="px-2 py-1 bg-secondary rounded">Tab</kbd> - Navigate between elements</li>
              <li><kbd className="px-2 py-1 bg-secondary rounded">Enter</kbd> - Activate selected element</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AudioMode;
