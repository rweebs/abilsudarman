# Situs Abil Sudarman

Situs statis Astro (bahasa Indonesia) di Cloudflare Pages.

## Perintah
- `npm run dev` pratinjau dengan draf
- `npm run build` build produksi (hanya konten `final` / `draft: false`)
- `npm run build:preview` build dengan draf
- `npm run check` periksa `dist/` (banner disclaimer, tautan, gambar)
- `npm test`

## Menerbitkan
1. Tinjau terjemahan, isi `originalUrl`, ubah `translationStatus: final`.
2. Setujui butir kawal, isi `sentDate` dan `deliveryChannel`, ubah `draft: false` setelah dikirim ke abil@assai.id dan rahmat.wibowo21@gmail.com.
3. Jika ada jawaban: ubah `status: dijawab`, isi `reply` (apa adanya) dan `replyDate`.
4. `npm test && npm run build && npm run check`
5. Cloudflare Pages: build command `npm test && npm run build`, output `dist`, Node 22; atau `npx wrangler pages deploy dist`. Domain produksi: abilsudarman.my.id.

Sebelum rilis: minta penasihat hukum meninjau (UU ITE, KUHP baru, UU PDP).
