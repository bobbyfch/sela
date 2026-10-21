export type FocusTimerState = { minutes: number; remaining: number; deadline: number; bookId: string };
const key = 'sela-library:focus-timer:v1';
const listeners = new Set<() => void>();
const initial: FocusTimerState = { minutes: 15, remaining: 900, deadline: 0, bookId: '' };
function readState(): FocusTimerState {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value && [15, 25, 45].includes(value.minutes) && Number.isFinite(value.remaining) && Number.isFinite(value.deadline) && typeof value.bookId === 'string') return { minutes: value.minutes, remaining: Math.max(0, Math.min(value.minutes * 60, Math.round(value.remaining))), deadline: Math.max(0, value.deadline), bookId: value.bookId };
  } catch { /* A private browsing session can still use the in-memory timer. */ }
  return { ...initial };
}
let state = readState();
let interval: number | undefined;
const emit = () => listeners.forEach(listener => listener());
const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Timer state remains in memory. */ } emit(); };
function updateRemaining() {
  if (!state.deadline) return;
  state = { ...state, remaining: Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000)) };
  if (!state.remaining) { state.deadline = 0; window.clearInterval(interval); interval = undefined; }
  save();
}
function startTicker() { if (interval === undefined && state.deadline) interval = window.setInterval(updateRemaining, 1000); }
if (state.deadline) { state.remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000)); if (state.remaining) startTicker(); else state.deadline = 0; }
window.addEventListener('pagehide', () => { if (state.deadline) state.remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000)); try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Keep the running timer even if persistence is unavailable. */ } });

export const getFocusTimer = () => state;
export function subscribeFocusTimer(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
export function chooseFocusDuration(minutes: number) {
  if (![15, 25, 45].includes(minutes) || state.deadline) return;
  state = { ...state, minutes, remaining: minutes * 60 }; save();
}
export function chooseFocusBook(bookId: string) { state = { ...state, bookId: bookId.slice(0, 80) }; save(); }
export function toggleFocusTimer() {
  if (state.deadline) { updateRemaining(); state = { ...state, deadline: 0 }; window.clearInterval(interval); interval = undefined; save(); return; }
  if (!state.remaining) state = { ...state, remaining: state.minutes * 60 };
  state = { ...state, deadline: Date.now() + state.remaining * 1000 }; save(); startTicker();
}
export function resetFocusTimer() { window.clearInterval(interval); interval = undefined; state = { ...state, remaining: state.minutes * 60, deadline: 0 }; save(); }
