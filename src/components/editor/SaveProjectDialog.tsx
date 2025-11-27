import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  language: string;
  userId: string;
}

export const SaveProjectDialog = ({
  open,
  onOpenChange,
  code,
  language,
  userId,
}: SaveProjectDialogProps) => {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      python: ".py",
      javascript: ".js",
      cpp: ".cpp",
    };
    return extensions[lang] || ".txt";
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setSaving(true);
    try {
      const projectTitle = title.endsWith(getFileExtension(language))
        ? title
        : title + getFileExtension(language);

      const { error } = await supabase.from("code_projects").insert({
        title: projectTitle,
        code,
        language,
        user_id: userId,
      });

      if (error) throw error;

      toast.success(`Project saved as ${projectTitle}`);
      setTitle("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Save your code project with a name. File extension will be added automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`my-project${getFileExtension(language)}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Extension: {getFileExtension(language)}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
