// Generated from src/scripture-sources.ts by npm run build. Do not edit.
export type FaithPreference = 'none' | 'islam' | 'protestantism' | 'catholicism' | 'buddhism' | 'hinduism' | 'confucianism';
/** Legacy ids remain readable for existing integrations; the preference UI only exposes Indonesia's six religions. */
export type FaithId = FaithPreference | 'christianity' | 'judaism' | 'sikhism';
export interface FaithReading {
    faith: FaithId;
    title: string;
    text: string;
    reference: string;
    attribution: string;
    sourceUrl: string;
    language: string;
    license?: string;
    direction?: 'ltr' | 'rtl';
}
export interface QuranVerse {
    sura: number;
    aya: number;
    arabic: string;
    translation: string;
    footnotes: string;
}
export interface QuranSurah {
    number: number;
    name: string;
    translationKey: string;
    translationTitle: string;
    version: string;
    language: string;
    verses: QuranVerse[];
    sourceUrl: string;
}
export interface QuranTranslationEdition {
    key: string;
    title: string;
    version: string;
    language: string;
    description: string;
}
export interface IslamicReadingItem {
    title: string;
    arabic: string;
    transliteration: string;
    meaning: string;
    reference: string;
    repeat: string;
    grade: string;
    note: string;
}
export interface IslamicReadingCollection {
    slug: string;
    name: string;
    arabicName: string;
    title: string;
    sourceNote: string;
    items: IslamicReadingItem[];
    sourceUrl: string;
}
export declare const QURAN_STUDY_SOURCES: {
    readonly kemenagSurah: "https://quran.kemenag.go.id/quran/per-ayat/surah/";
    readonly surahNames: "https://pustakalajnah.kemenag.go.id/detail/165";
    readonly revelationPeriod: "https://pustakalajnah.kemenag.go.id/detail/95";
    readonly asbabunNuzul: "https://pustakalajnah.kemenag.go.id/detail/93";
    readonly prophetStories: "https://pustakalajnah.kemenag.go.id/detail/35";
    readonly prophethood: "https://pustakalajnah.kemenag.go.id/detail/66";
    readonly tajweedLatinJuzAmma: "https://quran.kemenag.go.id/assets/files/Juz-Amma-Metode-Tilawah.pdf";
    readonly kemenagApi: "https://quran-api.lpmqkemenag.id/";
};
export declare function quranKemenagSurahUrl(number: number, verseCount?: number): string;
export declare const QURAN_PATTERN_BACKGROUND: string;
/** Deterministic, distinct geometric scene for each surah; decorative art only, not religious text. */
export declare function quranSceneBackgroundForSurah(number: number): string;
export declare const QURAN_SCENE_BACKGROUND: string;
export declare function quranSurahName(number: number): string;
export declare function quranSurahCatalog(): {
    number: number;
    name: string;
}[];
export declare function listQuranTranslations(language: string, signal?: AbortSignal): Promise<QuranTranslationEdition[]>;
export declare function loadQuranSurah(number: number, language: string, signal?: AbortSignal, translationKey?: string): Promise<QuranSurah>;
/** Chinese Text Project requires a registered IP or API key; keep this as a safe source link until a key is configured. */
export declare function faithSource(faith: FaithId): string;
export declare function loadFaithReading(faith: FaithId, language: string, date?: Date, signal?: AbortSignal): Promise<FaithReading | null>;
/** The Buruja content API publishes Arabic and English adhkar with citations; keep its edition and refs attached. */
export declare function loadIslamicReadingCollection(slug: string, signal?: AbortSignal): Promise<IslamicReadingCollection>;
export declare function openIslamicReadingInSela(slug: string, title: string, openBook: (book: Record<string, unknown>) => unknown, uiLanguage?: string, signal?: AbortSignal): Promise<IslamicReadingCollection>;
export declare function faithReadingHtml(title: string, rows: {
    reference: string;
    text: string;
    direction?: 'ltr' | 'rtl';
}[], attribution: string, language?: string): string;
export interface QuranDisplayOptions {
    translationKey?: string;
    arabicSize?: number;
    translationSize?: number;
    verse?: number;
}
export declare function openQuranInSela(number: number, language: string, openBook: (book: Record<string, unknown>) => unknown, signal?: AbortSignal, options?: QuranDisplayOptions): Promise<QuranSurah>;
export declare function openFaithReadingInSela(reading: FaithReading, openBook: (book: Record<string, unknown>) => unknown): Promise<void>;
