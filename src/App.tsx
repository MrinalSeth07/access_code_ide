import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Editor from "./pages/Editor";
import Docs from "./pages/Docs";
import Tutorials from "./pages/Tutorials";
import Roadmap from "./pages/Roadmap";
import Changelog from "./pages/Changelog";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AudioMode from "./pages/AudioMode";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/audio-mode" element={<AudioMode />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
