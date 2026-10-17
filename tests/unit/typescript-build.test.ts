import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import ts from 'typescript-api';

async function files(folder: string): Promise<string[]> {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(folder + '/' + entry.name) : [folder + '/' + entry.name]))).flat();
}

test('authored code uses TypeScript and browser assets resolve without TypeScript imports', async () => {
  for (const folder of ['src', 'app', 'ui', 'web', 'scripts', 'tests']) {
    for (const file of (await files(folder)).filter(file => /\.(?:js|mjs)$/.test(file))) {
      const code = await readFile(file, 'utf8');
      assert.match(code, /^\/\/ Generated from .*\.tsx? by npm run build\. Do not edit\./, file + ' must be generated from TypeScript');
    }
  }
  const runtime = [...await files('library'), ...await files('mobile'), ...await files('site'), ...await files('dist/source'), 'examples/web-component.js'].filter(file => file.endsWith('.js'));
  for (const file of runtime) {
    const code = await readFile(file, 'utf8');
    assert.match(code, /^\/\/ Generated from .*\.tsx? by npm run build\. Do not edit\./, file);
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const imports: string[] = [];
    const visit = (node: ts.Node) => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) imports.push(node.arguments[0].text);
      ts.forEachChild(node, visit);
    };
    visit(source);
    for (const specifier of imports) {
      assert(!/\.tsx?(?:[?#]|$)/.test(specifier), file + ' leaked a TypeScript URL');
      if (specifier.startsWith('.')) await access(resolve(dirname(file), specifier));
    }
  }
});

test('offline manifests contain runtime assets and never TypeScript sources', async () => {
  const manifest: {allowed: string[]; shell: string[]; mobileShell: string[]} = JSON.parse(await readFile('offline-assets.json', 'utf8'));
  for (const path of [...manifest.allowed, ...manifest.shell, ...manifest.mobileShell]) {
    assert(!/\.tsx?(?:[?#]|$)/.test(path), 'Offline cache contains TypeScript source: ' + path);
    await access(path.split('?')[0]);
  }
  assert(manifest.mobileShell.includes('mobile/app.js'));
  assert(manifest.mobileShell.includes('app/app.js'));
  assert(manifest.mobileShell.includes('app/index.html'));
  assert(manifest.mobileShell.includes('dist/js/sela.esm.js'));
  assert(manifest.mobileShell.includes('library/assets/jculture-isometric.webp'), 'Offline cache omits the Home companion atlas');
});
