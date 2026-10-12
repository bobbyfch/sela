import React, { memo, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal, flushSync } from 'react-dom';
import {TabIcon} from '../../ui/icons.tsx';
import { ReaderShell } from '../../ui/pages/reader.tsx';
import type { AppTab, NavigationMount } from './navigation.ts';

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
    {tabs.map(([id, en, ind, path], index) => <button key={id} type="button" data-tab={id}
      aria-current={id === tab} aria-label={mount.translate(en, ind)}
      onClick={() => mount.navigate(id)} onKeyDown={event => {
        const directions = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
        if (!directions.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + tabs.length) % tabs.length;
        mount.nav.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
      }}><TabIcon name={id} />
      <small>{mount.translate(en, ind)}</small></button>)}
  </>, mount.nav);
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
  return <><Shell />{navigation && <Navigation mount={navigation} />}</>;
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
