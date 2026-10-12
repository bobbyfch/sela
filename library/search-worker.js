// Generated from app/library/search-worker.ts by npm run build. Do not edit.
let index = /* @__PURE__ */ new Map(), bytes = 0;
self.onmessage = (event) => {
  const { id, pages, query } = event.data;
  if (typeof id !== "string" || typeof query !== "string") return;
  if (Array.isArray(pages)) {
    const bounded = [];
    let used = 0;
    for (const p of pages.slice(0, 500)) {
      if (typeof p !== "string") continue;
      const text = p.slice(0, 1e6 - used);
      bounded.push(text);
      used += text.length;
      if (used >= 1e6) break;
    }
    if (index.has(id)) bytes -= index.get(id).reduce((n, p) => n + p.length, 0);
    while (bytes + used > 16 * 1048576 && index.size) {
      const oldest = index.keys().next().value;
      bytes -= index.get(oldest).reduce((n, p) => n + p.length, 0);
      index.delete(oldest);
    }
    index.set(id, bounded);
    bytes += used;
  }
  const needle = query.slice(0, 200).trim().toLowerCase();
  let page = 0, snippet = "";
  if (needle) for (const [i, text] of (index.get(id) || []).entries()) {
    const at = text.toLowerCase().indexOf(needle);
    if (at >= 0) {
      page = i + 1;
      snippet = text.slice(Math.max(0, at - 90), Math.min(text.length, at + needle.length + 180));
      break;
    }
  }
  self.postMessage({ found: page > 0, page, snippet, cached: !!index.has(id) });
};
