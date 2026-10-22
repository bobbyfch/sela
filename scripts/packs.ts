import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { validatePackIndex, validatePackManifest, validateProphetPayload, type PackManifest } from '../app/library/content-packs.ts';

// Rebuilds library/packs/index.json from *.manifest.json files and the payload each one points to.
//   node --experimental-strip-types scripts/packs.ts            print what would change (dry run)
//   node --experimental-strip-types scripts/packs.ts --write    write index.json
//   node --experimental-strip-types scripts/packs.ts --check    exit 1 when index.json is stale
const folder = 'library/packs';
const mode = process.argv.includes('--write') ? 'write' : process.argv.includes('--check') ? 'check' : 'dry-run';
const packs: PackManifest[] = [];
for (const file of (await readdir(folder)).filter(name => name.endsWith('.manifest.json')).sort()) {
  const draft = JSON.parse(await readFile(`${folder}/${file}`, 'utf8'));
  const payloadBytes = await readFile(`${folder}/${draft.payload.path}`);
  const manifest = validatePackManifest({ ...draft, payload: { ...draft.payload, sha256: createHash('sha256').update(payloadBytes).digest('hex'), bytes: payloadBytes.length } });
  validateProphetPayload(JSON.parse(payloadBytes.toString('utf8')), manifest);
  await readFile(manifest.license.noticePath);
  packs.push(manifest);
}
const index = validatePackIndex({ schemaVersion: 1, packs });
const next = JSON.stringify(index, null, 2) + '\n';
const current = await readFile(`${folder}/index.json`, 'utf8').catch(() => '');
const stale = current !== next;
for (const pack of packs) console.log(`${pack.id} ${pack.edition}: ${pack.itemCount} items, ${pack.payload.bytes} bytes, sha256 ${pack.payload.sha256.slice(0, 12)}…`);
if (mode === 'write') { if (stale) await writeFile(`${folder}/index.json`, next); console.log(stale ? 'index.json written' : 'index.json already current'); }
else if (stale) { console.log(`index.json is ${current ? 'stale' : 'missing'}${mode === 'check' ? '' : ' (dry run, nothing written)'}`); if (mode === 'check') process.exit(1); }
else console.log('index.json is current');
