// Global audio manager for TTS with interruption support
type AudioEngine = 'web-speech' | 'server';

interface AudioSettings {
  engine: AudioEngine;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number;
  duration: number;
}

type AudioListener = (state: AudioState) => void;

class AudioManager {
  private settings: AudioSettings = {
    engine: 'web-speech',
    voice: 'default',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  };

  private state: AudioState = {
    isPlaying: false,
    isPaused: false,
    currentText: '',
    progress: 0,
    duration: 0,
  };

  private listeners: Set<AudioListener> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private abortController: AbortController | null = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    // Load settings from localStorage
    const saved = localStorage.getItem('audioSettings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load audio settings:', e);
      }
    }
  }

  subscribe(listener: AudioListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    localStorage.setItem('audioSettings', JSON.stringify(this.settings));
  }

  async speak(text: string) {
    // Stop any current audio
    this.stop();

    if (!text.trim()) return;

    this.state.currentText = text;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.progress = 0;
    this.notifyListeners();

    if (this.settings.engine === 'web-speech') {
      await this.speakWebSpeech(text);
    } else {
      await this.speakServerSide(text);
    }
  }

  private async speakWebSpeech(text: string) {
    if (!('speechSynthesis' in window)) {
      console.error('Web Speech API not supported');
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = this.settings.rate;
    this.currentUtterance.pitch = this.settings.pitch;
    this.currentUtterance.volume = this.settings.volume;

    // Set voice if specified
    if (this.settings.voice !== 'default') {
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === this.settings.voice);
      if (voice) this.currentUtterance.voice = voice;
    }

    this.currentUtterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.progress = 100;
      this.notifyListeners();
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.notifyListeners();
    };

    this.currentUtterance.onboundary = (event) => {
      if (this.state.currentText.length > 0) {
        this.state.progress = (event.charIndex / this.state.currentText.length) * 100;
        this.notifyListeners();
      }
    };

    speechSynthesis.speak(this.currentUtterance);
  }

  private async speakServerSide(text: string) {
    try {
      this.abortController = new AbortController();

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: this.settings.voice,
          rate: this.settings.rate,
          pitch: this.settings.pitch,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const { audioContent } = await response.json();
      const audioBlob = this.base64ToBlob(audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      this.audioElement = new Audio(audioUrl);
      this.audioElement.volume = this.settings.volume;

      this.audioElement.onended = () => {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.progress = 100;
        this.notifyListeners();
        URL.revokeObjectURL(audioUrl);
      };

      this.audioElement.onerror = () => {
        console.error('Audio playback error');
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.notifyListeners();
        URL.revokeObjectURL(audioUrl);
      };

      this.audioElement.ontimeupdate = () => {
        if (this.audioElement && this.audioElement.duration > 0) {
          this.state.progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
          this.notifyListeners();
        }
      };

      await this.audioElement.play();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Server-side TTS error:', error);
      }
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.notifyListeners();
    }
  }

  pause() {
    if (!this.state.isPlaying || this.state.isPaused) return;

    if (this.settings.engine === 'web-speech') {
      speechSynthesis.pause();
    } else if (this.audioElement) {
      this.audioElement.pause();
    }

    this.state.isPaused = true;
    this.notifyListeners();
  }

  resume() {
    if (!this.state.isPlaying || !this.state.isPaused) return;

    if (this.settings.engine === 'web-speech') {
      speechSynthesis.resume();
    } else if (this.audioElement) {
      this.audioElement.play();
    }

    this.state.isPaused = false;
    this.notifyListeners();
  }

  stop() {
    if (this.settings.engine === 'web-speech') {
      speechSynthesis.cancel();
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }

    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.progress = 0;
    this.state.currentText = '';
    this.notifyListeners();
  }

  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    
    if (this.audioElement) {
      this.audioElement.volume = this.settings.volume;
    }
    
    this.notifyListeners();
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  getState(): AudioState {
    return { ...this.state };
  }
}

export const audioManager = new AudioManager();
