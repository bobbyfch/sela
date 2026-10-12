// Generated from app/library/opds.ts by npm run build. Do not edit.
const types = { "application/epub+zip": "epub", "application/pdf": "pdf", "application/x-cbz": "cbz", "application/vnd.comicbook+zip": "cbz", "text/plain": "txt", "text/html": "html", "application/x-fictionbook+xml": "fb2" };
function safe(value2, base) {
  if (typeof value2 !== "string" || !value2) return null;
  try {
    const url = new URL(value2, base);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
const value = (parent, name) => parent.getElementsByTagNameNS("*", name)[0]?.textContent?.trim() || "";
export async function opdsBooks(url, { signal, query = "", headers = {} } = {}) {
  url = safe(url);
  if (!url) throw Error("Use an HTTPS catalog URL without credentials.");
  const response = await fetch(url, { signal, headers, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw Error("Catalog unavailable (" + response.status + ").");
  if (Number(response.headers.get("content-length")) > 2 * 1048576) throw Error("Catalog exceeds 2 MiB.");
  let body;
  if (response.body?.getReader) {
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let size = 0;
    body = "";
    try {
      for (; ; ) {
        const { done, value: value2 } = await reader.read();
        if (done) break;
        if ((size += value2.byteLength) > 2 * 1048576) throw Error("Catalog exceeds 2 MiB.");
        body += decoder.decode(value2, { stream: true });
      }
      body += decoder.decode();
    } catch (e) {
      await reader.cancel().catch(() => {
      });
      throw e;
    } finally {
      reader.releaseLock();
    }
  } else {
    body = await response.text();
    if (body.length > 2 * 1048576) throw Error("Catalog exceeds 2 MiB.");
  }
  let books = [], next;
  const relation = (link, rel) => [].concat(link.rel || []).includes(rel);
  const acquisition = (links) => links?.find((link) => types[link.type] && [].concat(link.rel || []).some((rel) => ["http://opds-spec.org/acquisition", "http://opds-spec.org/acquisition/open-access"].includes(rel)) && safe(link.href, url));
  if (body.trimStart().startsWith("{")) {
    const feed = JSON.parse(body);
    if (!feed.metadata && !feed.publications && !feed.navigation) throw Error("Not an OPDS catalog.");
    for (const publication of (feed.publications || []).slice(0, 100)) {
      const link = acquisition(publication.links);
      if (!link) continue;
      const meta = publication.metadata || {};
      books.push({ id: meta.identifier || link.href, title: String(meta.title || "Untitled"), author: [].concat(meta.author || []).map((a) => typeof a === "string" ? a : a.name || "").join(", "), description: meta.description || "", language: [].concat(meta.language || [])[0] || "", year: String(meta.published || "").slice(0, 4), format: types[link.type], url: safe(link.href, url), genre: "OPDS", rights: String(meta.rights || ""), source: "opds" });
    }
    for (const nav of (feed.navigation || []).slice(0, 32)) {
      const href = safe(nav.href, url);
      if (href) books.push({ id: href, title: String(nav.title || "Collection"), genre: "OPDS", author: "", navigation: href, source: "opds" });
    }
    next = safe(feed.links?.find((link) => relation(link, "next"))?.href, url);
  } else {
    const feed = new DOMParser().parseFromString(body, "application/xml");
    if (feed.querySelector("parsererror") || feed.documentElement.localName !== "feed") throw Error("Not an OPDS catalog.");
    for (const entry of [...feed.getElementsByTagNameNS("*", "entry")].slice(0, 100)) {
      const links = [...entry.getElementsByTagNameNS("*", "link")].map((link3) => ({ href: link3.getAttribute("href"), rel: link3.getAttribute("rel"), type: link3.getAttribute("type") }));
      const link2 = acquisition(links), title = value(entry, "title"), author = value(entry, "name");
      if (link2) books.push({ id: value(entry, "id") || link2.href, title, author, format: types[link2.type], url: safe(link2.href, url), genre: "OPDS", rights: value(entry, "rights"), language: value(entry, "language"), description: value(entry, "summary") || value(entry, "content"), source: "opds" });
      else {
        const nav = links.find((link3) => /application\/(atom\+xml|opds\+json)/.test(link3.type || "") && ["subsection", "http://opds-spec.org/sort/new", "http://opds-spec.org/sort/popular"].includes(link3.rel));
        if (nav && safe(nav.href, url)) books.push({ id: value(entry, "id") || nav.href, title, author: "", genre: "OPDS", navigation: safe(nav.href, url), source: "opds" });
      }
    }
    const link = [...feed.documentElement.children].find((link2) => link2.localName === "link" && link2.getAttribute("rel") === "next");
    next = safe(link?.getAttribute("href"), url);
  }
  const needle = query.toLocaleLowerCase();
  return { books: books.filter((b) => (b.title + " " + b.author).toLocaleLowerCase().includes(needle)), next: !!next, continuation: next };
}
