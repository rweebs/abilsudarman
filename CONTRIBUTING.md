# Berkontribusi bukti

Kode dan konten situs ini terbuka. Siapa pun boleh mengirim bukti, baik yang memperkuat maupun yang membantah klaim tentang Abil Sudarman. Situs ini memuat catatan dan pendapat, bukan putusan; setiap bukti dimuat sebagai klaim yang dapat diperiksa.

## Aturan

1. **Sumber dapat diperiksa.** Cantumkan tautan atau asal dokumen dan tanggal pengambilan tangkapan layar.
2. **Tutup data pribadi.** NIK, NIM, nomor telepon, alamat rumah, dan data pribadi pihak yang tidak terkait harus ditutup sebelum dikirim.
3. **Dua keterangan wajib:** apa yang ditunjukkan gambar, dan apa yang **tidak** dibuktikan olehnya.
4. **Tanpa rumor, tanpa doxxing.** Hanya hal yang berkaitan dengan klaim publik. Tidak ada tuduhan tanpa dasar.
5. **Hak jawab.** Abil Sudarman berhak menanggapi; tanggapan dimuat apa adanya.

## Cara mengirim

**Lewat Issue** (paling mudah): buka https://github.com/rweebs/abilsudarman/issues/new, lampirkan gambar atau tautan, dan isi dua keterangan di atas.

**Lewat Pull Request:**
1. Fork repo, lalu simpan gambar yang sudah ditutup datanya di `public/img/`.
2. Tambahkan satu berkas JSON di `src/content/bukti/` (salin format entri yang ada; skema di `src/lib/schemas.ts`, kolom `title`, `group`, `images`, `shows`, `limits`, `source`, `order`).
3. Jalankan `npm test && npm run build`, lalu buka PR.

Permintaan koreksi atau penghapusan: lihat halaman Hak jawab di situs.
