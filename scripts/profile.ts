import { chromium } from '@playwright/test';

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';


const base = process.env.SELA_PROFILE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {});
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
const session = await page.context().newCDPSession(page);
await session.send('Performance.enable');
const faults: string[] = [];
page.on('pageerror', error => faults.push(error.message));
try {
  const start = performance.now();
  await page.goto(base + '/mobile/');
  await page.locator('#mobile-app[data-ready="true"]').waitFor();
  const appReadyMs = performance.now() - start;
  await page.goto(base + '/?geo=off');
  await page.evaluate(async () => { await SelaReady; });
  await session.send('HeapProfiler.collectGarbage');
  const baseline = await session.send('Performance.getMetrics');
  const documents = [];
  for (const [format, url] of [
    ['pdf', '/example/yang-tidak-ikut-pulang.pdf'],
    ['epub', '/example/yang-tidak-ikut-pulang.epub'],
    ['cbz', '/example/yang-tidak-ikut-pulang.cbz'],
  ] as const) {
    const cycles = await page.evaluate(async ({ format, url }) => {
      const result: Array<{ readyMs: number; longTasks: number; longTaskMs: number; peakCanvasPixels: number; maxFrameMs: number }> = [];
      const records: PerformanceEntry[] = [];
      const observer = PerformanceObserver.supportedEntryTypes.includes('longtask') ?
        new PerformanceObserver(list => records.push(...list.getEntries())) : undefined;
      observer?.observe({ type: 'longtask', buffered: false });
      try {
        for (let cycle = 0; cycle < 5; cycle++) {
          const start = performance.now();
          let peakCanvasPixels = 0, maxFrameMs = 0, lastFrame = 0, frame = 0;
          const sample = (time: number) => {
            if (lastFrame) maxFrameMs = Math.max(maxFrameMs, time - lastFrame);
            lastFrame = time;
            peakCanvasPixels = Math.max(peakCanvasPixels,
              [...document.querySelectorAll<HTMLCanvasElement>('.library-reader-overlay canvas')]
                .reduce((sum, canvas) => sum + canvas.width * canvas.height, 0));
            frame = requestAnimationFrame(sample);
          };
          frame = requestAnimationFrame(sample);
          const viewer = new Sela({ url, format, mode: 'single', duration: 0, persistPreferences: false });
          try {
            await viewer.open();
            const readyMs = performance.now() - start;
            viewer.goTo(Math.min(3, viewer.totalPages));
            await new Promise(resolve => setTimeout(resolve, 250));
            records.push(...(observer?.takeRecords() || []));
            const tasks = records.filter(entry => entry.startTime >= start);
            result.push({ readyMs, longTasks: tasks.length, longTaskMs: tasks.reduce((sum, task) => sum + task.duration, 0), peakCanvasPixels, maxFrameMs });
          } finally { cancelAnimationFrame(frame); viewer.destroy(); }
          await new Promise(resolve => setTimeout(resolve, 100));
          if (document.querySelector('.library-reader-overlay')) throw Error('Reader overlay survived destruction');
        }
      } finally { observer?.disconnect(); }
      return result;
    }, { format, url });
    documents.push({ format, cycles, remainingWorkers: page.workers().length });
  }
  // Force GC only for the retained-heap comparison; timings above use normal GC.
  await session.send('HeapProfiler.collectGarbage');
  const retained = await session.send('Performance.getMetrics');
  // A second pass uses already loaded format modules so module warming is not
  // mistaken for document retention. Both heap samples use the same forced GC.
  await page.evaluate(async () => {
    for (const format of ['pdf', 'epub', 'cbz'] as const) {
      for (let cycle = 0; cycle < 2; cycle++) {
        const viewer = new Sela({ url: '/example/yang-tidak-ikut-pulang.' + format, format, mode: 'single', duration: 0 });
        try { await viewer.open(); await new Promise(resolve => setTimeout(resolve, 100)); }
        finally { viewer.destroy(); }
      }
    }
  });
  await session.send('HeapProfiler.collectGarbage');
  const replay = await session.send('Performance.getMetrics');
  const metric = (data: { metrics: Array<{ name: string; value: number }> }, name: string) => data.metrics.find(item => item.name === name)?.value;
  const report = {
    timestamp: new Date().toISOString(), browser: browser.version(), node: process.version,
    viewport: { width: 393, height: 852 }, appReadyMs, documents, faults,
    heap: { baselineBytes: metric(baseline, 'JSHeapUsedSize'), afterGcBytes: metric(retained, 'JSHeapUsedSize'), warmReplayBytes: metric(replay, 'JSHeapUsedSize') },
    boundary: 'Desktop browser at phone viewport; local fixture documents; no CPU throttling; timings are observations, not POCO/iOS or battery certification.',
  };
  await mkdir('.build/profiles', { recursive: true });
  const path = resolve('.build/profiles/latest.json');
  await writeFile(path, JSON.stringify(report, null, 2) + '\n');
  console.log(path);
  if (faults.length || documents.some(document => document.remainingWorkers)) throw Error('Lifecycle profile found remaining workers or browser errors');
} finally { await browser.close(); }
