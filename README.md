# Situs Abil Sudarman

Situs statis Astro (bahasa Indonesia) di Cloudflare Pages.

## Perintah
- `npm run dev` pratinjau dengan draf
- `npm run build` build produksi (hanya konten `final` / `draft: false`)
- `npm run build:preview` build dengan draf
- `npm run check` periksa `dist/` (banner disclaimer, tautan, gambar)
- `npm test`

## Menerbitkan
1. Tinjau terjemahan, lalu ubah `translationStatus: final` (isi `originalUrl` bila ada tautan teks asli).
2. Tanggapan dari Abil Sudarman (jika ada) ditambahkan apa adanya di akhir tulisan yang bersangkutan, di bawah judul `## Tanggapan Abil Sudarman`, lengkap dengan tanggal penerimaan.
3. `npm test && npm run build` (build menjalankan pemeriksa `dist/`).
4. Cloudflare: build command `npm test && npm run build`, deploy command `npx wrangler deploy` (konfigurasi di `wrangler.jsonc`, aset statis dari `dist/`). Domain produksi: abilsudarman.my.id.

Sebelum rilis: minta penasihat hukum meninjau (UU ITE, KUHP baru, UU PDP).
