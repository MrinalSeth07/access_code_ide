import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, FolderOpen, MoreVertical, Play, Copy, Trash2, Download, FileEdit } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  language: string;
  code: string;
  created_at: string;
  updated_at: string;
}

interface ProjectsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onOpenProject: (project: Project) => void;
}

export const ProjectsDrawer = ({ open, onOpenChange, userId, onOpenProject }: ProjectsDrawerProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open && userId) {
      loadProjects();
    }
  }, [open, userId]);

  useEffect(() => {
    const filtered = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
    setSelectedIndex(0);
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("code_projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (project: Project) => {
    onOpenProject(project);
    onOpenChange(false);
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const { error } = await supabase.from("code_projects").insert({
        user_id: userId,
        title: `${project.title} (Copy)`,
        language: project.language,
        code: project.code,
      });

      if (error) throw error;
      toast.success("Project duplicated");
      loadProjects();
    } catch (error) {
      console.error("Error duplicating project:", error);
      toast.error("Failed to duplicate project");
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      const { error } = await supabase
        .from("code_projects")
        .delete()
        .eq("id", projectToDelete);

      if (error) throw error;
      toast.success("Project deleted");
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleExport = (project: Project) => {
    const extension = project.language === "python" ? ".py" : project.language === "javascript" ? ".js" : ".cpp";
    const blob = new Blob([project.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title}${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project exported");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredProjects.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredProjects.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredProjects[selectedIndex]) {
          handleOpen(filteredProjects[selectedIndex]);
        }
        break;
      case "Delete":
        e.preventDefault();
        if (filteredProjects[selectedIndex]) {
          setProjectToDelete(filteredProjects[selectedIndex].id);
          setDeleteDialogOpen(true);
        }
        break;
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[85vh] ml-auto w-[400px] fixed right-0 top-0">
          <DrawerHeader>
            <DrawerTitle>My Projects</DrawerTitle>
            <DrawerDescription>
              Manage your saved code projects
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 flex-1 flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
                autoFocus
                aria-label="Search projects"
              />
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No projects found</p>
                </div>
              ) : (
                <ul
                  role="listbox"
                  aria-label="Projects list"
                  className="space-y-2"
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                >
                  {filteredProjects.map((project, index) => (
                    <li
                      key={project.id}
                      role="option"
                      aria-selected={index === selectedIndex}
                      className={`p-3 rounded-lg border transition-colors ${
                        index === selectedIndex
                          ? "bg-accent border-primary"
                          : "bg-card border-border hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleOpen(project)}
                          className="flex-1 text-left"
                          aria-label={`Open ${project.title}`}
                        >
                          <h3 className="font-medium text-sm">{project.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {project.language} • {new Date(project.updated_at).toLocaleDateString()}
                          </p>
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label="Project actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpen(project)}>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(project)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(project)}>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setProjectToDelete(project.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
