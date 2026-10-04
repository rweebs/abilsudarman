export const SITE = {
  name: 'Kawal Abil Sudarman',
  description: 'Kawal terbuka atas klaim Abil Sudarman: butir kawal, bukti, dan terjemahan artikel Rahmat Wibowo.',
  url: 'https://abilsudarman.my.id',
  author: 'Rahmat Wibowo',
  questionEmail: 'abil@assai.id',
  replyEmail: 'rahmat.wibowo21@gmail.com',
  correctionsEmail: 'rahmat.wibowo21@gmail.com',
  googleVerification: 'S6BE2bc5nmCLvf0eHX7XSPutmGFzsk7EzzdoGtweZyQ',
} as const;

export const PDKI = {
  url: 'https://pdki-indonesia.dgip.go.id/detail/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  filing: 'JID2026040529',
  address: 'Regensi Melati Mas Blok F-7/54 RT001/RW011, Jelupang, Serpong Utara, Kota Tangerang Selatan, Banten',
} as const;

export const DISCLAIMER =
  'Situs ini memuat pendapat dan catatan pribadi Rahmat Wibowo. Isinya bukan temuan kepolisian maupun putusan pengadilan, ' +
  'dan tidak menyatakan bahwa siapa pun yang disebut bersalah. Setiap orang berhak atas praduga tak bersalah dan hak jawab.';

export const CLASSIFICATION_LABEL = {
  'pendapat': 'Pendapat',
  'fakta-dengan-bukti': 'Fakta dengan bukti',
  'laporan-aduan': 'Laporan/aduan',
} as const;

export const STATUS_LABEL = { 'belum-dijawab': 'Belum dijawab', 'dijawab': 'Dijawab' } as const;

export const NAV = [
  { href: '/kawal', label: 'Kawal Abil Sudarman' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/hak-jawab', label: 'Hak jawab' },
  { href: '/disclaimer', label: 'Disclaimer' },
] as const;
