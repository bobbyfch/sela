// Generated from app/library/open-catalog.ts by npm run build. Do not edit.
export function coverFor(book) {
  const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 240 360");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", String(book.title || "Book cover"));
  const add = (parent, tag, attrs, text) => {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    if (text) element.textContent = text;
    parent.append(element);
    return element;
  };
  const seed = [...String(book.id || book.title || "sela")].reduce((sum, char) => sum + char.charCodeAt(0), 0), styles = getComputedStyle(document.documentElement);
  const paper = styles.getPropertyValue("--panel").trim() || "#fff", accent = styles.getPropertyValue("--accent").trim() || "#376cda", ink = styles.getPropertyValue("--fg").trim() || "#26334c", line = styles.getPropertyValue("--line").trim() || "#dbe2ec";
  add(svg, "rect", { width: 240, height: 360, fill: paper });
  add(svg, "rect", { x: 0, y: 0, width: 13, height: 360, fill: accent });
  add(svg, "rect", { x: 25, y: 22, width: 192, height: 316, rx: 8, fill: "none", stroke: line, "stroke-width": 1.5 });
  add(svg, "text", { x: 36, y: 51, fill: accent, "font-family": "system-ui,sans-serif", "font-size": 9, "font-weight": 750, "letter-spacing": 1.6 }, "SELA  /  OPEN EDITION");
  add(svg, "path", { d: "M36 64h168", stroke: line, "stroke-width": 1 });
  const motif = seed % 4, soft = accent;
  if (motif === 0) {
    add(svg, "path", { d: "M61 204v-50a59 59 0 0 1 118 0v50", fill: "none", stroke: soft, "stroke-width": 5, "stroke-linecap": "round" });
    add(svg, "path", { d: "M79 204v-49a41 41 0 0 1 82 0v49M120 117v87", fill: "none", stroke: ink, "stroke-opacity": ".65", "stroke-width": 2 });
  } else if (motif === 1) {
    add(svg, "path", { d: "M120 205v-89m0 59c-24-22-45-29-61-27m61 8c21-24 41-34 60-32", fill: "none", stroke: soft, "stroke-width": 4, "stroke-linecap": "round" });
    add(svg, "path", { d: "M80 147c-2-23-15-37-34-41 0 22 13 37 34 41Zm39-14c2-23 16-36 36-41-1 23-15 37-36 41Z", fill: "none", stroke: ink, "stroke-opacity": ".72", "stroke-width": 2 });
  } else if (motif === 2) {
    add(svg, "path", { d: "M36 170c28-24 56-24 84 0s56 24 84 0M36 188c28-24 56-24 84 0s56 24 84 0M36 206c28-24 56-24 84 0s56 24 84 0", fill: "none", stroke: soft, "stroke-width": 4, "stroke-linecap": "round" });
    add(svg, "circle", { cx: 120, cy: 151, r: 4, fill: ink, "fill-opacity": ".72" });
  } else {
    add(svg, "path", { d: "M70 203V110h100v93M87 203v-75h66v75M57 203h126", fill: "none", stroke: soft, "stroke-width": 4, "stroke-linejoin": "round" });
    add(svg, "path", { d: "M101 148h38m-38 13h38m-38 13h38", stroke: ink, "stroke-opacity": ".65", "stroke-width": 2, "stroke-linecap": "round" });
  }
  const words = String(book.title || "Untitled").trim().split(/\s+/), lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > 19 && current) {
      lines.push(current);
      current = word;
    } else current = (current + " " + word).trim();
  }
  if (current) lines.push(current);
  if (lines.length > 4) lines.splice(4, lines.length - 4);
  if (lines.length === 4 && lines[3].length > 18) lines[3] = lines[3].slice(0, 17) + "\u2026";
  const titleY = 250 + (4 - lines.length) * 8;
  lines.forEach((text, index) => add(svg, "text", { x: 38, y: titleY + index * 22, fill: ink, "font-family": "Georgia,serif", "font-size": 16, "font-weight": 700 }, text));
  add(svg, "path", { d: "M36 318h168", stroke: line, "stroke-width": 1 });
  add(svg, "text", { x: 36, y: 330, fill: ink, "fill-opacity": ".72", "font-family": "system-ui,sans-serif", "font-size": 9, "font-weight": 550 }, String(book.author || "A book to discover").slice(0, 32));
  return new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
}
