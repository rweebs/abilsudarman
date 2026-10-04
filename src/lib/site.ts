export const SITE = {
  name: 'Kawal Abil Sudarman',
  description: 'Kawal terbuka atas klaim Abil Sudarman: terjemahan artikel Rahmat Wibowo beserta bukti dan hak jawab.',
  url: 'https://abilsudarman.my.id',
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

export const NAV = [
  { href: '/artikel', label: 'Artikel' },
  { href: '/hak-jawab', label: 'Hak jawab' },
  { href: '/disclaimer', label: 'Disclaimer' },
] as const;
