<p align="center"><img src="logo.svg" width="88" alt="Lambang buku terbuka Sela"></p>

# Sela Reader 📖

**Buku-bukumu. Selalu dekat.**

Sela adalah jeda yang tak kosong: tempat seseorang menaruh kesibukan sebentar, membuka halaman, dan menemukan jalan pulang. Dua produk dengan satu mesin baca ringan: Reader sebagai web app perpustakaan pribadi di desktop, tablet dan ponsel, serta Viewer CDN untuk website.

[English](README.md) · [Demo](https://bobbyfch.github.io/sela/) · [Rilis terbaru](https://github.com/bobbyfch/sela/releases) · [Integrasi](docs/integrations.md) · [Format](docs/formats.md)

Sela masih **beta**. Versi rilis bersumber dari `package.json`; build memperbarui header, runtime, metadata dan contoh CDN. [Pengembangan dan versi](docs/development.md).

[![Install CDN viewer](https://img.shields.io/badge/install-CDN_viewer-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer) [![Latest release](https://img.shields.io/badge/version-0.9_beta-31725a?style=for-the-badge&color=236947&logo=github)](https://github.com/bobbyfch/sela/releases)

[![Open Sela Reader](https://img.shields.io/badge/open-Sela_Reader-236947?style=for-the-badge&logo=android&logoColor=white)](https://bobbyfch.github.io/sela/#install-mobile)

Reader dan Viewer memakai satu antarmuka responsif: navigasi ringkas, penggeser halaman, penanda, pratinjau, serta panel bawah di ponsel dan panel samping di layar besar. Pilih palet Rimba, Lontar, Nila, Seroja atau Jelaga (OLED), terpisah dari terang/gelap/sistem. Pilih profil Novel, Manga, Kajian atau Larut di pengaturan reader; simpan hingga 20 profil pribadi yang ikut dalam backup rak. Modul tambahan dimuat saat dipakai. Penjaga layar dan kunci orientasi tersedia jika didukung browser.

Jelajah langsung menampilkan pencarian buku dari GITenberg, Wikisumber Indonesia, atau katalog OPDS terbuka milikmu. Buku dibaca di Sela dan dapat disimpan offline, tanpa akun. [Sumber dan batasannya](docs/library-sources.md). DOCX dan ODT tersedia sebagai tampilan teks; berkas asli tetap bisa diekspor. Catatan kaki EPUB bertanda semantik dapat dibuka sebagai popup.

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

Core sekitar **26,9 KiB gzip**. Adapter EPUB/CBZ sekitar **12,4 KiB**, teks **3,9 KiB**, dan konversi teks DOCX/ODT **3,8 KiB**, dimuat terpisah sesuai format. PDF.js + worker modern sekitar **491 KiB gzip**, belum termasuk font/CMap dan dokumen. Lihat ukuran terukur dalam `dist/manifest.json`.

PDF, EPUB, CBZ, TXT, Markdown dasar, HTML aman, FB2 berbasis teks, serta DjVu dengan decoder eksternal. PDF pindai dan komik tidak punya teks untuk pencarian/TTS tanpa OCR. PDF punya transkrip teks, tetapi belum ada text layer yang sejajar atau highlight geometris. EPUB memakai navigasi bab, bukan pagination CFI/fidelitas layout penerbit. CBR/RAR, CB7, MOBI/AZW, DOC lama, RTF dan DRM konten belum didukung. DOCX/ODT menyediakan tampilan teks. [Batas format](docs/formats.md).

## 🚀 Pasang Sela

[![Pasang viewer](https://img.shields.io/badge/pasang-CDN_%2F_self--hosted-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer)

Pilih **Reader** untuk perpustakaan pribadi atau **Viewer** untuk website/framework. [Buka app](https://bobbyfch.github.io/sela/mobile/) · [Kode Viewer](docs/install.md) · [Pasang app](docs/pwa.md).

Viewer tidak memerlukan Bootstrap/jQuery. Host embed harus memiliki tinggi; shortcut hanya aktif saat fokus berada di dalam reader. `destroy()` ketika komponen dilepas. Belum diterbitkan ke npm registry; paket dapat dipasang melalui tag GitHub. Browser lama memakai compatibility entry dengan fallback ke PDF asli.

## 📚 Sela Reader — perpustakaan pribadi

Web app untuk desktop, tablet dan ponsel. Beranda, Rak, Jelajah dan Pengaturan; koleksi/tag, favorit, sorting, filter, grid/list serta backup ZIP lengkap. Navigasi bawah di ponsel dan sisi kiri di desktop. Tema dan bahasa ada di Pengaturan. Buka app → menu browser → Pasang / Tambahkan ke Layar Utama. Tanpa browser extension; URL app dapat dijadikan bookmark atau halaman awal.

Contoh saat ini bisa dibaca atau disimpan offline. Browser lama memperoleh tautan PDF; iPhone 4 tidak mendukung PWA modern lengkap. [Instalasi dan batas offline](docs/pwa.md).

Mode baca, fit halaman/lebar, preferensi global/per buku, typography, pangkas margin dan hemat daya tersedia. TTS memakai suara browser/OS, timer tidur dan pemutar kecil. [Panduan bacaan](docs/reading-experience.md).

## 🎧 Dengarkan, cari, simpan

Tombol **Daftar isi & penanda** membuka daftar isi/outline, pencarian, transkrip, TTS dan catatan. Narasi menggunakan Web Speech API dan suara browser/OS: tanpa API key atau langganan Sela. Suara lokal diprioritaskan. Suara daring dapat mengirim teks ke penyedia dan harus diaktifkan secara sadar. Suara Indonesia, pause/resume dan bacaan latar bergantung pada perangkat; tidak dijanjikan suara tertentu.

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

## 🌱 Terbuka dan jujur

Kode MIT. Mesin halaman PDFlipbook MIT, PDF.js Apache-2.0, fflate MIT; decoder DjVu eksternal GPL-2.0. [Atribusi](THIRD_PARTY_NOTICES.md). Belum ada klaim setara/lebih cepat daripada Readest atau foliate-js, atau dukungan penuh setiap OS/browser. [Kompatibilitas](docs/compatibility.md).

Pemutar musik lokal belum menjadi fitur bawaan; adapter audio backend opsional dapat diintegrasikan oleh host.

Web publik memakai lookup negara IP country.is pada kunjungan pertama: ID→Indonesia, lainnya→English; pilihan manual menang, kegagalan kembali ke bahasa browser. `?geo=off` menonaktifkan lookup. Embed dan app Reader tidak melakukan geolokasi. Tidak ada unggahan dokumen atau analytics Sela.

Sela mencetak kredit satu kali di console ketika reader dibuka dan memiliki tautan kecil ke sumber. Atribusi tidak menjamin backlink terindeks atau peringkat SEO. Dibuat oleh **Bobby Fajar Christian**: [Portfolio](https://bobbyfajarc.github.io/) · [Instagram]([private social link removed]) · [LinkedIn]([private social link removed]) · [GitHub](https://github.com/bobbyfch).

Jika Sela membuat halaman proyekmu lebih nyaman dibaca, sebuah ⭐ membantu orang lain menemukannya.

## Backup cloud

Pengaturan → Unduh backup lengkap menyimpan buku dan data baca sebagai ZIP. Bagikan backup menyiapkan arsip; ketuk lagi untuk membagikannya lewat menu ponsel ke app cloud. Tidak memerlukan akun atau pengaturan teknis. Restore menambahkan buku tanpa menimpa buku atau catatan yang ada. Sinkronisasi akun otomatis belum tersedia.

## Info buku dan kartu bacaan

Reader menampilkan judul, penulis, tahun terbit, penerbit, bahasa, ISBN/identitas, deskripsi, topik dan hak penggunaan bila tersedia. Metadata PDF, EPUB, ComicInfo dan FB2 dibaca lokal; info buku di rak bisa diedit dan ikut backup/restore. Tanggal pembuatan file PDF bukan tahun terbit.

Penanda halaman ada di **Daftar isi & penanda → Penandamu**. Tombol **Screenshot & kutipan** membuat PNG 1080 × 1350 dari kutipan atau halaman PDF/komik, lengkap dengan judul, penulis, tahun dan nomor halaman. Buat pratinjau dulu, lalu unduh PNG atau gunakan menu berbagi perangkat jika didukung. Buku teks memakai kartu kutipan.

Viewer CDN mendukung `ui: 'app'` dan `palette: 'forest' | 'paper' | 'ink' | 'rose' | 'charcoal'`. Tampilan app menjadi antarmuka tunggal. Module tampilannya dimuat saat reader dibuka, termasuk pada embed; palet tidak mengubah tema website. `await reader.getMetadata()` membaca info buku, sedangkan `metadata: {...}` menyediakan pelengkapnya. Untuk `autoStyles: false`, muat `sela.min.css` dan `sela.app.css` sendiri.

## Tampilan dan sumber buku

Reader dan Viewer CDN memakai satu antarmuka responsif: ikon navigasi, penanda, pratinjau halaman, tema sistem/terang/gelap dan palet **Rimba, Lontar, Nila, Seroja, Jelaga (OLED)**. Tidak perlu memilih tampilan klasik atau app. `ui: 'classic'` lama menjadi alias antarmuka terbaru.

Buka **Jelajah** untuk mencari klasik dunia dari GITenberg atau teks Indonesia dari Wikisumber. Hasil memiliki pagination, cover buatan Sela, serta **Baca / Simpan offline**; buku dibuka di Sela. Katalog OPDS terbuka dengan HTTPS/CORS dapat ditambahkan tanpa akun. Delapan klasik pilihan tetap tersedia sebagai cadangan. Isi diunduh hanya saat dipilih; kelengkapan edisi, batas API dan hak cipta mengikuti sumber serta negara pembaca. [Sumber dan batasannya](docs/library-sources.md).

**Beranda** menyediakan ringkasan rak, lanjut baca dengan cover, serta timer 15/25/45 menit. Cuaca opsional di samping jam memakai kota pilihan sendiri, tanpa akses lokasi perangkat atau API key. Data tersimpan 30 menit. [Cuaca dan privasi](docs/weather.md).

## Rak dan koleksi

Pilih grid, list padat, atau rak kayu khusus cover. Urutan dan filter ada dalam satu panel. Tekan lama cover untuk memilih buku; menu buku menyediakan sematan, metadata, berkas asli, dan keanggotaan koleksi. Buat, ganti nama, hapus koleksi, serta tambahkan, keluarkan, atau pindahkan buku pilihan. Satu buku dapat masuk beberapa koleksi. Menghapus koleksi tetap menyimpan buku dan data bacanya. Backup ZIP menyertakan koleksi kosong dan keanggotaan.

Pada Teks dokumen, aksi muncul setelah teks dipilih: simpan kutipan ke catatan halaman, sorot, dengarkan, buat kartu kutipan, atau batalkan pilihan. Ini memakai transkrip teks yang dapat diambil; OCR dokumen pindai belum tersedia.
