<p align="center"><img src="logo.svg" width="76" alt="Logo Sela Books"></p>
<h1 align="center">Sela Books</h1>
<p align="center"><strong>Rak bukumu sendiri.</strong><br>Cerita, dokumen, kitab suci, dan sedikit ruang untukmu.</p>

<p align="center">
  <a href="https://github.com/bobbyfch/sela/actions/workflows/ci.yml"><img src="https://github.com/bobbyfch/sela/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/versi-0.9.0--beta.8-blue" alt="Versi 0.9.0-beta.8">
  <img src="https://img.shields.io/badge/lisensi-MIT-green" alt="Lisensi MIT">
  <img src="https://img.shields.io/badge/PWA-siap%20offline-5b4b3a" alt="PWA siap offline">
</p>

<p align="center">
  <a href="https://bobbyfch.github.io/sela/app/">Buka aplikasi</a> ·
  <a href="https://bobbyfch.github.io/sela/">Situs proyek</a> ·
  <a href="docs/README.md">Dokumentasi</a> ·
  <a href="README.md">English</a> ·
  <a href="https://github.com/bobbyfch/sela/releases">Rilis</a>
</p>

<p align="center"><img src="site/screenshots/app-desktop.webp" alt="Sela Books di desktop" width="720"></p>

Sela adalah ruang baca pribadi untuk buku, komik, dokumen, dan kitab suci. Nama Sela berarti jeda: tempat kecil dalam sehari untuk kembali ke sebuah cerita. Perpustakaan tersimpan di peramban, bisa dipakai offline setelah dipasang, dan tidak ada yang diunggah.

Sela hadir dalam dua bentuk yang memakai satu mesin dokumen:

