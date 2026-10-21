/** Audio stays on-device: the reader never fetches third-party music or ambience. */
type AmbientKind = 'rain' | 'wind' | 'stream' | 'waves';

const ambientChoices: [AmbientKind, string, string, string, string][] = [
  ['rain', 'Rain', 'Hujan', 'Soft filtered rain', 'Hujan halus'],
  ['wind', 'Wind', 'Angin', 'A slow, low breeze', 'Semilir pelan'],
  ['stream', 'Stream', 'Aliran air', 'A gentle flowing sound', 'Aliran air lembut'],
  ['waves', 'Waves', 'Ombak', 'Slow, distant waves', 'Ombak jauh yang pelan']
];

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent: HTMLElement): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  parent.append(element);
  return element;
}

function makeAmbient(context: AudioContext, kind: AmbientKind) {
  const source = context.createBufferSource();
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < samples.length; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.025 * white) / 1.025;
    samples[i] = kind === 'stream' ? white * 0.55 + brown * 2.1 : brown * 3.2;
  }
  source.buffer = buffer;
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = kind === 'stream' ? 'bandpass' : 'lowpass';
  filter.frequency.value = kind === 'rain' ? 1550 : kind === 'wind' ? 360 : kind === 'stream' ? 780 : 430;
  filter.Q.value = kind === 'stream' ? 0.7 : 0.45;
  const gain = context.createGain();
  gain.gain.value = kind === 'rain' ? 0.08 : kind === 'stream' ? 0.055 : 0.07;
  source.connect(filter).connect(gain).connect(context.destination);

  let oscillator: OscillatorNode | undefined;
  let modulation: GainNode | undefined;
  if (kind === 'wind' || kind === 'waves') {
    oscillator = context.createOscillator();
    modulation = context.createGain();
    oscillator.frequency.value = kind === 'waves' ? 0.09 : 0.055;
    modulation.gain.value = kind === 'waves' ? 0.025 : 0.018;
    oscillator.connect(modulation).connect(gain.gain);
    oscillator.start();
  }
  source.start();
  return { source, oscillator, filter, gain };
}

