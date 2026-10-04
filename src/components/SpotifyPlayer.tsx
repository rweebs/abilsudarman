import { useEffect, useRef, useState } from 'react';
import { shouldRestart, type PlaybackState } from '../lib/spotify-loop';

const TRACK = '6sbK7tNe3RsXPigs3T1PTO';
const API = 'https://open.spotify.com/embed/iframe-api/v1';

interface SpotifyController {
  play(): void;
  seek(seconds: number): void;
  addListener(event: string, cb: (e: { data: PlaybackState }) => void): void;
  destroy(): void;
}
interface SpotifyApi {
  createController(el: HTMLElement, opts: Record<string, unknown>, cb: (c: SpotifyController) => void): void;
}
declare global {
  interface Window { onSpotifyIframeApiReady?: (api: SpotifyApi) => void }
}

export default function SpotifyPlayer() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded || !slot.current) return;
    let controller: SpotifyController | undefined;
    const host = document.createElement('div');
    slot.current.appendChild(host);

    window.onSpotifyIframeApiReady = (api) => {
      api.createController(host, { uri: `spotify:track:${TRACK}`, width: '100%', height: 152 }, (c) => {
        controller = c;
        c.addListener('playback_update', (e) => {
          if (shouldRestart(e.data)) { c.seek(0); c.play(); }
        });
        c.play();
      });
    };
    const script = document.createElement('script');
    script.src = API;
    script.async = true;
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);

    return () => {
      controller?.destroy();
      script.remove();
      host.remove();
      delete window.onSpotifyIframeApiReady;
    };
  }, [loaded]);

  return (
    <div className="card player">
      <p className="player__title">Lagu tema Operasi Ababil</p>
      {loaded
        ? (failed
            ? <iframe className="player__frame" title="Ababil di Spotify" src={`https://open.spotify.com/embed/track/${TRACK}`}
                width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
            : <div ref={slot} className="player__slot" />)
        : <button type="button" className="btn" onClick={() => setLoaded(true)}>Putar “Ababil”</button>}
      <p className="muted player__note">
        Pemutar Spotify (pihak ketiga) baru dimuat setelah Anda menekan tombol, lalu lagu diputar berulang terus. Tanpa masuk ke Spotify, yang diputar berupa cuplikan 30 detik.{' '}
        <a href={`https://open.spotify.com/track/${TRACK}`} rel="noopener noreferrer" target="_blank">Buka di Spotify</a>
      </p>
    </div>
  );
}
