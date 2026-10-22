import { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { Bookmark } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';
import { isSavedReadings, toggleSavedReadings } from './readings-state.ts';

export default function SaveButton({ packId, itemId }: { packId: string; itemId: string }) {
  const { lang } = useWorkspace();
  const [saved, setSaved] = useState(() => isSavedReadings(packId, itemId));
  useEffect(() => setSaved(isSavedReadings(packId, itemId)), [packId, itemId]);
  return <Button className="readings-save" variant={saved ? 'light' : 'default'} aria-pressed={saved} leftSection={<Bookmark size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />} onClick={() => setSaved(toggleSavedReadings(packId, itemId))}>
    {saved ? copy(lang, 'Saved', 'Tersimpan') : copy(lang, 'Save', 'Simpan')}
  </Button>;
}
