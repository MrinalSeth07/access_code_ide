import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Volume2, Search } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";

interface DocItem {
  id: string;
  slug: string;
  title: string;
  content_markdown: string;
}

const Docs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
    const slug = searchParams.get("page");
    if (slug) {
      loadDocBySlug(slug);
    }
  }, [searchParams]);

  const loadDocs = async () => {
    try {
      const { data, error } = await supabase
        .from("docs")
        .select("*")
        .order("title");

      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error("Error loading docs:", error);
      toast.error("Failed to load documentation");
    } finally {
      setLoading(false);
    }
  };

  const loadDocBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from("docs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      setSelectedDoc(data);
    } catch (error) {
      console.error("Error loading doc:", error);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const filtered = docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content_markdown.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      setSelectedDoc(filtered[0]);
    }
  };

  const handleReadAloud = () => {
    if (!selectedDoc) return;
    const utterance = new SpeechSynthesisUtterance(selectedDoc.content_markdown);
    speechSynthesis.speak(utterance);
    toast.success("Reading content aloud");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
              aria-label="Search documentation"
            />
            <Button onClick={handleSearch} aria-label="Search">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold mb-4 text-foreground">Table of Contents</h2>
              <nav className="space-y-2" role="navigation" aria-label="Documentation navigation">
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : docs.length === 0 ? (
                  <p className="text-muted-foreground">No documentation available</p>
                ) : (
                  docs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`block w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors ${
                        selectedDoc?.id === doc.id ? "bg-accent" : ""
                      }`}
                    >
                      {doc.title}
                    </button>
                  ))
                )}
              </nav>
            </Card>
          </aside>

          <main className="md:col-span-3" role="main">
            <Card className="p-6">
              {selectedDoc ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-foreground">{selectedDoc.title}</h2>
                    <Button onClick={handleReadAloud} variant="outline" aria-label="Read content aloud">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Read Aloud
                    </Button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-foreground">{selectedDoc.content_markdown}</pre>
                  </div>
                  <div className="mt-8 pt-4 border-t border-border">
                    <p className="text-muted-foreground">Was this helpful?</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Yes</Button>
                      <Button variant="outline" size="sm">No</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a topic from the sidebar or search for documentation</p>
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Docs;
