import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { OutputConsole } from "@/components/editor/OutputConsole";
import { Sidebar } from "@/components/editor/Sidebar";
import { SettingsDialog } from "@/components/editor/SettingsDialog";
import { SaveProjectDialog } from "@/components/editor/SaveProjectDialog";
import { ProjectsDrawer } from "@/components/editor/ProjectsDrawer";
import { AudioController } from "@/components/editor/AudioController";
import { audioManager } from "@/lib/audioManager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Editor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("# Write your code here\nprint('Hello, World!')");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<"python" | "javascript" | "cpp">("python");
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState("");
  const [zoomOnType, setZoomOnType] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.35);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const initialCodeRef = useRef(code);

  useEffect(() => {
    // Track unsaved changes
    setUnsavedChanges(code !== initialCodeRef.current);
  }, [code]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P: Toggle Projects Drawer
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setProjectsDrawerOpen(prev => !prev);
      }
      
      // Ctrl+Alt+C: Stop all audio
      if (e.ctrlKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        audioManager.stop();
        toast.info("Audio stopped");
      }
      
      // Ctrl+Alt+R: Read selected text (handled in CodeEditor)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    
    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language, stdin }
      });

      if (error) throw error;

      setOutput(data.output || "No output");
      
      if (data.success) {
        toast.success("Code executed successfully!");
      } else {
        toast.error("Code executed with errors");
      }
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`Error: ${error.message || "Failed to execute code"}`);
      toast.error("Failed to run code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleAskChatbot = (selectedText: string) => {
    // This will be handled by Sidebar component
  };

  const handleOpenProject = (project: any) => {
    if (unsavedChanges) {
      setPendingProject(project);
      setUnsavedDialogOpen(true);
    } else {
      loadProject(project);
    }
  };

  const loadProject = (project: any) => {
    setCode(project.code);
    setLanguage(project.language);
    initialCodeRef.current = project.code;
    setUnsavedChanges(false);
    toast.success(`Opened ${project.title}`);
  };

  const handleSaveAndOpen = async () => {
    setSaveDialogOpen(true);
    setUnsavedDialogOpen(false);
    // After save dialog closes successfully, load pending project
  };

  const handleDiscardAndOpen = () => {
    if (pendingProject) {
      loadProject(pendingProject);
      setPendingProject(null);
    }
    setUnsavedDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader 
        user={user} 
        onSettingsClick={() => setSettingsOpen(true)}
        onSaveClick={() => setSaveDialogOpen(true)}
        onProjectsClick={() => setProjectsDrawerOpen(true)}
        hasUnsavedChanges={unsavedChanges}
      />
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />
      
      <SaveProjectDialog
        open={saveDialogOpen}
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open && pendingProject) {
            // If save dialog closed and we have pending project, load it
            loadProject(pendingProject);
            setPendingProject(null);
          }
        }}
        code={code}
        language={language}
        userId={user?.id || ""}
      />

      <ProjectsDrawer
        open={projectsDrawerOpen}
        onOpenChange={setProjectsDrawerOpen}
        userId={user?.id || ""}
        onOpenProject={handleOpenProject}
      />

      <AudioController />

      <AlertDialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your current project. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingProject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardAndOpen} className="bg-destructive text-destructive-foreground">
              Discard
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndOpen}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          language={language}
          onLanguageChange={setLanguage}
          zoomOnType={zoomOnType}
          onZoomOnTypeChange={setZoomOnType}
          zoomLevel={zoomLevel}
          onZoomLevelChange={setZoomLevel}
          onAskChatbot={handleAskChatbot}
        />
        
        <main className="flex-1 flex flex-col" role="main">
          <CodeEditor
            code={code}
            language={language}
            onChange={setCode}
            onRun={handleRunCode}
            isRunning={isRunning}
            zoomOnType={zoomOnType}
            zoomLevel={zoomLevel}
            onAskChatbot={handleAskChatbot}
            stdin={stdin}
            onStdinChange={setStdin}
          />
          
          <OutputConsole output={output} />
        </main>
      </div>
    </div>
  );
};

export default Editor;
