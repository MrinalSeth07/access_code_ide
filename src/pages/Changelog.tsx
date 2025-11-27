import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Volume2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BackButton } from "@/components/navigation/BackButton";

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  notes: string;
  component: string | null;
  released_at: string;
}

const Changelog = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChangelogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangelog();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, selectedComponent, entries]);

  const loadChangelog = async () => {
    try {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("released_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading changelog:", error);
      toast.error("Failed to load changelog");
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.version.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedComponent !== "all") {
      filtered = filtered.filter((entry) => entry.component === selectedComponent);
    }

    setFilteredEntries(filtered);
  };

  const handleReadAloud = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
    toast.success("Reading changelog entry");
  };

  const components = Array.from(new Set(entries.map((e) => e.component).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Changelog</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/roadmap")}>
              View Roadmap
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="Search changelog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              aria-label="Search changelog"
            />
            <Button onClick={() => filterEntries()} aria-label="Search">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {components.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant={selectedComponent === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedComponent("all")}
              >
                All
              </Button>
              {components.map((component) => (
                <Button
                  key={component}
                  variant={selectedComponent === component ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedComponent(component!)}
                >
                  {component}
                </Button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading changelog...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No changelog entries found</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="font-mono">
                        v{entry.version}
                      </Badge>
                      {entry.component && (
                        <Badge variant="outline">{entry.component}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(entry.released_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {entry.title}
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReadAloud(`${entry.title}. ${entry.notes}`)}
                    aria-label="Read entry aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{entry.notes}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Changelog;
