import test from 'node:test';
import assert from 'node:assert/strict';
import { extractArchiveAsync } from '../../src/archive-client.ts';
import { zipSync } from 'fflate';

test('archive worker transfers a copy and releases resources on success, failure and cancellation', async t => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'Worker');
  t.after(() => { if (saved) Object.defineProperty(globalThis, 'Worker', saved); else Reflect.deleteProperty(globalThis, 'Worker'); });
  let instance: FakeWorker;
  class FakeWorker {
    onmessage?: (event: { data: unknown }) => void;
    onerror?: () => void;
    onmessageerror?: () => void;
    terminated = 0;
    transferred?: ArrayBuffer;
    constructor(url: URL, options: WorkerOptions) {
      assert.equal(url.pathname.endsWith('/sela.archive-worker.js'), true);
      assert.equal(options.type, 'module');
      instance = this;
    }
    postMessage(request: { bytes: ArrayBuffer }, transfer: ArrayBuffer[]) {
      assert.equal(request.bytes, transfer[0]);
      this.transferred = request.bytes;
    }
    terminate() { this.terminated++; }
  }
  Object.defineProperty(globalThis, 'Worker', { configurable: true, value: FakeWorker });
  const original = new Uint8Array([1, 2, 3]);
  const result = extractArchiveAsync(original);
  assert.notEqual(instance!.transferred, original.buffer);
  instance!.onmessage!({ data: { files: { 'a.txt': new Uint8Array([4]) } } });
  assert.equal((await result)['a.txt'][0], 4);
  assert.equal(instance!.terminated, 1);
  assert.deepEqual([...original], [1, 2, 3]);
  const invalid = extractArchiveAsync(original);
  instance!.onmessage!({ data: { error: 'Unsafe archive path' } });
  await assert.rejects(invalid, /Unsafe archive path/);
  assert.equal(instance!.terminated, 1);
  const controller = new AbortController();
  const cancelled = extractArchiveAsync(original, controller.signal);
  controller.abort();
  await assert.rejects(cancelled, { name: 'AbortError' });
  assert.equal(instance!.terminated, 1);
  const late = extractArchiveAsync(original);
  instance!.onerror!();
  await assert.rejects(late, /worker failed/);
  assert.equal(instance!.terminated, 1);
});

test('archive worker preflight rejects oversized and already aborted inputs', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(extractArchiveAsync(new Uint8Array(), controller.signal), { name: 'AbortError' });
  await assert.rejects(extractArchiveAsync(new Uint8Array(64 * 1048576 + 1)), /64 MiB/);
});

test('a blocked cross-origin worker releases its wrapper and only falls back for bounded inputs', async t => {
  const saved = ['Worker', 'location'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  t.after(() => { for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  } });
  let revoked = 0;
  t.mock.method(URL, 'createObjectURL', () => 'blob:archive-fixture');
  t.mock.method(URL, 'revokeObjectURL', () => revoked++);
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { origin: 'https://host.test' } });
  const failure = new DOMException('Blocked by CSP', 'SecurityError');
  Object.defineProperty(globalThis, 'Worker', { configurable: true, value: class {
    constructor(url: string) { assert.equal(url, 'blob:archive-fixture'); throw failure; }
  } });
  const files = await extractArchiveAsync(zipSync({ 'a.txt': new Uint8Array([7]) }));
  assert.equal(files['a.txt'][0], 7);
  assert.equal(revoked, 1);
  await assert.rejects(extractArchiveAsync(new Uint8Array(16 * 1048576 + 1)), error => error === failure);
  assert.equal(revoked, 2);
});
