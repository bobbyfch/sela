import { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { Bookmark } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';
import { isTamanSaved, toggleTamanSaved } from './taman-state.ts';

/** Save or unsave one entry. The saved list is in the personal store, so backups include it. */
export default function SaveButton({ packId, itemId }: { packId: string; itemId: string }) {
  const { lang } = useWorkspace();
  const [saved, setSaved] = useState(() => isTamanSaved(packId, itemId));
  useEffect(() => setSaved(isTamanSaved(packId, itemId)), [packId, itemId]);
  return <Button className="taman-save" variant={saved ? 'light' : 'default'} aria-pressed={saved} leftSection={<Bookmark size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />} onClick={() => setSaved(toggleTamanSaved(packId, itemId))}>
    {saved ? copy(lang, 'Saved', 'Tersimpan') : copy(lang, 'Save', 'Simpan')}
  </Button>;
}
