import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/newsreader';
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/spotlight/styles.css';
import 'dayjs/locale/id';
import './app.css';
import { SelaApp } from './app.tsx';

const host = document.getElementById('sela-root');
const mountApp = () => { if (host) createRoot(host).render(<React.StrictMode><SelaApp /></React.StrictMode>); };

if (host && typeof window.ResizeObserver === 'undefined') {
  void import('@juggle/resize-observer').then(({ ResizeObserver }) => {
    window.ResizeObserver = ResizeObserver;
    mountApp();
  }).catch(error => {
    console.error('Sela could not load its ResizeObserver fallback.', error);
  });
} else mountApp();