export function mountAudio(reader: any, parent: HTMLElement, t: (en: string, id: string) => string) {
  const audioSection = node('section', 'reader-audio-card tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface/80 tw:p-4 tw:shadow-sm tw:backdrop-blur-xl', parent);
  audioSection.setAttribute('aria-labelledby', 'reader-audio-heading');
  const audioHeading = node('h3', 'tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink', audioSection);
  audioHeading.id = 'reader-audio-heading';
  audioHeading.textContent = t('Audiobook', 'Audio buku');
  const audioHelp = node('p', 'tw:mb-3 tw:mt-1 tw:text-xs tw:leading-5 tw:text-sela-muted', audioSection);
  audioHelp.textContent = t('Choose an audio file on this device, or use narration included with this EPUB.', 'Pilih audio dari perangkat ini atau gunakan narasi yang disertakan di EPUB.');

  const audio = node('audio', 'tw:mb-2 tw:block tw:w-full', audioSection);
  audio.controls = true;
  audio.preload = 'metadata';
  audio.setAttribute('aria-label', t('Audiobook controls', 'Kontrol audio buku'));
  const fileRow = node('div', 'tw:flex tw:flex-wrap tw:items-center tw:gap-2', audioSection);
  // This is a custom utility declared without Tailwind's `tw:` prefix.
  const input = node('input', 'sr-only', fileRow) as HTMLInputElement;
  input.type = 'file';
  input.accept = 'audio/*,.mp3,.m4a,.ogg,.opus,.wav,.flac,.aac';
  input.setAttribute('aria-label', t('Choose an audio file', 'Pilih berkas audio'));
  const choose = node('button', 'tw:inline-flex tw:min-h-10 tw:items-center tw:gap-2 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:text-xs tw:font-semibold tw:text-sela-ink tw:transition hover:tw:border-sela-accent/60 focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent', fileRow) as HTMLButtonElement;
  choose.type = 'button';
  choose.textContent = t('Choose audio', 'Pilih audio');
  choose.onclick = () => input.click();
  const filename = node('span', 'tw:min-w-0 tw:truncate tw:text-xs tw:text-sela-muted', fileRow);
  filename.textContent = t('No audio selected', 'Belum ada audio dipilih');

  let objectURL = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let context: AudioContext | undefined;
  let ambient: ReturnType<typeof makeAmbient> | undefined;
  let ambientKind: AmbientKind = 'rain';
  let closed = false;
  const lifetime = new AbortController();
  const status = node('p', 'tw:mb-0 tw:mt-2 tw:min-h-5 tw:break-words tw:text-xs tw:text-sela-muted', audioSection);
  status.setAttribute('role', 'status');
  audio.addEventListener('error', () => { status.textContent = t('This audio cannot play on this device.', 'Audio ini tidak bisa diputar di perangkat ini.'); });

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/') || file.size > 256 * 1048576) {
      status.textContent = t('Choose an audio file smaller than 256 MiB.', 'Pilih audio di bawah 256 MiB.');
      input.value = '';
      return;
    }
    audio.pause();
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = URL.createObjectURL(file);
    audio.src = objectURL;
    filename.textContent = file.name;
    status.textContent = t('Audio stays on this device.', 'Audio tetap di perangkat ini.');
    input.value = '';
  };

  const sleep = node('fieldset', 'tw:mt-3 tw:border-0 tw:p-0', audioSection);
  const sleepLegend = node('legend', 'tw:mb-2 tw:text-xs tw:font-medium tw:text-sela-muted', sleep);
  sleepLegend.textContent = t('Stop audio after', 'Hentikan audio setelah');
  const timerGrid = node('div', 'tw:grid tw:grid-cols-4 tw:gap-2', sleep);
  const timerButtons: HTMLButtonElement[] = [];
  let timerMinutes = 0;
  for (const [minutes, en, id] of [[0, 'Off', 'Mati'], [15, '15 min', '15 mnt'], [30, '30 min', '30 mnt'], [60, '60 min', '60 mnt']] as const) {
    const button = node('button', 'tw:min-h-9 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-surface tw:px-2 tw:text-[11px] tw:font-medium tw:text-sela-ink tw:transition hover:tw:border-sela-accent/60 focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent aria-pressed:tw:border-sela-accent aria-pressed:tw:bg-sela-accent/10', timerGrid) as HTMLButtonElement;
    button.type = 'button';
    button.textContent = t(en, id);
    button.setAttribute('aria-pressed', String(minutes === timerMinutes));
    button.onclick = () => {
      timerMinutes = minutes;
      timerButtons.forEach((item, index) => item.setAttribute('aria-pressed', String([0, 15, 30, 60][index] === minutes)));
      clearTimeout(timer);
      if (minutes) timer = setTimeout(() => {
        audio.pause();
        ambient?.source.stop();
        ambient?.oscillator?.stop();
        ambient = undefined;
        void context?.suspend();
        ambienceButtons.forEach(item => item.setAttribute('aria-pressed', 'false'));
        timerMinutes = 0;
        timerButtons.forEach((item, index) => item.setAttribute('aria-pressed', String(index === 0)));
        status.textContent = t('Sleep timer finished.', 'Timer tidur selesai.');
      }, minutes * 60_000);
    };
    timerButtons.push(button);
  }

  const roomSection = node('section', 'reader-room-card tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface/80 tw:p-4 tw:shadow-sm tw:backdrop-blur-xl', parent);
  roomSection.setAttribute('aria-labelledby', 'reader-room-heading');
  const roomHeading = node('h3', 'tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink', roomSection);
  roomHeading.id = 'reader-room-heading';
  roomHeading.textContent = t('Room atmosphere', 'Suasana ruang');
  const roomHelp = node('p', 'tw:mb-3 tw:mt-1 tw:text-xs tw:leading-5 tw:text-sela-muted', roomSection);
  roomHelp.textContent = t('Soft sounds are made in your browser. No music service, account, or network audio is used.', 'Suara lembut dibuat langsung di browser. Tidak memakai layanan musik, akun, atau audio jaringan.');
  const ambienceGrid = node('div', 'tw:grid tw:grid-cols-2 tw:gap-2 tw:sm:grid-cols-4', roomSection);
  const ambienceButtons: HTMLButtonElement[] = [];
  function stopAmbient() {
    ambient?.source.stop();
    ambient?.oscillator?.stop();
    ambient = undefined;
    ambienceButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  }
  for (const [kind, en, id, enNote, idNote] of ambientChoices) {
    const button = node('button', 'tw:flex tw:min-h-[76px] tw:min-w-0 tw:flex-col tw:items-start tw:justify-center tw:gap-1 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:py-2 tw:text-left tw:transition hover:tw:border-sela-accent/60 focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent aria-pressed:tw:border-sela-accent aria-pressed:tw:bg-sela-accent/10', ambienceGrid) as HTMLButtonElement;
    button.type = 'button';
    button.dataset.ambience = kind;
    const label = node('span', 'tw:text-xs tw:font-semibold tw:text-sela-ink', button);
    const note = node('span', 'tw:text-[10px] tw:leading-4 tw:text-sela-muted', button);
    label.textContent = t(en, id);
    note.textContent = t(enNote, idNote);
    button.setAttribute('aria-label', t(en, id) + ' · ' + t(enNote, idNote));
    button.setAttribute('aria-pressed', 'false');
    button.onclick = async () => {
      try {
        if (ambientKind === kind && ambient) {
          stopAmbient();
          await context?.suspend();
          return;
        }
        stopAmbient();
        context ||= new AudioContext();
        ambientKind = kind;
        ambient = makeAmbient(context, kind);
        await context.resume();
        button.setAttribute('aria-pressed', 'true');
      } catch {
        stopAmbient();
        status.textContent = t('Room sound is unavailable in this browser.', 'Suasana audio belum tersedia di browser ini.');
      }
    };
    ambienceButtons.push(button);
  }

  // EPUB Media Overlays use only embedded assets; no remote audio is fetched.
  const files = reader.book?.files, chapters = reader.book?.chapters;
  if (files && chapters) {
    const clips: { src: string; page: number; anchor: string; start: number; end: number }[] = [];
    const time = (value: string | null) => {
      if (!value) return 0;
      value = value.replace(/^npt=/, '');
      if (/ms$/.test(value)) return parseFloat(value) / 1000;
      if (/min$/.test(value)) return parseFloat(value) * 60;
      if (/h$/.test(value)) return parseFloat(value) * 3600;
      if (/s$/.test(value)) return parseFloat(value);
      return value.split(':').reduce((n, v) => n * 60 + Number(v), 0);
    };
    const path = (value: string | null, base: string) => {
      if (!value) return null;
      const url = new URL(value, 'https://epub.invalid/' + base);
      return url.origin === 'https://epub.invalid' ? decodeURIComponent(url.pathname.slice(1)) : null;
    };
    for (const [name, bytes] of Object.entries(files).filter(([file]) => file.toLowerCase().endsWith('.smil')).slice(0, 128)) {
      if ((bytes as Uint8Array).length > 1048576) continue;
      const doc = new DOMParser().parseFromString(new TextDecoder().decode(bytes as Uint8Array), 'application/xml');
      if (doc.querySelector('parsererror')) continue;
      for (const par of [...doc.getElementsByTagNameNS('*', 'par')].slice(0, 2000 - clips.length)) {
        const a = par.getElementsByTagNameNS('*', 'audio')[0], text = par.getElementsByTagNameNS('*', 'text')[0];
        if (!a || !text) continue;
        try {
          const src = path(a.getAttribute('src'), name), chapter = path(text.getAttribute('src'), name), page = chapters.indexOf(chapter) + 1;
          const start = time(a.getAttribute('clipBegin')), end = time(a.getAttribute('clipEnd'));
          if (src && files[src] && /\.(mp3|m4a|ogg|wav|mp4)$/i.test(src) && files[src].length <= 64 * 1048576 && page > 0 && Number.isFinite(start) && end > start) {
            clips.push({src, page, anchor: new URL(text.getAttribute('src')!, 'https://epub.invalid/' + name).hash.slice(1), start, end});
          }
        } catch {}
      }
    }
    if (clips.length) {
      const play = node('button', 'tw:mt-2 tw:inline-flex tw:min-h-10 tw:items-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-3 tw:text-xs tw:font-semibold tw:text-primary-foreground tw:transition hover:tw:brightness-105 focus-visible:tw:outline-2 focus-visible:tw:outline-offset-2 focus-visible:tw:outline-sela-accent', audioSection) as HTMLButtonElement;
      play.type = 'button';
      play.textContent = t('Read along · EPUB narration', 'Baca bersama · narasi EPUB');
      let index = -1, activeURL = '', advancing = false;
      const next = async () => {
        if (advancing) return;
        advancing = true;
        try {
          if (closed || ++index >= clips.length) { audio.pause(); return; }
          const clip = clips[index];
          if (clip.src !== activeURL) {
            if (objectURL) URL.revokeObjectURL(objectURL);
            objectURL = URL.createObjectURL(new Blob([files[clip.src]], {type: /\.mp3$/i.test(clip.src) ? 'audio/mpeg' : /\.ogg$/i.test(clip.src) ? 'audio/ogg' : /\.wav$/i.test(clip.src) ? 'audio/wav' : 'audio/mp4'}));
            audio.src = objectURL;
            activeURL = clip.src;
          }
          if (audio.readyState < 1) await new Promise<void>((resolve, reject) => {
            const clear = () => { clearTimeout(timeout); audio.removeEventListener('loadedmetadata', ready); audio.removeEventListener('error', fail); lifetime.signal.removeEventListener('abort', fail); };
            const ready = () => { clear(); resolve(); }, fail = () => { clear(); reject(Error('Narration unavailable or reader closed')); };
            const timeout = setTimeout(fail, 15_000);
            audio.addEventListener('loadedmetadata', ready, {once: true}); audio.addEventListener('error', fail, {once: true}); lifetime.signal.addEventListener('abort', fail, {once: true});
            if (closed) fail();
          });
          if (closed) return;
          audio.currentTime = clip.start;
          await reader.book.goToLocation({page: clip.page, anchor: clip.anchor});
          await audio.play();
        } finally { advancing = false; }
      };
      audio.addEventListener('timeupdate', () => {
        if (index >= 0 && audio.currentTime >= clips[index]?.end) { index = Math.min(index, clips.length); void next().catch(error => { audio.pause(); status.textContent = error.message; }); }
      });
      play.onclick = () => { index = clips.findIndex(clip => clip.page >= reader.currentPage()) - 1; void next().catch(error => { audio.pause(); status.textContent = error.message; }); };
      input.addEventListener('change', () => { index = -1; activeURL = ''; });
    }
  }

  const visibility = () => { if (document.hidden) void context?.suspend(); else if (ambient) void context?.resume(); };
  document.addEventListener('visibilitychange', visibility);
  return () => {
    closed = true;
    lifetime.abort();
    clearTimeout(timer);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    stopAmbient();
    if (objectURL) URL.revokeObjectURL(objectURL);
    void context?.close();
    document.removeEventListener('visibilitychange', visibility);
  };
}
