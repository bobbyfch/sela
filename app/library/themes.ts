/** Style palettes are independent from the light/dark scene preference. */
export const palettes = ['white', 'kids', 'cyberpunk', 'forest', 'sakura', 'ocean', 'lavender', 'citrus'];

const legacyPalettes: Record<string, string> = {
  dark: 'white', oled: 'white', charcoal: 'white', oak: 'forest', walnut: 'lavender',
  paper: 'white', linen: 'ocean', rimba: 'forest', nila: 'lavender', seroja: 'sakura',
  ink: 'lavender', rose: 'sakura'
};
const paletteKey = 'sela-library:palette';
const themeKey = 'sela-library:theme';
const paletteVersion = '4';

function normalizePalette(value: string | null): string {
  const normalized = value ? legacyPalettes[value] || value : 'white';
  return palettes.includes(normalized) ? normalized : 'white';
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
  if (requested && (palettes.includes(requested) || requested in legacyPalettes)) {
    initial = normalizePalette(requested);
    url.searchParams.delete('palette');
    history.replaceState(history.state, '', url);
  }
  applyPalette(initial);
  applyOled(localStorage.getItem('sela-library:oled') === 'true');
}

export function applyPalette(value: string, target = document.documentElement) {
  const chosen = normalizePalette(value);
  target.dataset.palette = chosen;
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
  const options = [
    ['white', 'Snow', 'Salju'], ['kids', 'Kids colors', 'Warna ceria'], ['cyberpunk', 'Akihabara', 'Akihabara'],
    ['forest', 'Forest', 'Hutan'], ['sakura', 'Sakura', 'Sakura'], ['ocean', 'Ocean', 'Laut'],
    ['lavender', 'Lavender', 'Lavender'], ['citrus', 'Citrus', 'Jeruk']
  ];
  for (const [key, en, id] of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.paletteChoice = key;
    button.dataset.en = en;
    button.dataset.id = id;
    const swatch = document.createElement('i');
    swatch.setAttribute('aria-hidden', 'true');
    const caption = document.createElement('span');
    caption.textContent = t(en, id);
    button.append(swatch, caption);
    button.onclick = () => { applyPalette(key, target); sync(); };
    group.append(button);
  }
  function sync() {
    for (const button of group.querySelectorAll<HTMLButtonElement>('[data-palette-choice]')) {
      button.setAttribute('aria-pressed', String(button.dataset.paletteChoice === target.dataset.palette));
      button.querySelector('span')!.textContent = t(button.dataset.en || '', button.dataset.id || '');
    }
  }
  sync();
  return sync;
}
