import { createHash } from 'node:crypto';
import { validatePackIndex } from '../app/library/content-packs.ts';

const base = (process.argv[2] || '').replace(/\/?$/, '/');
if (!/^https?:\/\//.test(base)) {
  console.error('Usage: node --experimental-strip-types scripts/verify-deployment.ts <site url>');
  process.exit(2);
}
const attempts = Number(process.env.VERIFY_ATTEMPTS || 12);
const pause = Number(process.env.VERIFY_PAUSE_MS || 15000);

const required: { path: string; type: RegExp }[] = [
  { path: '', type: /text\/html/ },
  { path: 'app/', type: /text\/html/ },
  { path: 'app/app.js', type: /javascript/ },
  { path: 'app/app.css', type: /text\/css/ },
  { path: 'app/sw.js', type: /javascript/ },
  { path: 'sela-sw.js', type: /javascript/ },
  { path: 'dist/js/sela.esm.js', type: /javascript/ },
  { path: 'dist/js/sela.min.js', type: /javascript/ },
  { path: 'dist/css/sela.app.css', type: /text\/css/ },
  { path: 'offline-assets.json', type: /json/ },
  { path: 'library/packs/index.json', type: /json/ },
];

async function get(path: string): Promise<Response> {
  const response = await fetch(new URL(path, base), { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response;
}

async function verify(): Promise<string[]> {
  const problems: string[] = [];
  for (const { path, type } of required) {
    try {
      const response = await get(path);
      const kind = response.headers.get('content-type') || '';
      if (!type.test(kind)) problems.push(`${path} has content type "${kind}"`);
      await response.arrayBuffer();
    } catch (reason) { problems.push(String(reason instanceof Error ? reason.message : reason)); }
  }
  try {
    const index = validatePackIndex(await (await get('library/packs/index.json')).json());
    for (const pack of index.packs) {
      const bytes = new Uint8Array(await (await get(`library/packs/${pack.payload.path}`)).arrayBuffer());
      if (bytes.length !== pack.payload.bytes) problems.push(`${pack.id}: ${bytes.length} bytes served, ${pack.payload.bytes} listed`);
      else if (createHash('sha256').update(bytes).digest('hex') !== pack.payload.sha256) problems.push(`${pack.id}: checksum differs from the catalogue`);
      try { await get(pack.license.noticePath); } catch (reason) { problems.push(`${pack.id}: notice ${String(reason instanceof Error ? reason.message : reason)}`); }
    }
    console.log(`Checked ${index.packs.length} reading packs`);
  } catch (reason) { problems.push(`catalogue: ${String(reason instanceof Error ? reason.message : reason)}`); }
  return problems;
}

let problems: string[] = [];
for (let attempt = 1; attempt <= attempts; attempt++) {
  problems = await verify();
  if (!problems.length) { console.log(`Deployment at ${base} is healthy (attempt ${attempt})`); process.exit(0); }
  console.log(`Attempt ${attempt}/${attempts}: ${problems.length} problem(s), first: ${problems[0]}`);
  if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, pause));
}
console.error(`Deployment at ${base} is not healthy:\n- ${problems.join('\n- ')}`);
process.exit(1);
