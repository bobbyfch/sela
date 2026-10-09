<p align="center"><img src="logo.svg" width="88" alt="Lambang buku terbuka Sela"></p>

# Sela 📖

**Di antara waktu. Di dalam cerita.**

Sela adalah jeda yang tak kosong: tempat seseorang menaruh kesibukan sebentar, membuka halaman, dan menemukan jalan pulang. Tiga produk dengan satu mesin baca ringan: Viewer CDN untuk website, Home untuk new tab desktop, dan Bookshelf sebagai app mobile.

[English](README.md) · [Demo](https://bobbyfch.github.io/sela/) · [Rilis 1.2](https://github.com/bobbyfch/sela/releases) · [Integrasi](docs/integrations.md) · [Format](docs/formats.md)

[![Install CDN viewer](https://img.shields.io/badge/install-CDN_viewer-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer) [![Download extension](https://img.shields.io/badge/install-Sela_Home-236947?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bobbyfch.github.io/sela/#install-extension) [![Latest release](https://img.shields.io/github/v/release/bobbyfch/sela?style=for-the-badge&color=236947&logo=github)](https://github.com/bobbyfch/sela/releases/latest)

[![Install Bookshelf mobile](https://img.shields.io/badge/install-Bookshelf_mobile-236947?style=for-the-badge&logo=android&logoColor=white)](https://bobbyfch.github.io/sela/#install-mobile)

## Tiga cara memakai Sela

| Viewer | Home | Bookshelf |
| --- | --- | --- |
| Reader CDN untuk website / framework | Extension new tab desktop + widget + buku | Web app mobile + bottom bar + buku lokal |

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

Core sekitar **23,9 KiB gzip**; CSS sekitar **3,4 KiB**. Adapter EPUB/CBZ sekitar **6,7 KiB**, alat baca **6 KiB**, adapter teks **2,5 KiB**, semuanya terpisah. PDF.js + worker modern sekitar **491 KiB gzip**, belum termasuk font/CMap dan dokumen. Ukuran core bukan ukuran keseluruhan aplikasi atau buku.

PDF, EPUB, CBZ, TXT, Markdown dasar, HTML aman, FB2 berbasis teks, serta DjVu dengan decoder eksternal. PDF pindai dan komik tidak punya teks untuk pencarian/TTS tanpa OCR. PDF punya transkrip teks, tetapi belum ada text layer yang sejajar atau highlight geometris. EPUB memakai navigasi bab, bukan pagination CFI/fidelitas layout penerbit. CBR/RAR, MOBI/AZW, DOCX dan DRM belum didukung. [Batas format](docs/formats.md).

## 🚀 Pasang Sela 1.2

[![Pasang viewer](https://img.shields.io/badge/pasang-CDN_%2F_self--hosted-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer) [![Unduh extension](https://img.shields.io/badge/unduh-extension_rak_buku-236947?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bobbyfch.github.io/sela/#install-extension)

Pilih **Viewer** untuk website/framework, **Home** untuk new tab desktop, atau **Bookshelf** untuk app mobile. [Pintu masuk publik](https://bobbyfch.github.io/sela/#products) · [Kode Viewer](docs/install.md) · [Pasang Home](docs/offline-extension.md) · [Pasang Bookshelf](docs/pwa.md).

Viewer tidak memerlukan Bootstrap/jQuery. Host embed harus memiliki tinggi; shortcut hanya aktif saat fokus berada di dalam reader. `destroy()` ketika komponen dilepas. Belum diterbitkan ke npm registry; paket dapat dipasang melalui tag GitHub. Browser lama memakai compatibility entry dengan fallback ke PDF asli.

Repo, Pages dan CDN memakai Sela; rilis saat ini **1.2.0**, dimulai dari 1.0.0. FlippyPDF dipensiunkan; migrasikan integrasi aktif ke Sela. Cache CDN publik tidak bisa ditarik kembali. Rilis v3 lama sudah dihapus dengan backup pemulihan lokal. Alias `Flippy` dan berkas dist lama hanya untuk migrasi. [Panduan migrasi](docs/migration.md).

## 🏡 Sela Home — new tab desktop

Rak pribadi, jam/tanggal, jeda kopi, kutipan offline dan cuaca kota opsional. Pasang extension **New Tab** di browser Windows/macOS/Linux yang didukung. Standard hanya edisi kompatibilitas. Safari belum dipaketkan. Pencarian, sorting, favorit, filter format/status dan tampilan shelf/grid/list tersedia.

[Pilih produk](https://bobbyfch.github.io/sela/#products) · [Instal Home](docs/offline-extension.md)

## 📱 Sela Bookshelf — app mobile

Rak lokal persisten, bottom bar, reader mobile, sorting, filter, favorit dan tampilan shelf/grid/list. Buka Pages di ponsel/tablet → Bookshelf → Tambahkan ke Layar Utama / Install. Desktop mendapat pemberitahuan perangkat. Ponsel lama memperoleh fallback tautan PDF; iPhone 4 tidak bisa menjalankan PWA offline modern lengkap. Lima contoh sampul disiapkan, empat di antaranya placeholder teks berlabel jelas.

[Panduan dan batas mobile](docs/pwa.md)

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

Musik menjadi fase berikutnya, terutama extension. Audio lokal pilihan pengguna bisa gratis tanpa API layanan; Spotify playback memerlukan Premium. Belum ada pemutar musik dalam 1.0. [Opsi musik](docs/offline-extension.md#music-a-later-phase).

Web publik memakai lookup negara IP country.is pada kunjungan pertama: ID→Indonesia, lainnya→English; pilihan manual menang, kegagalan kembali ke bahasa browser. `?geo=off` menonaktifkan lookup. Embed dan extension tidak melakukan geolokasi. Tidak ada unggahan dokumen atau analytics Sela.

Sela mencetak kredit satu kali di console ketika reader dibuka dan memiliki tautan kecil ke sumber. Atribusi tidak menjamin backlink terindeks atau peringkat SEO. Dibuat oleh **Bobby Fajar Christian**: [Portfolio](https://bobbyfajarc.github.io/) · [Instagram](https://instagram.com/bobby.fch) · [LinkedIn](https://www.linkedin.com/in/bobbyfajarc/) · [GitHub](https://github.com/bobbyfch).

Jika Sela membuat halaman proyekmu lebih nyaman dibaca, sebuah ⭐ membantu orang lain menemukannya.
