import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTransferPin, decryptBackupForTransfer, encryptBackupForTransfer } from '../../app/library/transfer.ts';

test('PIN transfers encrypt and restore an archive, and reject wrong PINs or modified data', async () => {
  const pin = createTransferPin();
  assert.match(pin, /^\d{12}$/);
  const archive = new Blob(['Sela test archive'], { type: 'application/zip' });
  const encrypted = await encryptBackupForTransfer(archive, pin);
  const transfer = new File([encrypted], 'sela-test.sela-transfer');
  const restored = await decryptBackupForTransfer(transfer, pin);
  assert.equal(await restored.text(), 'Sela test archive');
  await assert.rejects(() => decryptBackupForTransfer(transfer, '000000000000'));
  const corrupted = new Uint8Array(await transfer.arrayBuffer());
  corrupted[corrupted.length - 1] ^= 1;
  await assert.rejects(() => decryptBackupForTransfer(new File([corrupted], transfer.name), pin));
});
