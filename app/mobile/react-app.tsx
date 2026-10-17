import React, { memo, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal, flushSync } from 'react-dom';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import {TabIcon} from '../../ui/icons.tsx';
import { Button } from '../../ui/components/ui/button.tsx';
import { DialogOverlay } from '../../ui/components/ui/dialog.tsx';
import { ReaderShell } from '../../ui/pages/reader.tsx';
import type { AppTab, NavigationMount } from './navigation.ts';

type ControlSheet = { dialog: HTMLDialogElement; open: boolean };
type ControlSheetEvent = { action: 'register' | 'state' | 'unregister'; dialog: HTMLDialogElement; open?: boolean };
const controlSheetEntries = new Map<HTMLDialogElement, ControlSheet>();
const controlSheetListeners = new Set<() => void>();
let controlSheetSnapshot: ControlSheet[] = [];
const getControlSheetSnapshot = () => controlSheetSnapshot;
const subscribeToControlSheets = (listener: () => void) => {
  controlSheetListeners.add(listener);
  return () => controlSheetListeners.delete(listener);
};
document.addEventListener('sela:control-sheet', event => {
  const detail = (event as CustomEvent<ControlSheetEvent>).detail;
  if (detail.action === 'register') controlSheetEntries.set(detail.dialog, { dialog: detail.dialog, open: false });
  else if (detail.action === 'unregister') controlSheetEntries.delete(detail.dialog);
  else {
    const current = controlSheetEntries.get(detail.dialog);
    if (current) controlSheetEntries.set(detail.dialog, { ...current, open: !!detail.open });
  }
  controlSheetSnapshot = [...controlSheetEntries.values()];
  controlSheetListeners.forEach(listener => listener());
});

const Shell = memo(ReaderShell);
const tabs = [
  ['home', 'Home', 'Beranda', 'm3 11 9-8 9 8v10H3Zm6 10v-8h6v8'],
  ['library', 'Shelf', 'Rak', 'M4 3v18m5-18v18m5-18v18m4-17 3 16M2 21h20'],
  ['browse', 'Explore', 'Jelajah', 'M3 4h7a3 3 0 0 1 3 3v14a5 5 0 0 0-5-2H3Zm18 0h-5a3 3 0 0 0-3 3v14a5 5 0 0 1 5-2h3Z'],
  ['settings', 'Settings', 'Pengaturan', 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6'],
] as const;

function Navigation({ mount }: { mount: NavigationMount }) {
  const [tab, setTab] = useState<AppTab>('home');
  const [, localize] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener('sela:navigation-change', e => setTab(e.detail), { signal: controller.signal });
    document.addEventListener('sela:navigation-localize', () => localize(n => n + 1), { signal: controller.signal });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    mount.nav.classList.add('glass-navigation');
    mount.nav.style.setProperty('--nav-count', String(tabs.length));
    mount.nav.style.setProperty('--nav-index', String(tabs.findIndex(([id]) => id === tab)));
  }, [mount, tab]);
  return createPortal(<>
    <span className="glass-navigation-indicator" aria-hidden="true" />
    {tabs.map(([id, en, ind], index) => <Button variant="ghost" size="default" className="tw:relative tw:z-[1] tw:flex tw:h-auto tw:min-h-14 tw:flex-1 tw:flex-col tw:items-center tw:justify-center tw:gap-1 tw:rounded-[26px] tw:border-transparent tw:bg-transparent tw:px-1.5 tw:py-1 tw:text-inherit tw:shadow-none tw:hover:bg-white/10 tw:hover:text-inherit tw:aria-current:bg-white/15 tw:aria-current:text-inherit" key={id} type="button" data-tab={id}
      aria-current={id === tab} aria-label={mount.translate(en, ind)}
      onClick={() => mount.navigate(id)} onKeyDown={event => {
        const directions = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
        if (!directions.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + tabs.length) % tabs.length;
        mount.nav.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
      }}><TabIcon name={id} />
      <small>{mount.translate(en, ind)}</small></Button>)}
  </>, mount.nav);
}

function ControlSheetHost() {
  const sheets = useSyncExternalStore(subscribeToControlSheets, getControlSheetSnapshot, getControlSheetSnapshot);
  return <>{sheets.map(sheet => <ControlSheetPortal key={sheet.dialog.id} sheet={sheet} />)}</>;
}

function ControlSheetPortal({ sheet }: { sheet: ControlSheet }) {
  const attachDialog = React.useCallback((target: HTMLDivElement | null) => {
    if (target) target.append(sheet.dialog);
    else if (sheet.dialog.dataset.controlSheetDestroyed === 'true') sheet.dialog.remove();
    else document.body.append(sheet.dialog);
  }, [sheet.dialog]);
  const title = sheet.dialog.querySelector('h2')?.textContent?.trim() || 'Sela';
  return <DialogPrimitive.Root
    open={sheet.open}
    modal
    disablePointerDismissal
    onOpenChange={open => { if (!open && sheet.open) sheet.dialog.close(); }}
  >
    <DialogPrimitive.Portal>
      <DialogOverlay style={{ background: '#17171178', backdropFilter: 'blur(5px)' }} />
      <DialogPrimitive.Popup aria-label={title} className="tw:contents">
        <div className="tw:contents" ref={attachDialog} />
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

function App() {
  const [navigation, setNavigation] = useState<NavigationMount | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener('sela:navigation-mount', event => {
      flushSync(() => setNavigation(event.detail));
    }, { signal: controller.signal });
    return () => controller.abort();
  }, []);
  // Shell markup is stable. Native document/storage controllers own its content;
  // React owns navigation state and never reconciles the controller-owned subtree.
  return <><Shell />{navigation && <Navigation mount={navigation} />}<ControlSheetHost /></>;
}

async function start() {
  if (!window.SelaPlatform.modern) return;
  const legacy = document.getElementById('legacy-mobile')!;
  try {
    legacy.hidden = true;
    const root = createRoot(document.getElementById('react-shell')!);
    flushSync(() => root.render(<App />));
    const sdk = await import(/* @vite-ignore */ new URL(/* @vite-ignore */ '../dist/js/sela.esm.js',import.meta.url).href);
    window.Sela = sdk.default || sdk.Sela;
    await import(/* @vite-ignore */ new URL(/* @vite-ignore */ '../library/updates.js',import.meta.url).href);
    const library = await import(/* @vite-ignore */ new URL(/* @vite-ignore */ '../library/library.js',import.meta.url).href);
    await library.libraryReady;
    await import(/* @vite-ignore */ new URL(/* @vite-ignore */ './pwa.js',import.meta.url).href);
    const shell = document.getElementById('mobile-app')!;
    shell.hidden = false;
    shell.dataset.ready = 'true';
  } catch (error) {
    console.error('Sela app initialization failed', error);
    const shell = document.getElementById('mobile-app');
    if (shell) shell.hidden = true;
    legacy.hidden = false;
    const notice = document.getElementById('device-notice')!;
    notice.hidden = false;
    notice.textContent = 'Bookshelf could not initialize local storage. Keep your original files. / Rak belum dapat membuka penyimpanan lokal. Simpan berkas asli.';
  }
}
void start();
