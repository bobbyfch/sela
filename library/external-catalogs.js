// Generated from app/library/external-catalogs.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { catalogCoverUrl } from "./covers.js";
export const catalogSources = [["wikisource", "Wikisumber \xB7 Indonesia"], ["gitenberg", "GITenberg \xB7 Classics"], ["gutendex", "Gutenberg \xB7 Gutendex"], ["wiki-en", "Wikisource \xB7 English"], ["wiki-fr", "Wikisource \xB7 Fran\xE7ais"], ["wiki-es", "Wikisource \xB7 Espa\xF1ol"], ["wiki-jv", "Wikisumber \xB7 Jawa"], ["wiki-su", "Wikisumber \xB7 Sunda"], ["wiki-de", "Wikisource \xB7 Deutsch"], ["wiki-nl", "Wikisource \xB7 Nederlands"], ["wiki-pt", "Wikisource \xB7 Portugu\xEAs"], ["wiki-it", "Wikisource \xB7 Italiano"], ["wiki-zh", "Wikisource \xB7 \u4E2D\u6587"], ["wiki-ja", "Wikisource \xB7 \u65E5\u672C\u8A9E"], ["wiki-ru", "Wikisource \xB7 \u0420\u0443\u0441\u0441\u043A\u0438\u0439"], ["wiki-ar", "Wikisource \xB7 \u0627\u0644\u0639\u0631\u0628\u064A\u0629"], ["openlibrary", "Open Library \xB7 Discovery"], ["doab", "DOAB \xB7 Open research"], ["openstax", "OpenStax \xB7 Textbooks"], ["standard", "Standard Ebooks \xB7 New releases"], ["local", "Sela \xB7 Selected classics"], ["opds", "OPDS \xB7 My catalogs"]];
async function json(url, signal) {
  const r = await fetch(url, { signal, headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!r.ok) throw Error("Catalog unavailable (" + r.status + ")");
  return JSON.parse(await responseText(r));
}
export async function externalBooks({ source, query = "", page = 1, signal }) {
  if (source === "gutendex") {
    const data = await json("https://gutendex.com/books/?" + new URLSearchParams({ search: query, page: String(page) }), signal);
    return { books: (data.results || []).map((b) => {
      const format = Object.entries(b.formats || {}).find(([type]) => type.startsWith("application/epub+zip")) || Object.entries(b.formats || {}).find(([type]) => type.startsWith("text/plain"));
      const cover = Object.entries(b.formats || {}).find(([type]) => type === "image/jpeg")?.[1];
      return { id: "gutenberg-" + b.id, title: b.title, author: b.authors?.map((a) => a.name).join(", "), source, language: b.languages?.[0], genre: b.subjects?.[0] || "Classic", rights: "Project Gutenberg edition. Check rights for your location.", url: format?.[1], format: format?.[0].startsWith("application") ? "epub" : "txt", coverUrl: catalogCoverUrl(cover), external: "https://www.gutenberg.org/ebooks/" + b.id };
    }), next: !!data.next, total: data.count };
  }
  if (source.startsWith("wiki-")) {
    const language = source.slice(5);
    if (!["en", "fr", "es", "jv", "su", "de", "nl", "pt", "it", "zh", "ja", "ru", "ar"].includes(language)) throw Error("Unsupported wiki language");
    const data = await json(`https://${language}.wikisource.org/w/api.php?` + new URLSearchParams({ action: "query", list: "search", srnamespace: "0", srsearch: query || "novel", srlimit: "24", sroffset: String((page - 1) * 24), format: "json", origin: "*" }), signal);
    return { books: (data.query?.search || []).map((b) => ({ id: source + "-" + b.pageid, title: b.title, source, pageid: b.pageid, language, author: "", genre: "Wikisource", rights: "See original work rights and contributor credits at source.", format: "html" })), next: !!data.continue, total: data.query?.searchinfo?.totalhits };
  }
  if (source === "openlibrary") {
    const data = await json("https://openlibrary.org/search.json?" + new URLSearchParams({ q: query || "classics", limit: "24", page: String(page), fields: "key,title,author_name,first_publish_year,language,ebook_access,cover_i" }), signal);
    return { books: (data.docs || []).map((b) => ({ id: b.key, title: b.title, author: b.author_name?.join(", "), source, year: b.first_publish_year, language: b.language?.[0], genre: "Discovery \xB7 " + (b.ebook_access || "metadata"), rights: "Availability and edition rights are shown at Open Library.", coverUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg?default=false`) : void 0, external: "https://openlibrary.org" + b.key })), total: data.numFound, next: page * 24 < data.numFound };
  }
  if (source === "doab") {
    const data = await json("https://directory.doabooks.org/rest/search?" + new URLSearchParams({ query: query ? "dc.title:" + query : "dc.type:book", expand: "metadata", limit: "24", offset: String((page - 1) * 24) }), signal);
    const rows = Array.isArray(data) ? data : data.items || [];
    return { books: rows.map((b) => {
      const find = (key) => b.metadata?.filter((m) => m.key === key).map((m) => m.value).join(", ") || "";
      return { id: b.uuid || b.id, title: find("dc.title"), author: find("dc.contributor.author"), source, genre: "Open research", rights: find("dc.rights") || "See publisher license", external: find("dc.identifier.uri") || "https://directory.doabooks.org/handle/" + b.handle };
    }), next: rows.length === 24 };
  }
  if (source === "openstax") {
    const titles = ["Biology 2e", "Chemistry 2e", "College Physics 2e", "Psychology 2e", "Introduction to Sociology 3e", "Principles of Economics 3e", "Introduction to Computer Science", "Calculus Volume 1"];
    return { books: titles.filter((title) => title.toLowerCase().includes(query.toLowerCase())).map((title) => ({ id: "openstax-" + title, title, author: "OpenStax", source, genre: "Learning", language: "en", rights: "Open textbook; see edition license and available PDF at source.", external: "https://openstax.org/details/books/" + title.toLowerCase().replaceAll(" ", "-") })), next: false };
  }
  if (source === "standard") {
    const r = await fetch("https://standardebooks.org/feeds/atom/new-releases", { signal });
    if (!r.ok) throw Error("Feed unavailable");
    const xml = new DOMParser().parseFromString(await responseText(r), "application/xml");
    if (xml.querySelector("parsererror")) throw Error("Invalid feed");
    return { books: [...xml.querySelectorAll("entry")].slice(0, 100).map((entry) => ({ id: entry.querySelector("id")?.textContent, title: entry.querySelector("title")?.textContent, author: entry.querySelector("author name")?.textContent || "Standard Ebooks", source, genre: "New releases", rights: "See edition rights. OPDS access follows Standard Ebooks membership terms.", external: entry.querySelector("link[rel=alternate]")?.getAttribute("href") })).filter((b) => b.title?.toLowerCase().includes(query.toLowerCase())), next: false };
  }
  throw Error("Unsupported catalog");
}
export async function externalWikiFile(book, signal) {
  const language = book.source.slice(5);
  if (!["en", "fr", "es", "jv", "su", "de", "nl", "pt", "it", "zh", "ja", "ru", "ar"].includes(language)) throw Error("Invalid wiki");
  const root = `https://${language}.wikisource.org/`, api = root + "w/api.php?", params = { format: "json", origin: "*" };
  const listing = await json(api + new URLSearchParams({ ...params, action: "query", list: "allpages", apprefix: book.title + "/", apnamespace: "0", aplimit: "80" }), signal);
  const chapters = (listing.query?.allpages || []).slice(0, 80).sort((a, b) => a.title.localeCompare(b.title, language, { numeric: true }));
  const pages = [{ pageid: book.pageid, title: book.title }, ...chapters.filter((c) => c.pageid !== book.pageid)];
  const htmls = new Array(pages.length);
  let cursor = 0, total = 0;
  await Promise.all(Array.from({ length: Math.min(3, pages.length) }, async () => {
    for (; ; ) {
      const index = cursor++;
      if (index >= pages.length) return;
      const page = pages[index], data = await json(api + new URLSearchParams({ ...params, action: "parse", pageid: String(page.pageid), prop: "text" }), signal), html = data.parse?.text?.["*"];
      if (typeof html !== "string" || (total += html.length) > 16 * 1048576) throw Error("Edition text exceeds limit");
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll("script,style,iframe,form,nav,img,svg,.mw-editsection,.noprint,.navbox").forEach((n) => n.remove());
      for (const el of doc.querySelectorAll("*")) for (const attr of [...el.attributes]) el.removeAttribute(attr.name);
      const heading = doc.createElement("h2");
      heading.textContent = page.title;
      doc.body.prepend(heading);
      htmls[index] = doc.body.innerHTML;
    }
  }));
  const credit = document.createElement("p");
  credit.textContent = "Wikisource \xB7 " + book.title + " \xB7 " + root + "?curid=" + book.pageid + " \u2014 original work rights and CC BY-SA contributor credits at source." + (listing.continue ? " This is a bounded transcription of the first 80 subpages; continue at source." : "");
  return new File(['<!doctype html><html lang="' + language + '"><body>' + htmls.join("") + credit.outerHTML + "</body></html>"], book.title + ".html", { type: "text/html" });
}
