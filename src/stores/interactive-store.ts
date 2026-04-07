import { create } from 'zustand';

interface InteractiveStore {
  cursorMinute: number | null;
  isPlaying: boolean;
  playbackSpeed: number;
  showConnectors: boolean;
  showSensoryMarkers: boolean;
  showFailureModes: boolean;
  servingsMultiplier: number;

  setCursorMinute: (m: number | null) => void;
  setIsPlaying: (p: boolean) => void;
  setPlaybackSpeed: (s: number) => void;
  toggleConnectors: () => void;
  toggleSensoryMarkers: () => void;
  toggleFailureModes: () => void;
  setServingsMultiplier: (m: number) => void;
}

export const useInteractiveStore = create<InteractiveStore>((set) => ({
  cursorMinute: null,
  isPlaying: false,
  playbackSpeed: 1,
  showConnectors: true,
  showSensoryMarkers: true,
  showFailureModes: true,
  servingsMultiplier: 1,

  setCursorMinute: (m) => set({ cursorMinute: m }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  setPlaybackSpeed: (s) => set({ playbackSpeed: s }),
  toggleConnectors: () => set((s) => ({ showConnectors: !s.showConnectors })),
  toggleSensoryMarkers: () => set((s) => ({ showSensoryMarkers: !s.showSensoryMarkers })),
  toggleFailureModes: () => set((s) => ({ showFailureModes: !s.showFailureModes })),
  setServingsMultiplier: (m) => set({ servingsMultiplier: m }),
}));
