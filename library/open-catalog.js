// Generated from app/library/open-catalog.ts by npm run build. Do not edit.
export function coverFor(book) {
  const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 240 360");
  const add = (parent, tag, attrs, text) => {
    const e = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    parent.append(e);
    return e;
  };
  const seed = [...String(book.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0), styles = getComputedStyle(document.documentElement), color = styles.getPropertyValue("--accent").trim() || "#4b83d8", accent = ["#78b9d5", "#9a88d8", "#e786a7", "#61ad95", "#edaa62"][seed % 5], paper = styles.getPropertyValue("--palette-soft").trim() || "#eef4ff", ink = styles.getPropertyValue("--fg").trim() || "#26334c";
  const defs = add(svg, "defs", {}), gradient = add(defs, "linearGradient", { id: "cover-wash", x1: "0", y1: "0", x2: "1", y2: "1" });
  add(gradient, "stop", { offset: "0", "stop-color": color });
  add(gradient, "stop", { offset: "1", "stop-color": paper });
  add(svg, "rect", { width: 240, height: 360, fill: "url(#cover-wash)" });
  add(svg, "rect", { x: 12, y: 12, width: 216, height: 336, rx: 18, fill: "none", stroke: ink, "stroke-opacity": ".16" });
  add(svg, "circle", { cx: 198, cy: 74, r: 30, fill: accent, "fill-opacity": ".3" });
  add(svg, "path", { d: "M35 48h170", stroke: ink, "stroke-opacity": ".22" });
  add(svg, "text", { x: 35, y: 37, fill: ink, "fill-opacity": ".72", "font-family": "sans-serif", "font-size": 8, "font-weight": 700, "letter-spacing": 1.4 }, "OPEN EDITION");
  const motif = seed % 4;
  if (motif === 0) {
    add(svg, "path", { d: "M56 210V151a64 64 0 0 1 128 0v59Z", fill: accent, "fill-opacity": ".76" });
    add(svg, "path", { d: "M75 210v-55a45 45 0 0 1 90 0v55M120 115v95", fill: "none", stroke: paper, "stroke-opacity": ".85", "stroke-width": 2 });
  } else if (motif === 1) {
    add(svg, "path", { d: "M119 203c3-39 0-68-11-103m14 91c8-27 24-47 49-62m-52 42c-20-18-39-28-61-31", fill: "none", stroke: paper, "stroke-width": 3, "stroke-linecap": "round" });
    for (const d of ["M105 117c-22-2-34-15-36-32 22 1 35 13 36 32Z", "M136 164c3-23 18-38 39-43-2 22-17 38-39 43Z", "M102 157c-21-4-32-18-33-37 21 4 32 17 33 37Z"]) add(svg, "path", { d, fill: accent, stroke: paper, "stroke-width": 1 });
  } else if (motif === 2) {
    add(svg, "path", { d: "M20 188c33-42 67-42 100 0s67 42 100 0v22H20Zm0-50c33-42 67-42 100 0s67 42 100 0v22c-33 42-67 42-100 0s-67-42-100 0Z", fill: accent, "fill-opacity": ".82" });
    add(svg, "path", { d: "M20 138c33-42 67-42 100 0s67 42 100 0", fill: "none", stroke: ink, "stroke-opacity": ".65", "stroke-width": 2 });
  } else {
    add(svg, "path", { d: "M65 205V93h110v112M83 205v-90h74v90M55 205h130", fill: accent, "fill-opacity": ".77", stroke: paper, "stroke-opacity": ".9", "stroke-width": 2 });
    add(svg, "path", { d: "M94 141h51m-51 16h51m-51 16h51", stroke: paper, "stroke-opacity": ".85", "stroke-width": 2 });
  }
  add(svg, "path", { d: "M35 218h170", stroke: ink, "stroke-opacity": ".24" });
  const words = String(book.title || "Untitled").split(/\s+/);
  let lines = [], line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 20 && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > 4) lines[3] = lines[3].slice(0, 17) + "\u2026";
  lines.slice(0, 4).forEach((value, index) => add(svg, "text", { x: 120, y: 252 + index * 21, "text-anchor": "middle", fill: ink, "font-family": "sans-serif", "font-size": 16, "font-weight": 650 }, value));
  add(svg, "text", { x: 120, y: 330, "text-anchor": "middle", fill: ink, "fill-opacity": ".72", "font-family": "sans-serif", "font-size": 10 }, String(book.author || "").slice(0, 30));
  return new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
}
