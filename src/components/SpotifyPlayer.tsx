import { useState } from 'react';

const TRACK = '6sbK7tNe3RsXPigs3T1PTO';

export default function SpotifyPlayer() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="card player">
      <p className="player__title">Lagu tema Operasi Ababil</p>
      {loaded ? (
        <iframe
          className="player__frame"
          title="Ababil di Spotify"
          src={`https://open.spotify.com/embed/track/${TRACK}`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <button type="button" className="btn" onClick={() => setLoaded(true)}>Putar “Ababil”</button>
      )}
      <p className="muted player__note">
        Pemutar Spotify (pihak ketiga) baru dimuat setelah Anda menekan tombol. Tanpa masuk ke Spotify, yang diputar bisa berupa cuplikan.{' '}
        <a href={`https://open.spotify.com/track/${TRACK}`} rel="noopener noreferrer" target="_blank">Buka di Spotify</a>
      </p>
    </div>
  );
}