| | Sela Books | Sela Viewer |
| --- | --- | --- |
| Apa itu | Aplikasi web yang bisa dipasang (PWA) dengan rak pribadi | Pembaca tanpa kerangka kerja yang bisa disematkan di situs mana pun |
| Penyimpanan | IndexedDB di perangkatmu | Tidak ada, membuka dokumen yang kamu berikan |
| Cara memakai | [bobbyfch.github.io/sela/app](https://bobbyfch.github.io/sela/app/) | Skrip CDN atau impor ESM, lihat [Instalasi](docs/install.md) |

## Isi

- [Fitur](#fitur)
- [Mulai cepat](#mulai-cepat)
- [Sematkan Viewer](#sematkan-viewer)
- [Bacaan agama dan lisensi konten](#bacaan-agama-dan-lisensi-konten)
- [Privasi](#privasi)
- [Dokumentasi](#dokumentasi)
- [Berkontribusi](#berkontribusi)
- [Keamanan](#keamanan)
- [Lisensi](#lisensi)

## Fitur

### Membaca

- PDF, EPUB, CBZ, TXT, Markdown, HTML, FB2, DOCX, dan ODT. DjVu berjalan dengan dekoder eksternal yang kamu sediakan.
- Mode buku, satu halaman, manga (kanan ke kiri), dan webtoon bergulir.
- Penanda, catatan, sorotan, progres baca, koleksi, cadangan, dan pemulihan, semuanya tersimpan lokal.

### Rak dan tab Agama

- Cari isi rakmu dengan indeks di perangkat yang memahami kalimat Indonesia sehari-hari. Kata kunci tidak diunggah.
- Setelah kamu memilih agama atau tradisi di Pengaturan, tab **Agama** muncul di rak berisi kitab suci dan karya klasik tradisi itu. Lihat [Bacaan agama](#bacaan-agama-dan-lisensi-konten).

### Jelajah

- Pilih katalog, lalu koleksi, lalu topik opsional. Sumbernya Project Gutenberg, Wikisumber, GITenberg, Open Library, OpenStax, peringkat BookRank, Pilihan Sela, dan katalog OPDS milikmu. Data tanpa edisi terbuka diberi tautan keluar dan tidak berpura-pura bisa diunduh. Lihat [sumber pustaka](docs/library-sources.md).

### Beranda

- Kutipan, berita topik, kabar "pada hari ini", kalender membaca, cuaca opsional, timer fokus, dan pelacak kebiasaan. Perkiraan jadwal salat hanya diminta saat kamu memintanya.

### Catatan baca

- Waktu baca dan beruntun harian, dengan tampilan mingguan, bulanan, dan tahunan. Sesi berhenti saat pembaca tidak terlihat.

### Tampilan dan bahasa

- Delapan palet (Sela, Rimba, Sakura, Samudra, Lembayung, Kenanga, Senja, Arunika) dengan mode terang, gelap, dan OLED yang terpisah.
- Bahasa antarmuka: Inggris, Indonesia, Jepang, Spanyol, Prancis, Jerman, Portugis, Tionghoa, dan Korea.

<p align="center"><img src="site/screenshots/app-mobile.webp" width="220" alt="Sela Books di ponsel"> <img src="site/screenshots/app-palettes.png" width="360" alt="Tema warna Sela Books"></p>

## Mulai cepat

Pakai aplikasi yang sudah di-host, atau jalankan sendiri.

```sh
git clone https://github.com/bobbyfch/sela.git
cd sela
npm ci
npm run build
npm run serve
```

Lalu buka `http://127.0.0.1:4173/sela/app/` untuk aplikasi dan `http://127.0.0.1:4173/sela/` untuk situs proyek. Server lokal meniru awalan `/sela/` milik GitHub Pages, jadi jalur aset berperilaku sama seperti di produksi.

Kebutuhan: Node.js 22.18 atau lebih baru (disarankan 24) dan npm.

| Perintah | Fungsi |
| --- | --- |
| `npm run typecheck` | Cek tipe semua proyek |
| `npm test` | Uji unit |
| `npm run test:browser` | Uji Playwright di Chromium, Firefox, dan WebKit, ditambah proyek service worker asli |
| `npm run build` | Bangun ulang aset, manifes, dan identitas cache |
| `node --experimental-strip-types scripts/packs.ts --check` | Periksa katalog paket bacaan |

Selengkapnya di [Pengembangan](docs/development.md).

## Sematkan Viewer

```html
<script src="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v0.9.0-beta.8/dist/js/sela.min.js"></script>
<button id="read" type="button">Baca PDF</button>
<script>
  const reader = new Sela({ pdfUrl: '/books/story.pdf', title: 'Ceritaku', mode: 'book', theme: 'auto', language: 'id' });
  document.querySelector('#read').addEventListener('click', () => reader.open());
</script>
```

Kunci ke satu tag rilis di produksi. Contoh ESM, TypeScript, React, Vue, Svelte, Astro, PHP, dan HTML statis ada di [Instalasi](docs/install.md) dan [Integrasi](docs/integrations.md).

## Bacaan agama dan lisensi konten

Pilih agama atau tradisi di **Pengaturan → Alat perpustakaan**. Tab Agama lalu hanya menampilkan bacaan untuk tradisi itu. Tidak ada yang diunduh sebelum kamu menekan tombolnya, dan tidak ada yang masuk ke daftar bukumu.

| Tradisi | Bacaan |
| --- | --- |
| Islam | Al-Qur'an (teks Arab dengan terjemahan Indonesia atau Inggris) dan hadis yang diunduh dari penerbitnya, ditambah kisah 25 nabi, Syair Perahu, dan Gurindam Dua Belas |
| Kristen Protestan | Alkitab TSI (Indonesia), World English Bible, karya klasik Kristen |
| Katolik | Alkitab TSI, Douay-Rheims, kitab Deuterokanonika, karya klasik Kristen |
| Buddha | Khotbah Pali dalam bahasa Inggris (DN, MN, SN, AN, dan kumpulan yang lebih pendek), Samyukta Agama dalam bahasa Indonesia, Dhammapada, kisah Jataka, The Gospel of Buddha |
| Hindu | Bhagavad-Gita, Upanishad, Yoga Sutra, Ramayana |
| Konghucu | Analects, Mencius, Da Xue, Zhong Yong, Tao Teh King |

Unduhan diperiksa sebelum disimpan, bisa dibaca offline, dan bisa dihapus di Pengaturan tanpa menyentuh bukumu, catatan, atau cadangan. Entri yang kamu simpan, catatan dan kutipanmu sendiri, serta posisi bacamu ikut dalam cadangan Sela.

Setiap edisi punya lisensinya sendiri. Lisensi MIT SELA hanya mencakup kode dan teks tulisan SELA. Lihat [Bacaan agama: sumber](docs/faith-readings-sources.md) dan [pemberitahuan pihak ketiga](THIRD_PARTY_NOTICES.md). Kisah 25 nabi masih berupa draf yang belum ditelaah ulama, dan aplikasi menyatakannya.

## Privasi

Buku, catatan, dan progres tetap di IndexedDB perangkatmu. Tidak ada analitik dan tidak ada unggahan dokumen. Aplikasi menghubungi pihak ketiga hanya untuk fitur yang kamu aktifkan atau sumber yang kamu pilih: katalog Jelajah, cuaca dan perkiraan salat opsional, serta unduhan Al-Qur'an dan hadis dari penerbitnya. Rinciannya di [Keamanan](docs/security.md).

## Dokumentasi

Mulai dari [indeks dokumentasi](docs/README.md). Pintu masuk yang berguna: [Instalasi](docs/install.md), [Pasang sebagai aplikasi](docs/pwa.md), [Format dan batas](docs/formats.md), [Cadangan](docs/backup.md), [Sumber pustaka](docs/library-sources.md), [Peta repositori](docs/repository-map.md).

## Berkontribusi

Laporan masalah dan perbaikan kecil yang bisa direproduksi sangat diterima. Baca [CONTRIBUTING.md](CONTRIBUTING.md) dan [kode etik](CODE_OF_CONDUCT.md) lebih dulu.

## Keamanan

Laporkan kerentanan secara privat. Lihat [SECURITY.md](SECURITY.md).

## Lisensi

Sela dirilis dengan [Lisensi MIT](LICENSE). Komponen dan konten pihak ketiga punya lisensi sendiri yang tercantum di [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Dekoder DjVu eksternal opsional bukan bagian dari Sela dan berlisensi terpisah.

Sela (dibaca *se-la*) berarti jeda. Ilustrasinya menampilkan tokoh penyihir orisinal dan makhluk kecil pecinta buku.

© Bobby Fajar Christian.
