import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { audioManager } from "@/lib/audioManager";
import { BackButton } from "@/components/navigation/BackButton";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Profile settings
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  
  // Editor settings
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [preferredFont, setPreferredFont] = useState("system");
  
  // Accessibility settings
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [lineSpacing, setLineSpacing] = useState([1.5]);
  
  // Audio settings
  const [audioEngine, setAudioEngine] = useState<'web-speech' | 'server'>('web-speech');
  const [audioVoice, setAudioVoice] = useState('default');
  const [audioRate, setAudioRate] = useState(1.0);
  const [audioPitch, setAudioPitch] = useState(1.0);
  const [audioVolume, setAudioVolume] = useState(0.8);

  useEffect(() => {
    checkAuth();
    loadAudioSettings();
  }, []);

  const loadAudioSettings = () => {
    const settings = audioManager.getSettings();
    setAudioEngine(settings.engine);
    setAudioVoice(settings.voice);
    setAudioRate(settings.rate);
    setAudioPitch(settings.pitch);
    setAudioVolume(settings.volume);
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    setEmail(user.email || "");
    loadSettings(user.id);
  };

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || "");
        setTheme(data.theme || "dark");
        setFontSize(data.font_size || "medium");
        setPreferredFont(data.preferred_font || "system");
        setTtsEnabled(data.tts_enabled || false);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          theme,
          font_size: fontSize,
          preferred_font: preferredFont,
          tts_enabled: ttsEnabled,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Save audio settings
      audioManager.updateSettings({
        engine: audioEngine,
        voice: audioVoice,
        rate: audioRate,
        pitch: audioPitch,
        volume: audioVolume,
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDefaults = () => {
    setTheme("dark");
    setFontSize("medium");
    setPreferredFont("system");
    setTtsEnabled(false);
    setLineSpacing([1.5]);
    
    // Restore audio defaults
    setAudioEngine('web-speech');
    setAudioVoice('default');
    setAudioRate(1.0);
    setAudioPitch(1.0);
    setAudioVolume(0.8);
    
    toast.success("Restored default settings");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Profile</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Editor</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger id="fontSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font">Preferred Font</Label>
                <Select value={preferredFont} onValueChange={setPreferredFont}>
                  <SelectTrigger id="font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                    <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Accessibility</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="tts">Text-to-Speech</Label>
                <Switch
                  id="tts"
                  checked={ttsEnabled}
                  onCheckedChange={setTtsEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Line Spacing</Label>
                <Slider
                  value={lineSpacing}
                  onValueChange={setLineSpacing}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">{lineSpacing[0].toFixed(1)}x</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Audio Preferences</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Configure text-to-speech and audio playback settings
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audioEngine">Audio Engine</Label>
                <Select value={audioEngine} onValueChange={(val: any) => setAudioEngine(val)}>
                  <SelectTrigger id="audioEngine">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-speech">Web Speech (Browser)</SelectItem>
                    <SelectItem value="server">Server-side TTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioVoice">Voice</Label>
                <Input
                  id="audioVoice"
                  value={audioVoice}
                  onChange={(e) => setAudioVoice(e.target.value)}
                  placeholder="default"
                />
                <p className="text-xs text-muted-foreground">
                  Voice name (browser-dependent for Web Speech)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audioRate">Speech Rate</Label>
                  <span className="text-sm text-muted-foreground">{audioRate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="audioRate"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[audioRate]}
                  onValueChange={([val]) => setAudioRate(val)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audioPitch">Pitch</Label>
                  <span className="text-sm text-muted-foreground">{audioPitch.toFixed(1)}</span>
                </div>
                <Slider
                  id="audioPitch"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[audioPitch]}
                  onValueChange={([val]) => setAudioPitch(val)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audioVolume">Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(audioVolume * 100)}%</span>
                </div>
                <Slider
                  id="audioVolume"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[audioVolume]}
                  onValueChange={([val]) => setAudioVolume(val)}
                />
              </div>

              <Separator />

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Keyboard Shortcuts</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <kbd className="px-1 py-0.5 bg-background rounded text-foreground">Ctrl+Alt+R</kbd> Read selected code/output</li>
                  <li>• <kbd className="px-1 py-0.5 bg-background rounded text-foreground">Ctrl+Alt+C</kbd> Stop all audio</li>
                  <li>• <kbd className="px-1 py-0.5 bg-background rounded text-foreground">Ctrl+P</kbd> Toggle Projects Drawer</li>
                  <li>• <kbd className="px-1 py-0.5 bg-background rounded text-foreground">Space</kbd> Play/Pause (when audio controller focused)</li>
                </ul>
              </div>
            </div>
          </Card>

          <Separator />

          <div className="flex gap-4">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleRestoreDefaults}>
              Restore Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
