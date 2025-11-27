import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Activity,
  AlertTriangle,
  Search,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { BackButton } from "@/components/navigation/BackButton";

interface Metrics {
  totalUsers: number;
  activeToday: number;
  paidUsers: number;
  freeUsers: number;
  codeRunsToday: number;
  chatMessagesToday: number;
}

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
}

interface AdminAction {
  id: string;
  action: string;
  target_id: string | null;
  details: any;
  created_at: string;
  admin_id: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeToday: 0,
    paidUsers: 0,
    freeUsers: 0,
    codeRunsToday: 0,
    chatMessagesToday: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [auditLog, setAuditLog] = useState<AdminAction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!roles) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadMetrics();
      loadUsers();
      loadAuditLog();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Failed to verify admin access");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Load user metrics
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, subscription_tier, created_at");

      if (profilesError) throw profilesError;

      const totalUsers = profiles?.length || 0;
      const paidUsers =
        profiles?.filter((p) => p.subscription_tier !== "free").length || 0;
      const freeUsers = totalUsers - paidUsers;

      // Load usage metrics for today
      const today = new Date().toISOString().split("T")[0];
      const { data: usageData, error: usageError } = await supabase
        .from("usage")
        .select("code_runs, chat_count")
        .eq("date", today);

      if (usageError) throw usageError;

      const codeRunsToday = usageData?.reduce((sum, u) => sum + (u.code_runs || 0), 0) || 0;
      const chatMessagesToday = usageData?.reduce((sum, u) => sum + (u.chat_count || 0), 0) || 0;

      setMetrics({
        totalUsers,
        activeToday: usageData?.length || 0,
        paidUsers,
        freeUsers,
        codeRunsToday,
        chatMessagesToday,
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, subscription_tier, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadAuditLog = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLog(data || []);
    } catch (error) {
      console.error("Error loading audit log:", error);
    }
  };

  const handleUserSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, subscription_tier, created_at")
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    }
  };

  const logAdminAction = async (action: string, targetId?: string, details?: any) => {
    if (!user) return;

    try {
      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action,
        target_id: targetId,
        details,
      });
      loadAuditLog();
    } catch (error) {
      console.error("Error logging admin action:", error);
    }
  };

  const handleExportData = () => {
    const csv = users
      .map((u) => `${u.email},${u.full_name || ""},${u.subscription_tier || "free"}`)
      .join("\n");
    const blob = new Blob([`Email,Name,Tier\n${csv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    logAdminAction("export_users", undefined, { count: users.length });
    toast.success("Data exported successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Admin Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalUsers}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Active Today</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.activeToday}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Paid Users</p>
            <p className="text-2xl font-bold text-foreground">{metrics.paidUsers}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Free Users</p>
            <p className="text-2xl font-bold text-foreground">{metrics.freeUsers}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Runs Today</p>
            <p className="text-2xl font-bold text-foreground">{metrics.codeRunsToday}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Chats Today</p>
            <p className="text-2xl font-bold text-foreground">{metrics.chatMessagesToday}</p>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
                className="flex-1"
              />
              <Button onClick={handleUserSearch}>
                <Search className="w-4 h-4" />
              </Button>
              <Button onClick={handleExportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Tier
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Joined
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userData) => (
                      <tr key={userData.id} className="border-b border-border">
                        <td className="p-4 text-sm text-foreground">{userData.email}</td>
                        <td className="p-4 text-sm text-foreground">
                          {userData.full_name || "-"}
                        </td>
                        <td className="p-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              userData.subscription_tier === "premium"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            {userData.subscription_tier || "free"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(userData.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigate(`/profile?user=${userData.id}`);
                                logAdminAction("view_user", userData.id);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Action
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Target ID
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Details
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((log) => (
                      <tr key={log.id} className="border-b border-border">
                        <td className="p-4 text-sm text-foreground font-mono">{log.action}</td>
                        <td className="p-4 text-sm text-muted-foreground font-mono text-xs">
                          {log.target_id ? log.target_id.slice(0, 8) + "..." : "-"}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {log.details ? JSON.stringify(log.details).slice(0, 50) : "-"}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
