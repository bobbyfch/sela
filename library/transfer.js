// Generated from app/library/transfer.ts by npm run build. Do not edit.
const encoder = new TextEncoder();
const magic = encoder.encode("SELA-TRANSFER-V1\n");
const maxBytes = 128 * 1048576;
const iterations = 6e5;
export function createTransferPin() {
  const range = 1n << 48n;
  const span = 1000000000000n;
  const limit = range - range % span;
  for (; ; ) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    let value = 0n;
    for (const byte of bytes) value = value << 8n | BigInt(byte);
    if (value < limit) return String(value % span).padStart(12, "0");
  }
}
function validatePin(pin) {
  if (!/^\d{12}$/.test(pin)) throw new Error("Enter the 12-digit transfer PIN.");
}
async function deriveKey(pin, salt, usage) {
  validatePin(pin);
  const material = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    usage
  );
}
export async function encryptBackupForTransfer(archive, pin) {
  validatePin(pin);
  if (archive.size > maxBytes) throw new Error("Encrypted transfer supports backups up to 128 MiB.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt, ["encrypt"]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, await archive.arrayBuffer()));
  const output = new Uint8Array(magic.length + salt.length + iv.length + encrypted.length);
  output.set(magic, 0);
  output.set(salt, magic.length);
  output.set(iv, magic.length + salt.length);
  output.set(encrypted, magic.length + salt.length + iv.length);
  return new Blob([output], { type: "application/vnd.sela.transfer" });
}
export async function decryptBackupForTransfer(file, pin) {
  validatePin(pin);
  if (file.size > maxBytes + 128 || file.size < magic.length + 16 + 12 + 16) throw new Error("This transfer file is incomplete or too large.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  for (let index = 0; index < magic.length; index++) if (bytes[index] !== magic[index]) throw new Error("This is not a Sela PIN transfer file.");
  const saltStart = magic.length;
  const ivStart = saltStart + 16;
  const dataStart = ivStart + 12;
  const salt = bytes.slice(saltStart, ivStart);
  const iv = bytes.slice(ivStart, dataStart);
  const key = await deriveKey(pin, salt, ["decrypt"]);
  try {
    const archive = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, bytes.slice(dataStart));
    return new File([archive], "sela-library-restored.zip", { type: "application/zip" });
  } catch {
    throw new Error("The PIN is incorrect or this transfer file has been changed.");
  }
}
