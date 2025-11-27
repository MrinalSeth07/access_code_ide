import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { BackButton } from "@/components/navigation/BackButton";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: string;
  votes: number;
}

const Roadmap = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    checkAuth();
    loadRoadmapItems();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadUserVotes(user.id);
    }
  };

  const loadRoadmapItems = async () => {
    try {
      const { data, error } = await supabase
        .from("roadmap_items")
        .select("*")
        .order("votes", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading roadmap:", error);
      toast.error("Failed to load roadmap");
    }
  };

  const loadUserVotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("roadmap_votes")
        .select("item_id")
        .eq("user_id", userId);

      if (error) throw error;
      setUserVotes(new Set(data?.map((v) => v.item_id) || []));
    } catch (error) {
      console.error("Error loading votes:", error);
    }
  };

  const handleVote = async (itemId: string) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      if (userVotes.has(itemId)) {
        const { error } = await supabase
          .from("roadmap_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", itemId);

        if (error) throw error;
        
        await supabase.rpc("decrement_roadmap_votes" as any, { item_id: itemId });
        
        const newVotes = new Set(userVotes);
        newVotes.delete(itemId);
        setUserVotes(newVotes);
      } else {
        const { error } = await supabase
          .from("roadmap_votes")
          .insert({ user_id: user.id, item_id: itemId });

        if (error) throw error;
        
        await supabase.rpc("increment_roadmap_votes" as any, { item_id: itemId });
        
        setUserVotes(new Set([...userVotes, itemId]));
      }

      loadRoadmapItems();
      toast.success("Vote updated!");
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to update vote");
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!user) {
      toast.error("Please log in to submit suggestions");
      return;
    }

    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("roadmap_items")
        .insert({
          title: newTitle,
          description: newDescription,
          status: "planned",
          created_by: user.id,
        });

      if (error) throw error;

      toast.success("Suggestion submitted!");
      setNewTitle("");
      setNewDescription("");
      setShowSuggestionForm(false);
      loadRoadmapItems();
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast.error("Failed to submit suggestion");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "released": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress": return "In Progress";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const groupedItems = {
    planned: items.filter((i) => i.status === "planned"),
    in_progress: items.filter((i) => i.status === "in_progress"),
    released: items.filter((i) => i.status === "released"),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Roadmap & Changelog</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowSuggestionForm(!showSuggestionForm)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Suggest Feature
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showSuggestionForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Suggest a Feature</h2>
            <div className="space-y-4">
              <Input
                placeholder="Feature title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Feature description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitSuggestion}>Submit</Button>
                <Button variant="outline" onClick={() => setShowSuggestionForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(groupedItems).map(([status, statusItems]) => (
            <div key={status}>
              <h2 className="text-xl font-semibold mb-4 text-foreground capitalize">
                {getStatusLabel(status)}
              </h2>
              <div className="space-y-4">
                {statusItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote(item.id)}
                      className={userVotes.has(item.id) ? "bg-accent" : ""}
                      aria-label={`Vote for ${item.title}`}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {item.votes}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
