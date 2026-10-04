import { embedUrl } from '../lib/theme-song';

// The YouTube player is created only when the button is first pressed, so nothing is requested from YouTube before a click.
// Hiding the panel keeps the song playing; "Berhenti" removes the iframe, which stops playback.
const root = document.querySelector<HTMLElement>('[data-theme-song]');

if (root) {
  const toggle = root.querySelector<HTMLButtonElement>('.theme-song__toggle')!;
  const panel = root.querySelector<HTMLElement>('.theme-song__panel')!;
  const stage = root.querySelector<HTMLElement>('.theme-song__stage')!;
  const stop = root.querySelector<HTMLButtonElement>('.theme-song__stop')!;
  const label = root.querySelector<HTMLElement>('.theme-song__label')!;

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  const setPlaying = (playing: boolean) => {
    root.classList.toggle('is-playing', playing);
    label.textContent = playing ? 'Memutar' : 'Lagu tema';
  };

  const play = () => {
    if (stage.querySelector('iframe')) return;
    const frame = document.createElement('iframe');
    frame.src = embedUrl(root.dataset.videoId);
    frame.title = root.dataset.title ?? 'Lagu tema';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    stage.replaceChildren(frame);
    setPlaying(true);
  };

  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    setOpen(opening);
    if (opening) play();
  });

  stop.addEventListener('click', () => {
    stage.replaceChildren();
    setPlaying(false);
    setOpen(false);
    toggle.focus();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}
