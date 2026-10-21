import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const types = { '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.pdf': 'application/pdf', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.wasm':'application/wasm', '.mp3': 'audio/mpeg', '.bcmap': 'application/octet-stream', '.pfb': 'application/octet-stream', '.ttf': 'font/ttf' };
createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    // Mirror the GitHub Pages project prefix locally so browser tests exercise /sela/ asset URLs.
    if (pathname === '/sela') pathname = '/';
    else if (pathname.startsWith('/sela/')) pathname = pathname.slice('/sela'.length);
    const path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Sela playground: http://127.0.0.1:4173'));
