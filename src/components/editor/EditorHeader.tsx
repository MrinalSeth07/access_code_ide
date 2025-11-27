import { Button } from "@/components/ui/button";
import { Code2, LogOut, Settings, Save, FolderOpen } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WorkspaceDropdown } from "@/components/navigation/WorkspaceDropdown";

interface EditorHeaderProps {
  user: User | null;
  onSettingsClick: () => void;
  onSaveClick: () => void;
  onProjectsClick?: () => void;
  hasUnsavedChanges?: boolean;
}

export const EditorHeader = ({ user, onSettingsClick, onSaveClick, onProjectsClick, hasUnsavedChanges }: EditorHeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3" role="banner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-xl font-bold">AccessCode IDE</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.email}
          </span>
          {onProjectsClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onProjectsClick}
              aria-label="My projects"
              title="My projects (Ctrl+P)"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Projects</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSaveClick}
            aria-label="Save project"
            title="Save project"
          >
            <Save className="h-5 w-5" />
          </Button>
          <WorkspaceDropdown hasUnsavedChanges={hasUnsavedChanges} />
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
