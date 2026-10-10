# Cloud connections

Sela can import selected files from Google Drive or personal OneDrive. Cloud connection is optional. Local reading, ZIP backup and offline shelves do not need an account. This connector imports files; it does not synchronize books, annotations or backups automatically.

In the web app, open **Settings → Connect cloud storage**. Supply your own registered application's public IDs below. Sela does not ship shared credentials. Real account authorization must be tested after registration on your deployment.

## Google Drive

1. Create a Google Cloud project and enable **Google Drive API** and **Google Picker API**.
2. Configure the OAuth consent screen. For a testing app, add your account as a test user.
3. Create a **Web application OAuth client**. Authorized JavaScript origins must include your deployment's origin (for GitHub Pages: `https://bobbyfch.github.io`). Local development uses `http://127.0.0.1:4173`.
4. Create a browser API key. Restrict it to Google Picker API and the HTTP referrers required by the [Picker guide](https://developers.google.com/workspace/drive/picker/guides/web-picker), including your site and `https://docs.google.com/*`.
5. Enter the OAuth Client ID, API key and numeric **project number** in Sela settings. Never enter an OAuth client secret.
6. Click **Connect Google Drive** to load Google's SDK. Click **Choose Google Drive file** to authorize and open Picker.

The connector requests `drive.file`: access is scoped to files selected through Picker. Sela only downloads the selected file. Google-native Docs/Sheets are not imported; export them as a supported document first. Google may require OAuth verification before an app is distributed beyond testing.

## Personal OneDrive

1. Register an application in Microsoft Entra that supports **personal Microsoft accounts**.
2. Add the **Single-page application (SPA)** platform. Register this exact redirect URI: `https://bobbyfch.github.io/sela/mobile/cloud-callback.html`. For another deployment, substitute its origin and base path. Locally: `http://127.0.0.1:4173/mobile/cloud-callback.html`.
3. Add delegated Microsoft Graph permission **Files.Read**. Do not create or enter a client secret.
4. Copy the Application (client) ID to Sela settings and connect OneDrive. Allow the sign-in popup.
5. Browse your folders and select a supported book. Organizational OneDrive accounts are not supported by this personal-account connector.

Authorization uses the [Microsoft SPA authorization-code flow with PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow). The callback validates origin, popup source and a random state value. Browsers that isolate the sign-in popup use a same-origin BroadcastChannel keyed by that random state instead. Files are downloaded using [Graph's temporary download URLs](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content).

## Privacy and limits

- Connection happens only after you click its button and approve your account's consent screen.
- Access tokens stay in memory; closing/reloading Sela or disconnecting ends the local session. Sela does not request background refresh access.
- Public client IDs and the restricted Google API key are saved locally. They identify an application and are not secrets. No OAuth secret belongs in frontend code.
- Cloud imports support PDF, EPUB, CBZ, DjVu, TXT, Markdown, HTML and FB2, up to **64 MB per file**. Network interruptions, browser CORS policies and provider restrictions can prevent imports; download the file through its provider and add it locally instead.
- ZIP backups remain a separate manual export/restore feature. Store them in your own Drive/OneDrive account if desired.

## Koneksi cloud (Indonesia)

Buka **Pengaturan → Hubungkan penyimpanan cloud**. Daftarkan aplikasi Google atau Microsoft sesuai langkah di atas, lalu isi ID publik aplikasi milikmu. Tidak ada akun atau kredensial bersama bawaan Sela. Koneksi ini mengimpor buku pilihan, bukan sinkronisasi otomatis. Token hanya berada di memori; berkas yang diimpor tetap tersimpan di rak lokal perangkat.
