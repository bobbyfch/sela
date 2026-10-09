<p align="center"><img src="logo.svg" width="88" alt="Lambang buku terbuka Sela"></p>

# Sela 📖

**Di antara waktu. Di dalam cerita.**

Sela adalah jeda yang tak kosong: tempat seseorang menaruh kesibukan sebentar, membuka halaman, dan menemukan jalan pulang. Reader JavaScript ringan untuk aplikasi apa pun, dengan perpustakaan pribadi terpisah sebagai browser extension.

[English](README.md) · [Demo](https://bobbyfch.github.io/sela/) · [Rilis 1.0](https://github.com/bobbyfch/sela/releases) · [Integrasi](docs/integrations.md) · [Format](docs/formats.md)

## ✨ Yang sudah tersedia

| Untuk membaca | Untuk pengembang |
| --- | --- |
| 📖 Book flip, satu halaman, manga RTL, webtoon tanpa jarak | Vanilla JS, ESM, deklarasi TypeScript |
| 🌗 Light/dark/system, filter dan tekstur kertas | Tanpa Bootstrap, jQuery, atau icon font wajib |
| 🔖 Bookmark/progres, daftar isi bawaan PDF dan EPUB | Overlay atau embed inline dengan kemampuan sama |
| 🔎 Cari teks, transkrip yang bisa diseleksi | Adapter format dimuat saat diperlukan |
| 🎧 Narasi suara browser/OS | CI3, Laravel, Vue, React, Svelte, Angular, Astro, HTML |
| 📝 Catatan per halaman/bab, ekspor/impor JSON | Byte data, header autentikasi, kredensial, password PDF |
| 🤏 Zoom tombol, Ctrl-wheel, pinch trackpad/touch | Batas canvas, reduced motion, fallback PDF browser lama |

Core sekitar **23,4 KiB gzip**; CSS sekitar **3 KiB**. Adapter EPUB/CBZ sekitar **6,7 KiB**, alat baca **4,5 KiB**, adapter teks **2,5 KiB**, semuanya terpisah. PDF.js + worker modern sekitar **491 KiB gzip**, belum termasuk font/CMap dan dokumen. Ukuran core bukan ukuran keseluruhan aplikasi atau buku.

PDF, EPUB, CBZ, TXT, Markdown dasar, HTML aman, FB2 berbasis teks, serta DjVu dengan decoder eksternal. PDF pindai dan komik tidak punya teks untuk pencarian/TTS tanpa OCR. PDF punya transkrip teks, tetapi belum ada text layer yang sejajar atau highlight geometris. EPUB memakai navigasi bab, bukan pagination CFI/fidelitas layout penerbit. CBR/RAR, MOBI/AZW, DOCX dan DRM belum didukung. [Batas format](docs/formats.md).

## 🚀 Pasang Sela 1.0

```html
<script src="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.0.0/dist/js/sela.min.js"></script>
<button id="baca">Baca cerita</button>
<script>
const reader = new Sela({
  url: '/buku/cerita.pdf', mode: 'book',
  theme: 'auto', language: 'id', paperTexture: true
});
document.querySelector('#baca').onclick = () => reader.open().catch(console.error);
</script>
```

CSS otomatis dimuat. Untuk embed dalam halaman:

```html
<div id="ruang-baca" style="height:640px"></div>
<script>
new Sela({url:'/buku/cerita.pdf', presentation:'inline', container:'#ruang-baca',
  language:'id', theme:'auto'}).open().catch(console.error);
</script>
```

Host inline harus terhubung ke DOM dan mempunyai tinggi. Beberapa embed bisa berjalan bersama; shortcut hanya aktif ketika fokus di dalamnya. Embed tidak mengunci scroll halaman atau menjebak Tab. Default tetap overlay. `destroy()` saat komponen dilepas.

ESM/TypeScript: `npm install github:bobbyfch/sela#v1.0.0`, lalu `import Sela from '@bobbyfch/sela'`. Belum diterbitkan ke npm registry. Vue: `adapters/vue/SelaViewer.vue`. Self-host seluruh `dist/` lalu set `assetBase`; modul dan worker harus satu versi. Browser lama memakai `sela.compat.js` dan tautan PDF asli sebagai fallback.

Repo, Pages dan CDN baru memakai **Sela 1.0.0**. Tag/CDN FlippyPDF historis tetap tersedia di repo lama; tidak ditimpa. Alias `Flippy` dan berkas dist lama hanya untuk migrasi. [Panduan migrasi](docs/migration.md).

## 📚 Extension: ruang kecil milikmu

Rak buku adalah halaman khusus extension, **bukan halaman GitHub Pages yang dibungkus**. Impor banyak berkas lokal, sampul PDF/EPUB/komik bila bisa diambil, sampul tipografi untuk format lainnya, pencarian judul, urut terbaru/terakhir dibaca, ganti judul, ekspor berkas asli, hapus dan undo. Ada jam, tanggal, dan jeda secangkir kopi. Tata letak menyesuaikan layar kecil.

Pilih edisi **Standard** (rak lewat toolbar) atau **New Tab** (rak pada tab baru), untuk Chromium atau Firefox. Menu klik kanan **Open with Sela** tersedia pada tautan dokumen yang didukung. Unduhan meminta izin opsional hanya ke asal situs yang dipilih; tidak ada intersepsi otomatis atau akses wajib ke semua situs.

Buku tersimpan dalam IndexedDB pada browser/profil tersebut; engine dibundel sehingga membaca buku lokal bisa offline. Maksimal 64 MiB per buku, deduplikasi SHA-256. Hapus data/uninstall/ganti identitas extension dapat menghapus rak: simpan berkas asli dan ekspor catatan. DjVu tidak dibundel di extension karena membutuhkan kode decoder eksternal. Paket development belum ditandatangani/dipublikasikan di store. Quetta mendukung extension Android menurut dokumentasi resminya, tetapi pemasangan dan API pada perangkat fisik belum diuji. [Pemasangan, izin dan batasan](docs/offline-extension.md).

## 🎧 Dengarkan, cari, simpan

Tombol **Alat baca** membuka daftar isi/outline, pencarian, transkrip, TTS dan catatan. Narasi menggunakan Web Speech API dan suara browser/OS: tanpa API key atau langganan Sela. Suara lokal diprioritaskan. Suara daring dapat mengirim teks ke penyedia dan harus diaktifkan secara sadar. Suara Indonesia, pause/resume dan bacaan latar bergantung pada perangkat; tidak dijanjikan suara tertentu.

Bookmark PDF mengarah ke halaman; EPUB memakai nav/NCX dan jangkar. Search berjalan bertahap, bisa dibatalkan, maksimal 100 halaman/bab yang cocok. Catatan lokal bisa diekspor/impor JSON; gunakan edisi dokumen yang sama. Catatan belum berupa highlight posisi teks. Progress EPUB menyimpan bab dan posisi scroll relatif.

## ⌨️ Kontrol baca

| Tombol | Fungsi |
| --- | --- |
| Panah / PgUp / PgDn | Navigasi; panah mengikuti RTL pada manga |
| Home / End | Awal / akhir |
| + / − / 0 | Zoom / reset |
| F / B / M | Fullscreen / bookmark / suara halaman |
| ? / Escape | Bantuan / tutup panel atau reader |
| Ctrl/Cmd + F | Cari dalam buku |

Field yang sedang diedit tidak mengambil shortcut baca. `pageGap:0` membuat webtoon tanpa jarak; `wheelZoom:true` mengaktifkan zoom roda biasa. Fullscreen/orientation mengikuti izin dan kemampuan browser. Filter warna adalah pilihan kenyamanan, bukan koreksi medis buta warna.

## 🌸 Sebentar Sebelum Pulang

[Novelet contoh](example/sebentar-sebelum-pulang.pdf): **33 halaman, delapan bab, tiga ilustrasi pastel**, bookmark PDF dan EPUB lengkap. Bobby kembali sebentar ke rumah lama; Sarah, Aluna, Kirana, Naya dan Keira memperlihatkan kehidupan yang terus berjalan. Mayoritas halaman berisi prosa. CBZ hanya galeri ilustrasi. Fiksi orisinal dengan bantuan AI, bukan biografi atau salinan novel lain. [Sumber, prompt dan lisensi CC BY 4.0](example/story/README.md).

## 🌱 Terbuka dan jujur

Kode MIT. Mesin halaman PDFlipbook MIT, PDF.js Apache-2.0, fflate MIT; decoder DjVu eksternal GPL-2.0. [Atribusi](THIRD_PARTY_NOTICES.md). Belum ada klaim setara/lebih cepat daripada Readest atau foliate-js, atau dukungan penuh setiap OS/browser. [Riset dan roadmap](docs/roadmap.md) · [Kompatibilitas](docs/compatibility.md).

Musik menjadi fase berikutnya, terutama extension. Audio lokal pilihan pengguna bisa gratis tanpa API layanan; Spotify playback memerlukan Premium. Belum ada pemutar musik dalam 1.0. [Opsi musik](docs/offline-extension.md#music-a-later-phase).

Web publik memakai lookup negara IP country.is pada kunjungan pertama: ID→Indonesia, lainnya→English; pilihan manual menang, kegagalan kembali ke bahasa browser. `?geo=off` menonaktifkan lookup. Embed dan extension tidak melakukan geolokasi. Tidak ada unggahan dokumen atau analytics Sela.

Sela mencetak kredit satu kali di console ketika reader dibuka dan memiliki tautan kecil ke sumber. Atribusi tidak menjamin backlink terindeks atau peringkat SEO. Dibuat oleh **Bobby Fajar Christian**: [Portfolio](https://bobbyfajarc.github.io/) · [Instagram](https://instagram.com/bobby.fch) · [LinkedIn](https://www.linkedin.com/in/bobbyfajarc/) · [GitHub](https://github.com/bobbyfch).

Jika Sela membuat halaman proyekmu lebih nyaman dibaca, sebuah ⭐ membantu orang lain menemukannya.
