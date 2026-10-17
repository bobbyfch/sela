/** Style palettes are independent from the light/dark scene preference. */
import {controlIcon, type ControlIcon} from './controls.ts';

export const paletteCatalog = [
  {key:'white',en:'Sela',id:'Sela',accent:'#3264c6',soft:'#eef4ff',motif:'sparkles'},
  {key:'kids',en:'Pelangi',id:'Pelangi',accent:'#c83f59',soft:'#fff0f3',motif:'smile'},
  {key:'cyberpunk',en:'Neon',id:'Neon',accent:'#7045bf',soft:'#f4efff',motif:'planet'},
  {key:'forest',en:'Rimba',id:'Rimba',accent:'#147461',soft:'#eaf8f4',motif:'leaf'},
  {key:'sakura',en:'Sakura',id:'Sakura',accent:'#b83f76',soft:'#fff0f7',motif:'flower'},
  {key:'ocean',en:'Samudra',id:'Samudra',accent:'#147ba8',soft:'#eaf7fe',motif:'wave'},
  {key:'lavender',en:'Lembayung',id:'Lembayung',accent:'#5f4ab9',soft:'#f0efff',motif:'moon'},
  {key:'citrus',en:'Kenanga',id:'Kenanga',accent:'#557a1d',soft:'#f2f8e8',motif:'sun'},
  {key:'laskar',en:'Senja',id:'Senja',accent:'#155d86',soft:'#fff4c2',motif:'compass'},
  {key:'bumi',en:'Pesisir',id:'Pesisir',accent:'#12675a',soft:'#d8f1e9',motif:'mountain'},
  {key:'hujan',en:'Hujan',id:'Hujan',accent:'#3e5f9f',soft:'#e5efff',motif:'rain'},
  {key:'nurbaya',en:'Seroja',id:'Seroja',accent:'#884b68',soft:'#fce7f0',motif:'lotus'},
  {key:'wijck',en:'Nila',id:'Nila',accent:'#155b78',soft:'#e4f5fb',motif:'crane'},
  {key:'menara',en:'Embun',id:'Embun',accent:'#64751d',soft:'#f1f5d6',motif:'tower'},
  {key:'cantik',en:'Purnama',id:'Purnama',accent:'#8a3f64',soft:'#fae6ef',motif:'shell'},
  {key:'kopi',en:'Arunika',id:'Arunika',accent:'#80501f',soft:'#f9eee0',motif:'tea'},
  {key:'laut',en:'Selat',id:'Selat',accent:'#006478',soft:'#ddf4f8',motif:'boat'},
  {key:'rindu',en:'Jingga',id:'Jingga',accent:'#4d5e9d',soft:'#eceeff',motif:'lantern'}
] as const satisfies readonly {key:string;en:string;id:string;accent:string;soft:string;motif:ControlIcon}[];
export const palettes = paletteCatalog.map(palette=>palette.key);
export type PaletteKey = typeof paletteCatalog[number]['key'];
export function getPaletteDefinition(value:string) {
  return paletteCatalog.find(palette=>palette.key===value)||paletteCatalog[0];
}

const legacyPalettes: Record<string, PaletteKey> = {
  dark: 'white', oled: 'white', charcoal: 'white', oak: 'forest', walnut: 'lavender',
  paper: 'white', linen: 'ocean', rimba: 'forest', nila: 'lavender', seroja: 'sakura',
  ink: 'lavender', rose: 'sakura'
};
const paletteKey = 'sela-library:palette';
const themeKey = 'sela-library:theme';
const paletteVersion = '4';
const darkPreference=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):{matches:false,addEventListener:()=>{}} as unknown as MediaQueryList;

function isDarkAppearance(target:HTMLElement) {
  const appearance=target.dataset.selaTheme||(target===document.documentElement?target.dataset.theme:'auto')||'auto';
  return appearance==='dark'||(appearance==='auto'&&darkPreference.matches);
}
function applyPaletteTokens(target:HTMLElement,value:string) {
  const palette=getPaletteDefinition(value),dark=isDarkAppearance(target);
  const panel=getComputedStyle(target).getPropertyValue('--panel').trim()||'#fff';
  target.style.setProperty('--accent',palette.accent);
  target.style.setProperty('--accent-ink','#fff');
  target.style.setProperty('--palette-soft',dark?`color-mix(in srgb, ${palette.accent} 20%, ${panel})`:palette.soft);
  target.style.setProperty('--sela-accent',palette.accent);
  target.style.setProperty('--sela-hover',`color-mix(in srgb, ${palette.accent} 14%, ${panel})`);
}
function refreshPaletteTokens() {
  applyPaletteTokens(document.documentElement,document.documentElement.dataset.palette||'white');
  document.querySelectorAll<HTMLElement>('.library-reader-overlay[data-palette]').forEach(target=>applyPaletteTokens(target,target.dataset.palette||'white'));
}

