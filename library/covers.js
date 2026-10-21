// Generated from app/library/covers.ts by npm run build. Do not edit.
const OPEN_LIBRARY_COVERS = "covers.openlibrary.org";
export function catalogCoverUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "books.google.com") || url.username || url.password) return;
    if (url.hostname === OPEN_LIBRARY_COVERS && /^\/b\/(?:id|isbn|olid|oclc|lccn)\/[\w-]+-(?:S|M|L)\.jpg$/i.test(url.pathname)) return url.href;
    if (url.hostname === "www.gutenberg.org" && /^\/cache\/epub\/\d+\/.+\.(?:jpe?g|png|webp)$/i.test(url.pathname)) return url.href;
    if (url.hostname === "books.google.com" && (url.pathname === "/books/content" || url.pathname === "/books")) {
      const id = url.searchParams.get("id");
      if (!id || !/^[\w-]{1,128}$/.test(id) || url.searchParams.get("img") !== "1") return;
      const requestedZoom = url.searchParams.get("zoom") || "1";
      const zoom = /^[1-5]$/.test(requestedZoom) ? requestedZoom : "1";
      const cover = new URL("https://books.google.com/books/content");
      cover.searchParams.set("id", id);
      cover.searchParams.set("printsec", "frontcover");
      cover.searchParams.set("img", "1");
      cover.searchParams.set("zoom", zoom);
      cover.searchParams.set("source", "gbs_api");
      return cover.href;
    }
  } catch {
    return;
  }
}
export function catalogCoverUrlForQuality(value, quality, highResolutionValue) {
  const selected = quality === "hd" ? catalogCoverUrl(highResolutionValue) || catalogCoverUrl(value) : catalogCoverUrl(value);
  if (!selected) return void 0;
  try {
    const url = new URL(selected);
    if (url.hostname === OPEN_LIBRARY_COVERS) {
      const match = url.pathname.match(/^(\/b\/(?:id|isbn|olid|oclc|lccn)\/[\w-]+-)(?:S|M|L)(\.jpg)$/i);
      if (match) url.pathname = `${match[1]}${quality === "hd" ? "L" : "M"}${match[2]}`;
    }
    return catalogCoverUrl(url.href);
  } catch {
    return void 0;
  }
}
