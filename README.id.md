<p align="center"><img src="logo.svg" width="88" alt="Lambang buku terbuka Sela"></p>

# Sela Reader 📖

**Buku-bukumu. Selalu dekat.**

Sela adalah jeda yang tak kosong: tempat seseorang menaruh kesibukan sebentar, membuka halaman, dan menemukan jalan pulang. Dua produk dengan satu mesin baca ringan: Reader sebagai web app perpustakaan pribadi di desktop, tablet dan ponsel, serta Viewer CDN untuk website.

[English](README.md) · [Demo](https://bobbyfch.github.io/sela/) · [Rilis 1.3](https://github.com/bobbyfch/sela/releases) · [Integrasi](docs/integrations.md) · [Format](docs/formats.md)

[![Install CDN viewer](https://img.shields.io/badge/install-CDN_viewer-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer) [![Latest release](https://img.shields.io/github/v/release/bobbyfch/sela?style=for-the-badge&color=236947&logo=github)](https://github.com/bobbyfch/sela/releases/latest)

[![Open Sela Reader](https://img.shields.io/badge/open-Sela_Reader-236947?style=for-the-badge&logo=android&logoColor=white)](https://bobbyfch.github.io/sela/#install-mobile)


Sela Reader memiliki antarmuka baca aplikasi tersendiri: navigasi ringkas, penggeser halaman, serta panel pengaturan bawah di ponsel dan panel samping di layar besar. Pilih palet Limaraya, Kertas, Tinta, atau Mawar, terpisah dari tampilan terang/gelap/sistem. Mesin dokumen dan layanan isi buku, pencarian, catatan, serta narasi dibagi dengan Viewer tanpa memasukkan UI aplikasi ke bundle CDN. Penjaga layar menyala tersedia jika didukung browser.

## Reader + Viewer

| Sela Reader | Sela Viewer |
| --- | --- |
| Installable web app: desktop, tablet and phone; private local library | Lightweight CDN / ESM plugin for websites and frameworks |

[Pilih / pasang lewat halaman publik](https://bobbyfch.github.io/sela/#products) · [Panduan produk](docs/products.md)

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

Core sekitar **26,6 KiB gzip**; CSS sekitar **3,9 KiB**. Adapter EPUB/CBZ sekitar **10,7 KiB**, alat baca **9,6 KiB**, adapter teks **3,0 KiB**, semuanya terpisah. PDF.js + worker modern sekitar **491 KiB gzip**, belum termasuk font/CMap dan dokumen. Ukuran core bukan ukuran keseluruhan aplikasi atau buku.

PDF, EPUB, CBZ, TXT, Markdown dasar, HTML aman, FB2 berbasis teks, serta DjVu dengan decoder eksternal. PDF pindai dan komik tidak punya teks untuk pencarian/TTS tanpa OCR. PDF punya transkrip teks, tetapi belum ada text layer yang sejajar atau highlight geometris. EPUB memakai navigasi bab, bukan pagination CFI/fidelitas layout penerbit. CBR/RAR, MOBI/AZW, DOCX dan DRM belum didukung. [Batas format](docs/formats.md).

## 🚀 Pasang Sela 1.3

[![Pasang viewer](https://img.shields.io/badge/pasang-CDN_%2F_self--hosted-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer)

Pilih **Reader** untuk perpustakaan pribadi atau **Viewer** untuk website/framework. [Buka app](https://bobbyfch.github.io/sela/mobile/) · [Kode Viewer](docs/install.md) · [Pasang app](docs/pwa.md).

Viewer tidak memerlukan Bootstrap/jQuery. Host embed harus memiliki tinggi; shortcut hanya aktif saat fokus berada di dalam reader. `destroy()` ketika komponen dilepas. Belum diterbitkan ke npm registry; paket dapat dipasang melalui tag GitHub. Browser lama memakai compatibility entry dengan fallback ke PDF asli.

Repo, Pages dan CDN memakai Sela; rilis saat ini **1.3.2**, dimulai dari 1.0.0. FlippyPDF dipensiunkan; migrasikan integrasi aktif ke Sela. Cache CDN publik tidak bisa ditarik kembali. Rilis v3 lama sudah dihapus dengan backup pemulihan lokal. Alias `Flippy` dan berkas dist lama hanya untuk migrasi. [Panduan migrasi](docs/migration.md).

## 📚 Sela Reader — perpustakaan pribadi

Web app untuk desktop, tablet dan ponsel. Beranda, Rak, Jelajah dan Pengaturan; koleksi/tag, favorit, sorting, filter, grid/list serta backup ZIP lengkap. Navigasi bawah di ponsel dan sisi kiri di desktop. Tema dan bahasa ada di Pengaturan. Buka app → menu browser → Pasang / Tambahkan ke Layar Utama. Tanpa browser extension; URL app dapat dijadikan bookmark atau halaman awal.

Contoh saat ini bisa dibaca atau disimpan offline. Novel baru dikerjakan pada fase konten berikutnya. Browser lama memperoleh tautan PDF; iPhone 4 tidak mendukung PWA modern lengkap. [Instalasi dan batas offline](docs/pwa.md).

Mode baca, fit halaman/lebar, preferensi global/per buku, typography, pangkas margin dan hemat daya tersedia. TTS memakai suara browser/OS, timer tidur dan pemutar kecil. [Panduan bacaan](docs/reading-experience.md).

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

## 🌸 Yang Tidak Ikut Pulang

[Novelet contoh](example/yang-tidak-ikut-pulang.pdf): **50 halaman, dua belas bab, empat ilustrasi minimalis**, 13 bookmark PDF dan EPUB lengkap. Bobby menemukan rekaman yang mengingat kalimat yang belum ia ucapkan. Misteri tenang tentang rumah, ingatan pinjaman, dan jawaban yang tidak tersedia. Mayoritas halaman berisi prosa; sketsa hitam putih berselang dengan pastel. CBZ hanya galeri ilustrasi. Fiksi orisinal dengan bantuan AI, bukan biografi. [Sumber, prompt dan lisensi CC BY 4.0](example/story/README.md).

## 🌱 Terbuka dan jujur

Kode MIT. Mesin halaman PDFlipbook MIT, PDF.js Apache-2.0, fflate MIT; decoder DjVu eksternal GPL-2.0. [Atribusi](THIRD_PARTY_NOTICES.md). Belum ada klaim setara/lebih cepat daripada Readest atau foliate-js, atau dukungan penuh setiap OS/browser. [Riset dan roadmap](docs/roadmap.md) · [Kompatibilitas](docs/compatibility.md).

Pemutar musik lokal belum menjadi fitur bawaan; adapter audio backend opsional dapat diintegrasikan oleh host.

Web publik memakai lookup negara IP country.is pada kunjungan pertama: ID→Indonesia, lainnya→English; pilihan manual menang, kegagalan kembali ke bahasa browser. `?geo=off` menonaktifkan lookup. Embed dan app Reader tidak melakukan geolokasi. Tidak ada unggahan dokumen atau analytics Sela.

Sela mencetak kredit satu kali di console ketika reader dibuka dan memiliki tautan kecil ke sumber. Atribusi tidak menjamin backlink terindeks atau peringkat SEO. Dibuat oleh **Bobby Fajar Christian**: [Portfolio](https://bobbyfajarc.github.io/) · [Instagram](https://instagram.com/bobby.fch) · [LinkedIn](https://www.linkedin.com/in/bobbyfajarc/) · [GitHub](https://github.com/bobbyfch).

Jika Sela membuat halaman proyekmu lebih nyaman dibaca, sebuah ⭐ membantu orang lain menemukannya.


## Backup cloud

Pengaturan → Unduh backup lengkap menyimpan buku dan data baca sebagai ZIP. Bagikan backup menyiapkan arsip; ketuk lagi untuk membagikannya lewat menu ponsel ke app cloud. Drive/OneDrive tersedia sebagai tautan unggah manual. Restore menambahkan buku tanpa menimpa buku atau catatan yang ada. Sinkronisasi akun otomatis belum tersedia.
