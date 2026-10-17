// Generated from app/library/reading-tracker.ts by npm run build. Do not edit.
import { editPersonal } from "./personal-store.js";
let stopActive;
export function startAutomaticReadingTracker(book) {
  stopActive?.();
  if (!/^[a-f0-9]{64}$/.test(book)) return () => {
  };
  let last = performance.now(), pending = 0, stopped = false;
  const persist = () => {
    const seconds = Math.floor(pending);
    if (seconds < 5) return;
    pending -= seconds;
    editPersonal((data) => {
      data.sessions.push({ book, at: Date.now(), seconds });
      data.sessions = data.sessions.slice(-2e3);
    });
  };
  const tick = () => {
    const now = performance.now();
    if (!document.hidden) pending += Math.min(3, Math.max(0, (now - last) / 1e3));
    last = now;
    if (pending >= 30) persist();
  };
  const visibility = () => {
    tick();
    last = performance.now();
  };
  const timer = window.setInterval(tick, 1e3);
  document.addEventListener("visibilitychange", visibility);
  const stop = () => {
    if (stopped) return;
    tick();
    stopped = true;
    clearInterval(timer);
    document.removeEventListener("visibilitychange", visibility);
    persist();
    if (stopActive === stop) stopActive = void 0;
  };
  stopActive = stop;
  window.addEventListener("pagehide", stop, { once: true });
  return stop;
}
