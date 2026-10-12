// Generated from app/library/reader-history.ts by npm run build. Do not edit.
let pendingBack = Promise.resolve();
let sequence = 0;
export async function bindReaderHistory(viewer) {
  await pendingBack;
  if (!viewer.overlay) return;
  const marker = "sela-reader-" + ++sequence;
  const state = history.state && typeof history.state === "object" ? history.state : {};
  history.pushState({ ...state, selaReader: marker }, "", location.href);
  const lifetime = new AbortController();
  let disposed = false;
  let offClose;
  let offDestroy;
  const release = () => {
    if (disposed) return;
    disposed = true;
    lifetime.abort();
    offClose();
    offDestroy();
    if (history.state?.selaReader !== marker) return;
    pendingBack = new Promise((resolve) => {
      let timer;
      const done = () => {
        clearTimeout(timer);
        window.removeEventListener("popstate", done);
        resolve();
      };
      window.addEventListener("popstate", done, { once: true });
      timer = setTimeout(done, 500);
      history.back();
    });
  };
  offClose = viewer.on("close", release);
  offDestroy = viewer.on("destroyed", release);
  window.addEventListener("popstate", (event) => {
    if (event.state?.selaReader !== marker) viewer.close();
  }, { signal: lifetime.signal });
}
