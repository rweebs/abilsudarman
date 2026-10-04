// The nav is a <details open> so it works without JavaScript. On narrow screens it becomes a hamburger menu that starts closed.
const menu = document.querySelector<HTMLDetailsElement>('details.nav__menu');
if (menu) {
  const narrow = window.matchMedia('(max-width: 720px)');
  const sync = () => { menu.open = !narrow.matches; };
  sync();
  narrow.addEventListener('change', sync);
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && narrow.matches && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (narrow.matches && menu.open && e.target instanceof Node && !menu.contains(e.target)) menu.open = false;
  });
}
