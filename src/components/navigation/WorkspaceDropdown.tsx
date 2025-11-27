import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Book, 
  GraduationCap, 
  Map, 
  List, 
  User, 
  Headphones, 
  Settings as SettingsIcon,
  Shield,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
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

interface WorkspaceItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const workspaceItems: WorkspaceItem[] = [
  { id: "docs", label: "Documentation", path: "/docs", icon: Book },
  { id: "tutorials", label: "Tutorials", path: "/tutorials", icon: GraduationCap },
  { id: "roadmap", label: "Roadmap", path: "/roadmap", icon: Map },
  { id: "changelog", label: "Changelog", path: "/changelog", icon: List },
  { id: "audio-mode", label: "Audio Mode", path: "/audio-mode", icon: Headphones },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
  { id: "settings", label: "Settings", path: "/settings", icon: SettingsIcon },
  { id: "admin", label: "Admin", path: "/admin", icon: Shield, adminOnly: true },
];

interface WorkspaceDropdownProps {
  hasUnsavedChanges?: boolean;
}

export const WorkspaceDropdown = ({ hasUnsavedChanges }: WorkspaceDropdownProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const visibleItems = workspaceItems.filter(item => !item.adminOnly || isAdmin);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    announce(open ? "Workspace menu opened" : "Workspace menu closed");
  };

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges && location.pathname === "/editor") {
      setPendingPath(path);
      setShowUnsavedDialog(true);
      setIsOpen(false);
    } else {
      performNavigation(path);
    }
  };

  const performNavigation = async (path: string) => {
    announce(`Navigating to ${path}`);
    navigate(path);
    setIsOpen(false);
    
    // Analytics event
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('usage').insert({
          user_id: user.id,
          chat_count: 0,
          code_runs: 0,
          wiki_lookups: 0,
        });
      }
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            aria-label="Open workspace menu"
          >
            Workspace
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-popover z-50"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        >
          {visibleItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isCurrentPath(item.path);
            const showSeparator = index === 4 || (item.adminOnly && index === visibleItems.length - 1);
            
            return (
              <div key={item.id}>
                {showSeparator && index !== 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => handleNavigation(item.path)}
                  className={`cursor-pointer ${isActive ? "bg-muted font-medium" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  <button
                    className="ml-2 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.path, '_blank');
                    }}
                    aria-label={`Open ${item.label} in new tab`}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ARIA live region for announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your current project. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPath(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingPath) {
                  performNavigation(pendingPath);
                  setPendingPath(null);
                }
                setShowUnsavedDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
