// The site's theme song, "Ababil" (Raihan, YouTube Music "Topic" release). Played from the YouTube embed so the full track
// works without a login; nothing is requested from YouTube until a visitor presses the player button.
export const THEME_SONG = {
  videoId: 'lmAzCin5__U',
  title: 'Ababil',
  artist: 'Raihan',
} as const;

/** Privacy-enhanced embed that autoplays (after a click) and loops the single video. */
export function embedUrl(id: string = THEME_SONG.videoId): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&rel=0&playsinline=1`;
}

export function musicUrl(id: string = THEME_SONG.videoId): string {
  return `https://music.youtube.com/watch?v=${id}`;
}
