import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';

const target = process.argv[2] || 'pages-site';
const rootFiles = ['index.html', 'logo.svg', 'favicon.svg', 'favicon.png', 'robots.txt', 'sitemap.xml', 'llms.txt', 'manifest.webmanifest', 'sela-sw.js', 'offline-assets.json', 'README.md', 'README.id.md', 'THIRD_PARTY_NOTICES.md'];
const rootFolders = ['site', 'dist', 'example', 'library', 'docs', 'licenses'];
const appFiles = (await readdir('app')).filter(name => name === 'index.html' || name === 'app.css' || /\.(js|webmanifest)$/.test(name) || /-LICENSE\.txt$/.test(name));
const appFolders = ['assets', 'chunks'];

await rm(target, { recursive: true, force: true });
await mkdir(`${target}/app`, { recursive: true });
for (const file of rootFiles) await cp(file, `${target}/${file}`);
for (const folder of rootFolders) await cp(folder, `${target}/${folder}`, { recursive: true });
for (const file of appFiles) await cp(`app/${file}`, `${target}/app/${file}`);
for (const folder of appFolders) await cp(`app/${folder}`, `${target}/app/${folder}`, { recursive: true });
await writeFile(`${target}/.nojekyll`, '');
console.log(`Packaged ${rootFiles.length} files, ${rootFolders.length + appFolders.length} folders and ${appFiles.length} app files into ${target}`);
