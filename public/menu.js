const menu = document.querySelector('.nav__menu');
const mq = window.matchMedia('(min-width: 721px)');
const sync = () => { if (menu) menu.open = mq.matches; };
sync();
mq.addEventListener('change', sync);
