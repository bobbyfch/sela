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
    for (const file of (await files(folder)).filter(file => /\.(?:js|mjs)$/.test(file) && !/^app\/(?:app\.js|assets\/|chunks\/)/.test(file))) {
      const code = await readFile(file, 'utf8');
      assert.match(code, /^\/\/ Generated from .*\.tsx? by npm run build\. Do not edit\./, file + ' must be generated from TypeScript');
    }
  }
  const runtime = [...await files('library'), ...(await files('app')).filter(file => !/^app\/(?:app\.js|assets\/|chunks\/)/.test(file)), ...await files('site'), ...await files('dist/source'), 'examples/web-component.js'].filter(file => file.endsWith('.js'));
  for (const file of runtime) {
    const code = await readFile(file, 'utf8');
    assert.match(code, /^\/\/ Generated from (?:.*\.tsx?|npm dependency .+@\d+\.\d+\.\d+) by npm run build\. Do not edit\./, file);
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
  const manifest: {allowed: string[]; shell: string[]; appShell: string[]; mobileShell?: string[]} = JSON.parse(await readFile('offline-assets.json', 'utf8'));
  for (const path of [...manifest.allowed, ...manifest.shell, ...manifest.appShell]) {
    assert(!/\.tsx?(?:[?#]|$)/.test(path), 'Offline cache contains TypeScript source: ' + path);
    await access(path.split('?')[0]);
  }
  assert(manifest.appShell.includes('app/app.js'));
  assert(manifest.appShell.includes('app/index.html'));
  assert(manifest.appShell.includes('dist/js/sela.esm.js'));
  assert(manifest.appShell.includes('site/art/selabooks-paper-still-life.webp'), 'Offline cache omits the app artwork');
  assert.equal(manifest.mobileShell, undefined, 'retired mobile cache list must not return');
});
