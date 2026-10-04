export const SITE = {
  name: 'Kawal Abil Sudarman',
  description: 'Kawal terbuka atas klaim Abil Sudarman: terjemahan artikel Rahmat Wibowo beserta bukti dan hak jawab.',
  url: 'https://abilsudarman.my.id',
  repo: 'https://github.com/rweebs/abilsudarman',
  author: 'Rahmat Wibowo',
  replyEmail: 'rahmat.wibowo21@gmail.com',
  correctionsEmail: 'rahmat.wibowo21@gmail.com',
  googleVerification: 'S6BE2bc5nmCLvf0eHX7XSPutmGFzsk7EzzdoGtweZyQ',
} as const;

export const DISCLAIMER =
  'Situs ini memuat pendapat dan catatan pribadi Rahmat Wibowo. Isinya bukan temuan kepolisian maupun putusan pengadilan, ' +
  'dan tidak menyatakan bahwa siapa pun yang disebut bersalah. Setiap orang berhak atas praduga tak bersalah dan hak jawab.';

export const CLASSIFICATION_LABEL = {
  'pendapat': 'Pendapat',
  'fakta-dengan-bukti': 'Fakta dengan bukti',
  'laporan-aduan': 'Laporan/aduan',
} as const;

// Date each static page's content last changed (used for sitemap lastmod; update when the text changes).
export const PAGE_LASTMOD = { '/hak-jawab': '2026-10-04', '/disclaimer': '2026-10-04', '/bukti': '2026-10-04', '/videos': '2026-10-04', '/buku': '2026-10-04', '/tiktok': '2026-10-05', '/pagespeed': '2026-10-05', '/tentang': '2026-10-05' } as const;

export const NAV = [
  { href: '/artikel', label: 'Artikel' },
  { href: '/bukti', label: 'Bukti' },
  { href: '/videos', label: 'Videos' },
  { href: '/tiktok', label: 'TikTok' },
  { href: '/buku', label: 'Buku' },
  { href: '/pagespeed', label: 'PageSpeed' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/#kontribusi', label: 'Kontribusi' },
  { href: '/hak-jawab', label: 'Hak jawab' },
  { href: '/disclaimer', label: 'Disclaimer' },
] as const;
