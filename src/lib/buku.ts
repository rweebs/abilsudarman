import type { z } from 'astro/zod';
import type { bukuSchema } from './schemas';

export type BukuData = z.infer<typeof bukuSchema>;
export interface BukuEntry { id: string; data: BukuData }

export const sortBuku = (entries: BukuEntry[]) =>
  [...entries].sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));

export function formatBytes(n: number): string {
  if (n < 1048576) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1048576).toFixed(1).replace('.', ',')} MB`;
}
