export type SelaMode = 'book' | 'single' | 'scroll' | 'webtoon' | 'manga';
export interface SelaOptions {
  /** Inline embeds need a connected host with an explicit height. */
  presentation?: 'overlay' | 'inline';
  container?: HTMLElement | string;
  pdfUrl?: string;
  url?: string;
  data?: ArrayBuffer | Uint8Array;
  title?: string;
  language?: 'en' | 'id' | 'auto';
  mode?: SelaMode;
  fit?: 'page' | 'width' | 'original';
  persistPreferences?: boolean;
  lowPower?: boolean;
  fontSize?: number;
  lineHeight?: number;
  textMargin?: number;
  cropMargin?: number;
  fontFamily?: 'serif' | 'sans' | 'mono';
  textAlign?: 'start' | 'justify';
  onPreferences?: (preferences: Partial<SelaOptions>) => void;
  /** Optional audio provider. Enable online voices explicitly; keep API secrets on your server. */
  speechAdapter?: (text: string, options: { language: string; rate: number; signal: AbortSignal }) => Promise<Blob>;
  format?: 'auto' | 'pdf' | 'epub' | 'cbz' | 'djvu' | 'txt' | 'md' | 'html' | 'fb2';
  djvujsSrc?: string;
  djvuIntegrity?: string;
  pageGap?: number;
  wheelZoom?: boolean;
  paperTexture?: boolean;
  theme?: 'auto' | 'light' | 'dark';
  filter?: 'none' | 'grayscale' | 'sepia' | 'contrast' | 'warm' | 'cool' | 'night' | 'invert' | 'paper' | 'soft' | 'saturated' | 'lowblue';
  /** Document brightness: 0.35–1.25; 1 is unchanged. Does not change OS brightness. */
  brightness?: number;
  /** Dim reader chrome independently of document filters. */
  dim?: boolean;
  readingDirection?: 'ltr' | 'rtl';
  startPage?: number;
  id?: string | number;
  trigger?: HTMLElement;
  assetBase?: string;
  cssUrl?: string;
  autoStyles?: boolean;
  pdfBuild?: 'modern' | 'legacy';
  pdfjsSrc?: string;
  pdfWorkerSrc?: string;
  pdfjsLib?: { getDocument(options: unknown): unknown };
  cMapUrl?: string;
  standardFontDataUrl?: string;
  soundEnabled?: boolean;
  soundUrl?: string;
  maxScale?: number;
  maxCanvasPixels?: number;
  duration?: number;
  zIndex?: number;
  storagePrefix?: string;
  httpHeaders?: Record<string, string>;
  withCredentials?: boolean;
  password?: string;
  /** Legacy quality hint; prefer maxScale. */
  scale?: number;
  /** Legacy options accepted for source compatibility; automatic sizing/rendering replaces these. */
  pageWidth?: number;
  pageHeight?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  parallelRender?: number;
  jpegQuality?: number;
  onReady?: (detail: { pages: number }) => void;
  onClose?: (detail: object) => void;
  onPageChange?: (detail: { page: number }) => void;
  onPageError?: (detail: { page: number; error: Error }) => void;
  onError?: (detail: { error: Error }) => void;
}
export declare class Sela extends EventTarget {
  static readonly version: string;
  constructor(options?: SelaOptions);
  options: SelaOptions;
  readonly overlay: HTMLElement | null;
  readonly totalPages: number;
  readonly zoom: number;
  open(): Promise<this>;
  close(): void;
  destroy(): void;
  currentPage(): number;
  next(): this;
  prev(): this;
  goTo(page: number): this;
  nextPage(): this;
  prevPage(): this;
  goToPage(page: number): this;
  firstPage(): this;
  lastPage(): this;
  zoomIn(): this;
  zoomOut(): this;
  setZoom(value: number): this;
  setMode(mode: SelaMode): Promise<this>;
  setFit(value: NonNullable<SelaOptions['fit']>): this;
  setTypography(values: Pick<SelaOptions, 'fontSize' | 'lineHeight' | 'textMargin' | 'fontFamily' | 'textAlign'>): this;
  back(): this;
  showTools(): Promise<unknown>;
  getText(page?: number): Promise<string>;
  toggleFullscreen(): this;
  setFilter(value: NonNullable<SelaOptions['filter']>): this;
  setBrightness(value: number): this;
  setDim(value: boolean): this;
}
export declare const VERSION: string;
export { Sela as Flippy };
export type FlippyOptions = SelaOptions;
export type FlippyMode = SelaMode;
export default Sela;
declare global { interface Window { Flippy: typeof Sela; Sela: typeof Sela; } }
