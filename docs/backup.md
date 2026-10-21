# Backup and restore

No account setup is needed. In **Settings**, choose **Download full backup** for a ZIP containing original books and reading data. **Share backup** prepares the ZIP; tap again to open your device’s share sheet and choose an installed app. If file sharing is unavailable, use Download full backup.

**Restore backup** imports a ZIP into the current local shelf, preserving existing books and newer reading data. Keep the original files and a separate backup before clearing site data. There is no automatic cloud synchronization.

Backups include empty collections and personal reading profiles. Matching local profile names are retained on restore. Archives support up to 200 books / 120 MiB of originals and 20 profiles. A malformed or oversized profile list is rejected before importing books. Backup and EPUB adapters are cached with the installed app for offline use.

## Encrypted transfer

**Create PIN transfer** downloads a .sela-transfer file encrypted on this device with AES-GCM. Sela generates a random 12-digit PIN and derives the encryption key with PBKDF2-SHA-256. Send the transfer file and PIN through separate channels. To restore it, choose the file, enter the PIN, then select **Decrypt and restore**. A wrong PIN or modified file is rejected before the archive is opened.

Keep a copy of the PIN until the receiving device finishes restoring. The PIN is shown only on the device that created the transfer. Large libraries remain subject to the 128 MiB encrypted transfer limit.

## Indonesia

Di **Pengaturan**, pilih **Unduh backup lengkap** untuk menyimpan buku dan data baca. **Bagikan backup** menyiapkan ZIP; ketuk lagi untuk memilih aplikasi dari menu berbagi perangkat. Jika tidak didukung, unduh ZIP. **Pulihkan backup** menambahkan isi cadangan tanpa menimpa buku dan catatan yang lebih baru. Tidak perlu pengaturan akun.

### Transfer terenkripsi

**Buat transfer dengan PIN** mengunduh file .sela-transfer yang dienkripsi di perangkat ini memakai AES-GCM. Sela membuat PIN acak 12 digit dan menurunkan kunci dengan PBKDF2-SHA-256. Kirim file transfer dan PIN melalui jalur yang berbeda. Untuk memulihkannya, pilih file, masukkan PIN, lalu pilih **Dekripsi dan pulihkan**. PIN salah atau file yang berubah akan ditolak sebelum arsip dibuka.

Simpan PIN sampai perangkat penerima selesai memulihkan data. PIN hanya ditampilkan di perangkat pembuat transfer. Ukuran transfer terenkripsi dibatasi 128 MiB.
