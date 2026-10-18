// Generated from app/library/themes.ts by npm run build. Do not edit.
import { controlIcon } from "./controls.js";
export const paletteCatalog = [
  { key: "white", en: "Sela", id: "Sela", accent: "#3264c6", soft: "#eef4ff", motif: "sparkles" },
  { key: "forest", en: "Rimba", id: "Rimba", accent: "#16756a", soft: "#e8f7f3", motif: "leaf" },
  { key: "sakura", en: "Sakura", id: "Sakura", accent: "#c14672", soft: "#fff0f6", motif: "flower" },
  { key: "ocean", en: "Samudra", id: "Samudra", accent: "#087fa2", soft: "#e9f7fb", motif: "wave" },
  { key: "lavender", en: "Lembayung", id: "Lembayung", accent: "#6555b8", soft: "#f0efff", motif: "moon" },
  { key: "citrus", en: "Kenanga", id: "Kenanga", accent: "#687b17", soft: "#f4f7e7", motif: "sun" },
  { key: "senja", en: "Senja", id: "Senja", accent: "#b84c2c", soft: "#fff1e9", motif: "mountain" },
  { key: "arunika", en: "Arunika", id: "Arunika", accent: "#947000", soft: "#fbf5dc", motif: "tea" }
];
export const palettes = paletteCatalog.map((palette) => palette.key);
export function getPaletteDefinition(value) {
  return paletteCatalog.find((palette) => palette.key === value) || paletteCatalog[0];
}
const legacyPalettes = {
  dark: "white",
  oled: "white",
  charcoal: "white",
  oak: "forest",
  walnut: "lavender",
  paper: "white",
  linen: "ocean",
  rimba: "forest",
  nila: "ocean",
  seroja: "sakura",
  ink: "lavender",
  rose: "sakura",
  kids: "sakura",
  cyberpunk: "lavender",
  forest: "forest",
  ocean: "ocean",
  citrus: "citrus",
  laskar: "senja",
  bumi: "forest",
  hujan: "ocean",
  nurbaya: "sakura",
  wijck: "ocean",
  menara: "citrus",
  cantik: "sakura",
  kopi: "arunika",
  laut: "ocean",
  rindu: "lavender",
  purnama: "sakura",
  pelangi: "sakura",
  selat: "ocean",
  jingga: "senja"
};
const paletteKey = "sela-library:palette";
const themeKey = "sela-library:theme";
const paletteVersion = "5";
const darkPreference = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : { matches: false, addEventListener: () => {
} };
function isDarkAppearance(target) {
  const appearance = target.dataset.selaTheme || (target === document.documentElement ? target.dataset.theme : "auto") || "auto";
  return appearance === "dark" || appearance === "auto" && darkPreference.matches;
}
function applyPaletteTokens(target, value) {
  const palette = getPaletteDefinition(value), dark = isDarkAppearance(target);
  const panel = getComputedStyle(target).getPropertyValue("--panel").trim() || "#fff";
  target.style.setProperty("--accent", palette.accent);
  target.style.setProperty("--accent-ink", "#fff");
  target.style.setProperty("--palette-soft", dark ? `color-mix(in srgb, ${palette.accent} 20%, ${panel})` : palette.soft);
  target.style.setProperty("--sela-accent", palette.accent);
  target.style.setProperty("--sela-hover", `color-mix(in srgb, ${palette.accent} 14%, ${panel})`);
}
function refreshPaletteTokens() {
  applyPaletteTokens(document.documentElement, document.documentElement.dataset.palette || "white");
  document.querySelectorAll(".library-reader-overlay[data-palette]").forEach((target) => applyPaletteTokens(target, target.dataset.palette || "white"));
}
function normalizePalette(value) {
  const normalized = value ? legacyPalettes[value] || value : "white";
  return palettes.includes(normalized) ? normalized : "white";
}
export function initializePalette() {
  let initial = "white";
  try {
    const saved = localStorage.getItem(paletteKey);
    initial = normalizePalette(saved);
    if (saved === "oled" || saved === "charcoal") localStorage.setItem("sela-library:oled", "true");
    if (saved === "dark" || saved === "oled" || saved === "charcoal") {
      localStorage.setItem(themeKey, "dark");
      document.documentElement.dataset.theme = "dark";
    }
    localStorage.setItem("sela-library:palette-version", paletteVersion);
  } catch {
  }
  const url = new URL(location.href);
  const requested = url.searchParams.get("palette");
  if (requested && (palettes.includes(requested) || requested in legacyPalettes)) {
    initial = normalizePalette(requested);
    url.searchParams.delete("palette");
    history.replaceState(history.state, "", url);
  }
  applyPalette(initial);
  document.addEventListener("sela:appearance", refreshPaletteTokens);
  darkPreference.addEventListener("change", refreshPaletteTokens);
  applyOled(localStorage.getItem("sela-library:oled") === "true");
}
export function applyPalette(value, target = document.documentElement) {
  const chosen = normalizePalette(value);
  target.dataset.palette = chosen;
  applyPaletteTokens(target, chosen);
  if (target === document.documentElement) {
    try {
      localStorage.setItem(paletteKey, chosen);
      localStorage.setItem("sela-library:palette-version", paletteVersion);
    } catch {
    }
    document.dispatchEvent(new Event("sela:palette"));
  }
}
export function applyOled(enabled, target = document.documentElement) {
  target.dataset.oled = String(enabled);
  if (target === document.documentElement) {
    try {
      localStorage.setItem("sela-library:oled", String(enabled));
    } catch {
    }
    document.dispatchEvent(new Event("sela:oled"));
  }
}
export function mountOledToggle(parent, t, target = document.documentElement) {
  const row = document.createElement("label");
  row.className = "oled-setting-row";
  const copy = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = t("Pure black in dark mode", "Hitam pekat saat mode gelap");
  const note = document.createElement("small");
  note.textContent = t("Only changes dark mode; may save power on OLED screens.", "Hanya mengubah mode gelap; dapat menghemat daya pada layar OLED.");
  copy.append(title, note);
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = target.dataset.oled === "true";
  input.setAttribute("aria-label", t("Pure black in dark mode", "Hitam pekat saat mode gelap"));
  input.addEventListener("change", () => applyOled(input.checked, target));
  row.append(copy, input);
  parent.append(row);
  const sync = () => {
    input.checked = target.dataset.oled === "true";
    row.hidden = false;
  };
  document.addEventListener("sela:oled", sync);
  document.addEventListener("sela:appearance", sync);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
  sync();
  return sync;
}
export function mountPalettes(parent, t, target = document.documentElement) {
  const group = document.createElement("div");
  group.className = "app-palette-picker";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", t("App palette", "Palet aplikasi"));
  parent.append(group);
  for (const palette of paletteCatalog) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.paletteChoice = palette.key;
    button.dataset.en = palette.en;
    button.dataset.id = palette.id;
    button.style.setProperty("--palette-choice-accent", palette.accent);
    button.style.setProperty("--palette-choice-soft", palette.soft);
    const swatch = document.createElement("span");
    swatch.className = "palette-swatch";
    swatch.setAttribute("aria-hidden", "true");
    swatch.append(controlIcon(palette.motif));
    const caption = document.createElement("span");
    caption.className = "palette-caption";
    caption.textContent = t(palette.en, palette.id);
    button.setAttribute("aria-label", t(palette.en, palette.id));
    button.title = t(palette.en, palette.id);
    button.append(swatch, caption);
    button.onclick = () => {
      applyPalette(palette.key, target);
      sync();
    };
    group.append(button);
  }
  function sync() {
    for (const button of group.querySelectorAll("[data-palette-choice]")) {
      button.setAttribute("aria-pressed", String(button.dataset.paletteChoice === target.dataset.palette));
      button.querySelector(".palette-caption").textContent = t(button.dataset.en || "", button.dataset.id || "");
    }
  }
  sync();
  return sync;
}
