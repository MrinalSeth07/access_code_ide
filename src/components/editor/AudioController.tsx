import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { audioManager } from "@/lib/audioManager";

export const AudioController = () => {
  const [audioState, setAudioState] = useState(audioManager.getState());
  const [volume, setVolume] = useState(audioManager.getSettings().volume);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(setAudioState);
    return () => {
      unsubscribe();
    };
  }, []);

  if (!audioState.isPlaying && !audioState.isPaused) {
    return null;
  }

  const handlePlayPause = () => {
    if (audioState.isPaused) {
      audioManager.resume();
    } else {
      audioManager.pause();
    }
  };

  const handleStop = () => {
    audioManager.stop();
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  return (
    <Card
      className="fixed bottom-4 right-4 z-50 p-4 min-w-[300px] shadow-lg"
      role="region"
      aria-label="Audio playback controls"
      aria-live="polite"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Audio Playing</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayPause}
              aria-label={audioState.isPaused ? "Resume" : "Pause"}
              title={audioState.isPaused ? "Resume" : "Pause"}
            >
              {audioState.isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStop}
              aria-label="Stop"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${audioState.progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(audioState.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(audioState.progress)}%
          </p>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            className="flex-1"
            aria-label="Volume"
          />
          <span className="text-xs text-muted-foreground min-w-[3ch]">
            {Math.round(volume * 100)}%
          </span>
        </div>

        <p className="text-xs text-muted-foreground truncate" title={audioState.currentText}>
          {audioState.currentText.substring(0, 50)}
          {audioState.currentText.length > 50 ? '...' : ''}
        </p>
      </div>
    </Card>
  );
};
