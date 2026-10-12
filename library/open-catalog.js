// Generated from app/library/open-catalog.ts by npm run build. Do not edit.
export function coverFor(book) {
  const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 240 360");
  const add = (tag, attrs, text) => {
    const e = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    svg.append(e);
  };
  const colors = ["#385b54", "#684d60", "#49576f", "#6c573d"];
  const color = colors[[...String(book.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
  add("rect", { width: 240, height: 360, fill: color });
  add("rect", { x: 15, y: 15, width: 210, height: 330, rx: 3, fill: "none", stroke: "#ede5cf", "stroke-opacity": ".45" });
  add("path", { d: "M35 57h170M35 290h170", stroke: "#ede5cf", "stroke-opacity": ".5" });
  const words = book.title.split(/\s+/);
  let lines = [], line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 18 && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  lines.slice(0, 7).forEach((s, i) => add("text", { x: 120, y: 102 + i * 23, "text-anchor": "middle", fill: "#faf4e6", "font-family": "Georgia, serif", "font-size": 19 }, s));
  add("text", { x: 120, y: 319, "text-anchor": "middle", fill: "#ede5cf", "font-family": "sans-serif", "font-size": 11 }, book.author);
  return new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
}
