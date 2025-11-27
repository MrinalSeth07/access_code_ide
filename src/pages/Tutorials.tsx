import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Volume2, Play } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { BackButton } from "@/components/navigation/BackButton";

interface Tutorial {
  id: string;
  title: string;
  difficulty: string;
  content: string;
  steps_json: any;
}

interface TutorialProgress {
  tutorial_id: string;
  percent_complete: number;
  last_step: number;
}

const Tutorials = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<Record<string, TutorialProgress>>({});
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkAuth();
    loadTutorials();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadProgress(user.id);
    }
  };

  const loadTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .select("*")
        .order("difficulty");

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error("Error loading tutorials:", error);
      toast.error("Failed to load tutorials");
    }
  };

  const loadProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("tutorial_progress")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      const progressMap: Record<string, TutorialProgress> = {};
      data?.forEach((p) => {
        progressMap[p.tutorial_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const handleStartTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(progress[tutorial.id]?.last_step || 0);
  };

  const handleMarkComplete = async () => {
    if (!user || !selectedTutorial) return;

    try {
      const { error } = await supabase
        .from("tutorial_progress")
        .upsert({
          user_id: user.id,
          tutorial_id: selectedTutorial.id,
          percent_complete: 100,
          last_step: currentStep,
        });

      if (error) throw error;
      toast.success("Tutorial marked as complete!");
      loadProgress(user.id);
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleReadAloud = () => {
    if (!selectedTutorial) return;
    const utterance = new SpeechSynthesisUtterance(selectedTutorial.content);
    speechSynthesis.speak(utterance);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Tutorials</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedTutorial ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-foreground">{tutorial.title}</h3>
                  <Badge className={getDifficultyColor(tutorial.difficulty)}>
                    {tutorial.difficulty}
                  </Badge>
                </div>
                {user && progress[tutorial.id] && (
                  <div className="mb-4">
                    <Progress value={progress[tutorial.id].percent_complete} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {progress[tutorial.id].percent_complete}% complete
                    </p>
                  </div>
                )}
                <Button onClick={() => handleStartTutorial(tutorial)} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  {progress[tutorial.id]?.percent_complete === 100 ? "Review" : "Start"}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{selectedTutorial.title}</h2>
                <Badge className={getDifficultyColor(selectedTutorial.difficulty)}>
                  {selectedTutorial.difficulty}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReadAloud} variant="outline" aria-label="Read tutorial aloud">
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button onClick={() => setSelectedTutorial(null)} variant="outline">
                  Back to List
                </Button>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <pre className="whitespace-pre-wrap text-foreground">{selectedTutorial.content}</pre>
            </div>

            {user && (
              <div className="flex gap-2">
                <Button onClick={handleMarkComplete}>Mark Complete</Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tutorials;
