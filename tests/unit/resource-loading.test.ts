import test from 'node:test';
import assert from 'node:assert/strict';
import { readBytes } from '../../src/bytes.ts';
import { createPdfTask } from '../../src/pdf-loader.ts';

test('byte sources preserve typed-array slices, ownership and cancellation', async () => {
  const source = new Uint8Array([0, 1, 2, 3]).subarray(1, 3);
  const bytes = await readBytes({ data: source });
  assert.deepEqual([...bytes], [1, 2]);
  bytes[0] = 9;
  assert.equal(source[0], 1);
  assert.deepEqual([...await readBytes({ data: source.slice().buffer })], [1, 2]);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(readBytes({ data: source }, abort.signal), { name: 'AbortError' });
  await assert.rejects(readBytes({ data: new Uint8Array(64 * 1024 * 1024 + 1) }), /64 MiB/);
  await assert.rejects(readBytes({}), /URL or data/);
});

test('rejected HTTP responses cancel their body and preserve the rejection', async t => {
  for (const [status, length, message] of [[403, null, /HTTP 403/], [200, '67108865', /archive limit/]] as [number, string | null, RegExp][]) {
    let cancelled = 0;
    t.mock.method(globalThis, 'fetch', async () => ({
      ok: status === 200, status, headers: new Headers(length ? { 'content-length': length } : {}),
      body: { cancel: async () => { cancelled++; throw new Error('cancel failed'); } }
    }));
    await assert.rejects(readBytes({ url: '/book' }), message);
    assert.equal(cancelled, 1);
    t.mock.restoreAll();
  }
});

test('stream success and failure release locks; cancellation cannot hide read errors', async t => {
  let request;
  for (const failure of [false, true]) {
    let released = 0, cancelled = 0, reads = 0;
    const original = new Error('network interrupted');
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      request = options;
      return { ok: true, headers: new Headers(), body: { getReader: () => ({
        read: async () => { if (failure) throw original; return reads++ ? { done: true } : { done: false, value: new Uint8Array([7, 8]) }; },
        cancel: async () => { cancelled++; throw new Error('cancel failed'); },
        releaseLock: () => { released++; }
      }) } };
    });
    const promise = readBytes({ url: '/private', httpHeaders: { Authorization: 'fixture' }, withCredentials: true });
    if (failure) await assert.rejects(promise, error => error === original);
    else assert.deepEqual([...await promise], [7, 8]);
    assert.equal(released, 1); assert.equal(cancelled, Number(failure));
    assert.equal(request.credentials, 'include'); assert.equal(request.headers.Authorization, 'fixture');
    t.mock.restoreAll();
  }
});

test('unadvertised oversized streams cancel and release their lock', async t => {
  let cancelled = 0, released = 0;
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, headers: new Headers(), body: { getReader: () => ({
    read: async () => ({ done: false, value: new Uint8Array(64 * 1024 * 1024 + 1) }),
    cancel: async () => { cancelled++; }, releaseLock: () => { released++; }
  }) } }));
  await assert.rejects(readBytes({ url: '/unbounded' }), /archive limit/);
  assert.equal(cancelled, 1); assert.equal(released, 1);
});

test('PDF initialization failures and destroy release worker resources exactly once', async t => {
  const saved = ['window', 'Worker'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as [string, PropertyDescriptor | undefined]);
  t.after(() => { for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  for (const stage of ['port', 'worker', 'document', 'destroy', 'worker-destroy', 'success']) {
    const counts = { revoked: 0, terminated: 0, worker: 0, task: 0 };
    const original = new Error(stage);
    (globalThis as any).window = { location: { origin: 'https://host.test' } };
    t.mock.method(URL, 'createObjectURL', () => 'blob:fixture');
    t.mock.method(URL, 'revokeObjectURL', () => counts.revoked++);
    (globalThis as any).Worker = class {
      constructor() { if (stage === 'port') throw original; }
      terminate() { counts.terminated++; }
    };
    const lib = {
      workerUrl: 'https://cdn.test/worker.mjs',
      PDFWorker: class {
        constructor() { if (stage === 'worker') throw original; }
        destroy() { counts.worker++; if (stage === 'worker-destroy') throw original; }
      },
      getDocument() {
        if (stage === 'document') throw original;
        return { promise: Promise.resolve(), destroy: async () => { counts.task++; if (stage === 'destroy') throw original; } };
      }
    };
    if (['port', 'worker', 'document'].includes(stage)) assert.throws(() => createPdfTask(lib, {}), error => error === original);
    else {
      const task = createPdfTask(lib, {});
      if (['destroy', 'worker-destroy'].includes(stage)) await assert.rejects(task.destroy(), error => error === original);
      else await task.destroy();
      await task.destroy();
      assert.equal(counts.task, 1);
    }
    assert.equal(counts.revoked, 1);
    assert.equal(counts.terminated, stage === 'port' ? 0 : 1);
    assert.equal(counts.worker, ['port', 'worker'].includes(stage) ? 0 : 1);
    t.mock.restoreAll();
  }
});