function normalizePalette(value: string | null): PaletteKey {
  const normalized = value ? legacyPalettes[value] || value : 'white';
  return palettes.includes(normalized as PaletteKey) ? normalized as PaletteKey : 'white';
}

export function initializePalette() {
  let initial = 'white';
  try {
    const saved = localStorage.getItem(paletteKey);
    initial = normalizePalette(saved);
    // Older releases represented dark mode and OLED as palettes. Preserve the
    // user's intent while moving the visual style into its own setting.
    if (saved === 'oled' || saved === 'charcoal') localStorage.setItem('sela-library:oled', 'true');
    if (saved === 'dark' || saved === 'oled' || saved === 'charcoal') {
      localStorage.setItem(themeKey, 'dark');
      document.documentElement.dataset.theme = 'dark';
    }
    localStorage.setItem('sela-library:palette-version', paletteVersion);
  } catch {}

  const url = new URL(location.href);
  const requested = url.searchParams.get('palette');
  if (requested && (palettes.includes(requested as PaletteKey) || requested in legacyPalettes)) {
    initial = normalizePalette(requested);
    url.searchParams.delete('palette');
    history.replaceState(history.state, '', url);
  }
  applyPalette(initial);
  document.addEventListener('sela:appearance',refreshPaletteTokens);
  darkPreference.addEventListener('change',refreshPaletteTokens);
  applyOled(localStorage.getItem('sela-library:oled') === 'true');
}

export function applyPalette(value: string, target = document.documentElement) {
  const chosen = normalizePalette(value);
  target.dataset.palette = chosen;
  applyPaletteTokens(target,chosen);
  if (target === document.documentElement) {
    try {
      localStorage.setItem(paletteKey, chosen);
      localStorage.setItem('sela-library:palette-version', paletteVersion);
    } catch {}
    document.dispatchEvent(new Event('sela:palette'));
  }
}

export function applyOled(enabled: boolean, target = document.documentElement) {
  target.dataset.oled = String(enabled);
  if (target === document.documentElement) {
    try { localStorage.setItem('sela-library:oled', String(enabled)); } catch {}
    document.dispatchEvent(new Event('sela:oled'));
  }
}

export function mountOledToggle(parent: HTMLElement, t: (en: string, id: string) => string, target = document.documentElement) {
  const row = document.createElement('label');
  row.className = 'oled-setting-row';
  const copy = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = t('Pure black in dark mode', 'Hitam pekat saat mode gelap');
  const note = document.createElement('small');
  note.textContent = t('Save power on OLED screens.', 'Hemat daya pada layar OLED.');
  copy.append(title, note);
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = target.dataset.oled === 'true';
  input.setAttribute('aria-label', t('Pure black in dark mode', 'Hitam pekat saat mode gelap'));
  input.addEventListener('change', () => applyOled(input.checked, target));
  row.append(copy, input);
  parent.append(row);
  const sync = () => {
    input.checked = target.dataset.oled === 'true';
    row.hidden = !(target.dataset.theme === 'dark' || (target.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches));
  };
  document.addEventListener('sela:oled', sync);
  document.addEventListener('sela:appearance', sync);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  sync();
  return sync;
}
export function mountPalettes(parent: HTMLElement, t: (en: string, id: string) => string, target = document.documentElement) {
  const group = document.createElement('div');
  group.className = 'app-palette-picker';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', t('App palette', 'Palet aplikasi'));
  parent.append(group);
  for (const palette of paletteCatalog) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.paletteChoice = palette.key;
    button.dataset.en = palette.en;
    button.dataset.id = palette.id;
    button.style.setProperty('--palette-choice-accent',palette.accent);
    button.style.setProperty('--palette-choice-soft',palette.soft);
    const swatch = document.createElement('span');
    swatch.className = 'palette-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    swatch.append(controlIcon(palette.motif));
    const caption = document.createElement('span');
    caption.className = 'palette-caption';
    caption.textContent = t(palette.en, palette.id);
    button.setAttribute('aria-label', t(palette.en, palette.id));
    button.title = t(palette.en, palette.id);
    button.append(swatch, caption);
    button.onclick = () => { applyPalette(palette.key, target); sync(); };
    group.append(button);
  }
  function sync() {
    for (const button of group.querySelectorAll<HTMLButtonElement>('[data-palette-choice]')) {
      button.setAttribute('aria-pressed', String(button.dataset.paletteChoice === target.dataset.palette));
      button.querySelector('.palette-caption')!.textContent = t(button.dataset.en || '', button.dataset.id || '');
    }
  }
  sync();
  return sync;
}
