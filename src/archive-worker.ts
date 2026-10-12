/// <reference lib="webworker" />
import { decodeArchive } from './archive-codec.ts';
import type { ArchiveReply, ArchiveRequest } from './archive-client.ts';

declare const self: DedicatedWorkerGlobalScope;
const scope = self;
scope.onmessage = (event: MessageEvent<ArchiveRequest>) => {
  try {
    const files = decodeArchive(new Uint8Array(event.data.bytes), event.data.backup);
    const reply: ArchiveReply = { files };
    scope.postMessage(reply, Object.values(files).map(bytes => bytes.buffer));
  } catch (error) {
    const reply: ArchiveReply = { error: error instanceof Error ? error.message : 'Archive extraction failed' };
    scope.postMessage(reply);
  }
};
