import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Code, Settings } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { BackButton } from "@/components/navigation/BackButton";

interface Profile {
  full_name: string;
  email: string;
  subscription_tier: string;
  daily_runs_used: number;
  daily_runs_limit: number;
}

interface Project {
  id: string;
  title: string;
  language: string;
  updated_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    loadProfile(user.id);
    loadProjects(user.id);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const loadProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("code_projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return profile?.email.substring(0, 2).toUpperCase() || "U";
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium": return "bg-yellow-500";
      case "pro": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/settings")} aria-label="Go to settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-muted-foreground mb-4">{profile?.email}</p>
                <Badge className={getTierColor(profile?.subscription_tier || "free")}>
                  {profile?.subscription_tier || "Free"} Plan
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Usage & Quota</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Daily Code Runs</span>
                  <span className="font-semibold text-foreground">
                    {profile?.daily_runs_used || 0} / {profile?.daily_runs_limit || 10}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{
                      width: `${((profile?.daily_runs_used || 0) / (profile?.daily_runs_limit || 10)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Recent Projects</h3>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-muted-foreground">No projects yet</p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => navigate("/editor")}
                  >
                    <div className="flex items-center gap-3">
                      <Code className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.language} • Updated {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Account Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
