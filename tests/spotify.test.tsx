import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import SpotifyPlayer from '../src/components/SpotifyPlayer';

describe('SpotifyPlayer (click-to-load)', () => {
  const html = renderToString(<SpotifyPlayer />);
  it('renders a play button and no iframe before any click', () => {
    expect(html).toContain('<button');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('open.spotify.com/embed');
  });
  it('links to the track and discloses the third-party player', () => {
    expect(html).toContain('https://open.spotify.com/track/6sbK7tNe3RsXPigs3T1PTO');
    expect(html).toContain('pihak ketiga');
  });
});
