import type { z } from 'astro/zod';
import type { buktiSchema } from './schemas';

export type BuktiData = z.infer<typeof buktiSchema>;
export interface BuktiEntry { id: string; data: BuktiData }

export const BUKTI_GROUPS = [
  { id: 'catatan-resmi', label: 'Catatan resmi' },
  { id: 'klaim-yang-dipublikasikan', label: 'Klaim yang dipublikasikan' },
  { id: 'liputan-pihak-ketiga', label: 'Liputan pihak ketiga' },
  { id: 'upaya-verifikasi', label: 'Upaya verifikasi' },
] as const;

export function groupBukti(entries: BuktiEntry[]) {
  return BUKTI_GROUPS
    .map((g) => ({
      id: g.id as string,
      label: g.label as string,
      items: entries
        .filter((e) => e.data.group === g.id)
        .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id)),
    }))
    .filter((g) => g.items.length > 0);
}

export const thumbFor = (src: string) => src.replace(/^\/img\/(.+)\.[a-z]+$/i, '/thumb/$1.webp');
export const thumbSrcset = (src: string) => `${thumbFor(src).replace(/\.webp$/, '-320.webp')} 320w, ${thumbFor(src)} 640w`;
export const CARD_THUMB_SIZES = '(min-width: 768px) 300px, 100vw';

const dateFmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' });

export function sourceLine(d: { source?: string; capturedAt?: Date }): string {
  const date = d.capturedAt ? dateFmt.format(d.capturedAt) : undefined;
  if (d.source && date) return `Sumber: ${d.source}. Tangkapan layar: ${date}.`;
  if (d.source) return `Sumber: ${d.source}. Tanggal tangkapan layar tidak terlihat.`;
  if (date) return `Tangkapan layar: ${date}. Sumber tidak terlihat.`;
  return 'Sumber dan tanggal tidak terlihat pada gambar.';
}
