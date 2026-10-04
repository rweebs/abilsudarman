export interface PlaybackState {
  isPaused: boolean;
  isBuffering?: boolean;
  duration: number;
  position: number;
}

// True when the track has finished (paused at, or within `thresholdMs` of, the end).
export function shouldRestart(s: PlaybackState, thresholdMs = 1000): boolean {
  return s.isPaused && s.duration > 0 && s.duration - s.position <= thresholdMs;
}
