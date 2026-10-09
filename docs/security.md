# Security, attribution and distribution

Sela is open source under MIT. Copyright and upstream notices must be retained. Code exposes an author/version console attribution, and official bundles include a license banner. `dist/manifest.json` records asset SHA-256 hashes. These establish provenance; they do not make JavaScript impossible to copy.

Browser-delivered JavaScript, CSS and extension ZIPs can be inspected. Obfuscation, encryption with a client-side key, domain checks and watermark strings do not prevent cloning. Automatic redirects on third-party domains would also break legitimate self-hosting, localhost, intranet and framework integrations. Sela deliberately does not redirect or collect usage telemetry. A CDN cache cannot recall bytes that were already public.

## Local data

Books are stored as byte buffers in IndexedDB under the extension's origin. This is **not application-level encryption at rest**. Browser/OS protections apply, but someone with access to the unlocked profile may read data. Use device encryption and retain originals. A future passphrase vault would need authenticated encryption, careful key handling, backups and a recovery design; no such vault is claimed here.

## Active content and permissions

PDF.js runs with `isEvalSupported: false`. HTML/EPUB input is sanitized, external embedded resources and active scripts are removed. Archive entries, expanded size and book imports are bounded. These safeguards do not replace browser sandboxing or security updates.

Extension scripts and reading engines are bundled, with `script-src 'self'; object-src 'none'`. Mandatory permissions: `contextMenus`, `storage` (update preference/result), and `alarms` (daily stable-release notification). Remote book access is optional and scoped to the selected origin. The release check uses only the public GitHub releases API with credentials omitted; no book content is sent. Scheduled checks can be disabled.

The update checker validates stable semantic versions and constructs the official release URL itself. It never executes downloaded code, automatically installs ZIPs, or silently changes extension identity. Chrome/Edge store distribution and signed Firefox distribution are the standard paths to automatic code updates. Current ZIPs are unsigned development builds.
