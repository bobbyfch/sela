// Generated from app/library/external-catalogs.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { catalogCoverUrl } from "./covers.js";
export const catalogSources = [["wikisource", "Wikisumber \xB7 Indonesia"], ["gitenberg", "GITenberg \xB7 Classics"], ["gutendex", "Gutenberg \xB7 Public-domain books"], ["wiki-en", "Wikisource \xB7 English"], ["wiki-fr", "Wikisource \xB7 Fran\xE7ais"], ["wiki-es", "Wikisource \xB7 Espa\xF1ol"], ["wiki-jv", "Wikisumber \xB7 Jawa"], ["wiki-su", "Wikisumber \xB7 Sunda"], ["wiki-de", "Wikisource \xB7 Deutsch"], ["wiki-nl", "Wikisource \xB7 Nederlands"], ["wiki-pt", "Wikisource \xB7 Portugu\xEAs"], ["wiki-it", "Wikisource \xB7 Italiano"], ["wiki-zh", "Wikisource \xB7 \u4E2D\u6587"], ["wiki-ja", "Wikisource \xB7 \u65E5\u672C\u8A9E"], ["wiki-ru", "Wikisource \xB7 \u0420\u0443\u0441\u0441\u043A\u0438\u0439"], ["wiki-ar", "Wikisource \xB7 \u0627\u0644\u0639\u0631\u0628\u064A\u0629"], ["openlibrary-trending", "Open Library \xB7 Top reads"], ["openlibrary-hidden", "Open Library \xB7 Hidden gems"], ["google-books", "Google Books \xB7 New releases"], ["google-books-free", "Google Books \xB7 Free eBooks"], ["google-books-paid", "Google Books \xB7 Paid & preview"], ["openlibrary", "Open Library \xB7 Discovery"], ["doab", "DOAB \xB7 Open research"], ["openstax", "OpenStax \xB7 Open textbooks"], ["id-tech", "Indonesian \xB7 Tech reading"], ["standard", "Standard Ebooks \xB7 New releases"], ["local", "Sela \xB7 Selected classics"], ["opds", "OPDS \xB7 My catalogs"]];
const catalogCache = /* @__PURE__ */ new Map();
async function json(url, signal) {
  const cached = catalogCache.get(url);
  if (cached && Date.now() - cached.at < 10 * 6e4) return cached.data;
  const r = await fetch(url, { signal, headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!r.ok) throw Error("Catalog unavailable (" + r.status + ")");
  const data = JSON.parse(await responseText(r));
  if (catalogCache.size > 80) catalogCache.delete(catalogCache.keys().next().value);
  catalogCache.set(url, { at: Date.now(), data });
  return data;
}
export async function externalBooks({ source, query = "", page = 1, category = "", signal }) {
  if (source === "gutendex") {
    const data = await json("https://gutendex.com/books/?" + new URLSearchParams({ search: query, page: String(page) }), signal);
    return { books: (data.results || []).map((b) => {
      const format = Object.entries(b.formats || {}).find(([type]) => type.startsWith("application/epub+zip")) || Object.entries(b.formats || {}).find(([type]) => type.startsWith("text/plain"));
      const cover = Object.entries(b.formats || {}).find(([type]) => type === "image/jpeg")?.[1];
      return { id: "gutenberg-" + b.id, title: b.title, author: b.authors?.map((a) => a.name).join(", "), source, accessType: "open", language: b.languages?.[0], genre: b.subjects?.[0] || "Classic", rights: "Project Gutenberg edition. Check rights for your location.", url: format?.[1], format: format?.[0].startsWith("application") ? "epub" : "txt", coverUrl: catalogCoverUrl(cover), external: "https://www.gutenberg.org/ebooks/" + b.id };
    }), next: !!data.next, total: data.count };
  }
  if (source.startsWith("wiki-")) {
    const language = source.slice(5);
    if (!["en", "fr", "es", "jv", "su", "de", "nl", "pt", "it", "zh", "ja", "ru", "ar"].includes(language)) throw Error("Unsupported wiki language");
    const data = await json(`https://${language}.wikisource.org/w/api.php?` + new URLSearchParams({ action: "query", list: "search", srnamespace: "0", srsearch: query || "novel", srlimit: "24", sroffset: String((page - 1) * 24), format: "json", origin: "*" }), signal);
    return { books: (data.query?.search || []).map((b) => ({ id: source + "-" + b.pageid, title: b.title, source, pageid: b.pageid, language, author: "", genre: "Wikisource", rights: "See original work rights and contributor credits at source.", format: "html" })), next: !!data.continue, total: data.query?.searchinfo?.totalhits };
  }
  if (source === "openlibrary-trending") {
    const data = await json("https://openlibrary.org/trending/daily.json?" + new URLSearchParams({ limit: "24", page: String(page) }), signal), works = data.works || [];
    return { books: works.map((b, index) => ({ id: b.key, title: b.title, author: b.author_name?.join(", "), source, year: b.first_publish_year, genre: "Top reads \xB7 Open Library", accessType: "catalog", rights: "Popularity reflects reading activity recorded by Open Library, not sales; edition access and rights vary.", coverUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg?default=false`) : void 0, coverDownloadUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg?default=false`) : void 0, external: "https://openlibrary.org" + b.key, trendingRank: (page - 1) * 24 + index + 1 })), total: void 0, next: works.length === 24 };
  }
  if (["google-books", "google-books-free", "google-books-paid"].includes(source)) {
    const subjects = { fiction: "fiction", fantasy: "fantasy", mystery_and_detective_stories: "mystery", romance: "romance", science_fiction: "science fiction", history: "history", poetry: "poetry", childrens_literature: "juvenile fiction", philosophy: "philosophy", biography: "biography" };
    const queryText = query.trim();
    if (queryText.length > 100) throw Error("Search query is too long.");
    const q = queryText ? queryText + (subjects[category] ? " subject:" + subjects[category] : "") : category === "new" ? "subject:fiction" : subjects[category] ? "subject:" + subjects[category] : "subject:fiction";
    const params = new URLSearchParams({ q, maxResults: "24", startIndex: String((page - 1) * 24), orderBy: source === "google-books" ? "newest" : "relevance", printType: "books" });
    if (source === "google-books-free") params.set("filter", "free-ebooks");
    if (source === "google-books-paid") params.set("filter", "paid-ebooks");
    const language = typeof document === "undefined" ? "en-US" : document.documentElement.lang, country = language.match(/-([A-Z]{2})(?:-|$)/)?.[1];
    if (country) params.set("country", country);
    const data = await json("https://www.googleapis.com/books/v1/volumes?" + params, signal), items = data.items || [];
    return { books: items.filter((b) => b.id && b.volumeInfo?.title).map((b) => {
      const info = b.volumeInfo || {}, sale = b.saleInfo || {}, access = b.accessInfo || {}, images = info.imageLinks || {}, cover = images.medium || images.large || images.extraLarge || images.small || images.thumbnail, highRes = images.extraLarge || images.large || images.medium || images.small || images.thumbnail, buyLink = sale.buyLink, preview = info.previewLink;
      return { id: "google-books-" + b.id, title: info.title, author: info.authors?.join(", "), source, year: info.publishedDate?.slice(0, 4), language: info.language, accessType: source === "google-books-paid" ? "paid" : source === "google-books-free" ? "free" : sale.saleability === "FOR_SALE" ? "paid" : sale.saleability === "FREE" ? "free" : "catalog", genre: source === "google-books-paid" ? "Paid books \xB7 Google Books" : source === "google-books-free" ? "Free eBooks \xB7 Google Books" : "New releases \xB7 Google Books", description: info.description, rights: "Google Books edition. Preview, price, and purchase availability vary by country.", coverUrl: catalogCoverUrl(cover), coverDownloadUrl: catalogCoverUrl(highRes), buyLink: typeof buyLink === "string" && /^https:\/\/(?:books\.google\.com|play\.google\.com)\//.test(buyLink) ? buyLink : void 0, previewLink: typeof preview === "string" && /^https:\/\/books\.google\.com\//.test(preview) ? preview : void 0, googleViewability: access.viewability, googleSaleability: sale.saleability, googlePrice: sale.retailPrice?.amount, googleCurrency: sale.retailPrice?.currencyCode, external: typeof info.infoLink === "string" && /^https:\/\/(?:books\.google\.com|play\.google\.com)\//.test(info.infoLink) ? info.infoLink : "https://books.google.com/books?id=" + encodeURIComponent(b.id) };
    }), total: data.totalItems, next: page * 24 < (data.totalItems || 0) };
  }
  if (source === "openlibrary-hidden") {
    const subject = category && /^[a-z_]{2,60}$/.test(category) ? category : "fiction", queryText = query.trim().slice(0, 80), q = [queryText, `subject:${subject}`].filter(Boolean).join(" ");
    const data = await json("https://openlibrary.org/search.json?" + new URLSearchParams({ q, limit: "48", page: String(page), sort: "rating desc", fields: "key,title,author_name,first_publish_year,language,ebook_access,cover_i,subject,ratings_average,ratings_count,edition_count" }), signal);
    const docs = (data.docs || []).filter((b) => Number(b.ratings_count) >= 3 && Number(b.ratings_count) < 800 && Number(b.ratings_average) >= 3.8).slice(0, 24);
    return { books: docs.map((b) => ({ id: b.key, title: b.title, author: b.author_name?.join(", "), source, year: b.first_publish_year, language: b.language?.[0], genre: "Hidden gem \xB7 reader ratings", rating: b.ratings_average, ratingsCount: b.ratings_count, rights: "A reader-rated discovery, not a sales ranking. Edition access and rights vary; check the source.", coverUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg?default=false`) : void 0, coverDownloadUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg?default=false`) : void 0, external: "https://openlibrary.org" + b.key })), total: docs.length ? void 0 : data.numFound, next: docs.length === 24 };
  }
  if (source === "openlibrary" && category) {
    const subjects = ["fiction", "fantasy", "mystery_and_detective_stories", "romance", "science_fiction", "history", "poetry", "childrens_literature", "philosophy", "biography"];
    if (!subjects.includes(category)) throw Error("Unsupported book category");
    const data = await json(`https://openlibrary.org/subjects/${category}.json?` + new URLSearchParams({ limit: "24", offset: String((page - 1) * 24) }), signal), works = data.works || [], needle = query.trim().toLocaleLowerCase();
    const books = works.filter((b) => !needle || (b.title + " " + (b.authors || []).map((a) => a.name).join(" ")).toLocaleLowerCase().includes(needle)).map((b) => ({ id: b.key, title: b.title, author: b.authors?.map((a) => a.name).join(", "), source, year: b.first_publish_year, genre: category.replaceAll("_", " "), accessType: "catalog", rights: "Availability and edition rights are shown at Open Library.", coverUrl: Number.isSafeInteger(b.cover_id) && b.cover_id > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_id}-M.jpg?default=false`) : void 0, coverDownloadUrl: Number.isSafeInteger(b.cover_id) && b.cover_id > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_id}-L.jpg?default=false`) : void 0, external: "https://openlibrary.org" + b.key }));
    return { books, total: data.work_count, next: page * 24 < (data.work_count || 0) };
  }
  if (source === "openlibrary") {
    const data = await json("https://openlibrary.org/search.json?" + new URLSearchParams({ q: query || "classics", limit: "24", page: String(page), fields: "key,title,author_name,first_publish_year,language,ebook_access,cover_i,subject" }), signal);
    return { books: (data.docs || []).map((b) => ({ id: b.key, title: b.title, author: b.author_name?.join(", "), source, year: b.first_publish_year, language: b.language?.[0], genre: "Discovery \xB7 " + (b.subject?.[0] || b.ebook_access || "metadata"), accessType: "catalog", rights: "Availability and edition rights are shown at Open Library.", coverUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg?default=false`) : void 0, coverDownloadUrl: Number.isSafeInteger(b.cover_i) && b.cover_i > 0 ? catalogCoverUrl(`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg?default=false`) : void 0, external: "https://openlibrary.org" + b.key })), total: data.numFound, next: page * 24 < data.numFound };
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
    const titles = [
      ["Anatomy and Physiology 2e", "anatomy-and-physiology-2e", "Health sciences"],
      ["Biology 2e", "biology-2e", "Life sciences"],
      ["Concepts of Biology", "concepts-biology", "Life sciences"],
      ["Microbiology", "microbiology", "Life sciences"],
      ["Chemistry 2e", "chemistry-2e", "Physical sciences"],
      ["College Physics 2e", "college-physics-2e", "Physical sciences"],
      ["University Physics Volume 1", "university-physics-volume-1", "Physical sciences"],
      ["University Physics Volume 2", "university-physics-volume-2", "Physical sciences"],
      ["University Physics Volume 3", "university-physics-volume-3", "Physical sciences"],
      ["Psychology 2e", "psychology-2e", "Social sciences"],
      ["Introduction to Sociology 3e", "introduction-to-sociology-3e", "Social sciences"],
      ["Introduction to Anthropology", "introduction-anthropology", "Social sciences"],
      ["Introduction to Philosophy", "introduction-philosophy", "Humanities"],
      ["Principles of Economics 3e", "principles-economics-3e", "Economics"],
      ["Principles of Microeconomics 3e", "principles-microeconomics-3e", "Economics"],
      ["Principles of Macroeconomics 3e", "principles-macroeconomics-3e", "Economics"],
      ["Business Ethics", "business-ethics", "Business"],
      ["Introduction to Business", "introduction-business", "Business"],
      ["Organizational Behavior", "organizational-behavior", "Business"],
      ["Calculus Volume 1", "calculus-volume-1", "Mathematics"],
      ["Calculus Volume 2", "calculus-volume-2", "Mathematics"],
      ["Calculus Volume 3", "calculus-volume-3", "Mathematics"],
      ["Precalculus 2e", "precalculus-2e", "Mathematics"],
      ["College Algebra 2e", "college-algebra-2e", "Mathematics"],
      ["Algebra and Trigonometry 2e", "algebra-and-trigonometry-2e", "Mathematics"],
      ["Introductory Statistics", "introductory-statistics", "Mathematics"],
      ["World History Volume 1: to 1500", "world-history-volume-1", "History"],
      ["World History Volume 2: from 1400", "world-history-volume-2", "History"],
      ["U.S. History", "us-history", "History"],
      ["American Government 3e", "american-government-3e", "Civics"],
      ["Public Speaking", "public-speaking", "Communication"],
      ["College Success", "college-success", "Life skills"],
      ["Nutrition", "nutrition", "Health sciences"],
      ["Introduction to Computer Science", "introduction-computer-science", "Computer science"]
    ];
    const needle = query.trim().toLocaleLowerCase();
    return { books: titles.filter(([title, , subject]) => !needle || (title + " " + subject).toLocaleLowerCase().includes(needle)).map(([title, slug, subject]) => ({ id: "openstax-" + slug, title, author: "OpenStax \xB7 Rice University", source, genre: "Open textbook \xB7 " + subject, language: "en", accessType: "open", description: "Free online reading and PDF are provided on the official edition page. This Sela entry links to the publisher; it does not copy the textbook.", rights: "Free access at OpenStax. Reuse license varies by edition (including CC BY and CC BY-NC-SA); check that book page before copying, adapting, or redistributing.", external: "https://openstax.org/details/books/" + slug })), next: false, total: titles.length };
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
