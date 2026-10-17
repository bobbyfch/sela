// Generated from src/scriptures.ts by npm run build. Do not edit.
export type ScriptureFaith = 'islam' | 'protestantism' | 'catholicism' | 'buddhism' | 'hinduism' | 'confucianism';
export interface ScripturePassage {
    faith: ScriptureFaith;
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
export interface QuranChapter {
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
export interface ScriptureSection {
    reference: string;
    text: string;
    direction?: 'ltr' | 'rtl';
}
/** UI locales are id/en/ja; textLanguages records the actual languages offered by each source. */
export declare const SCRIPTURE_PROVIDERS: readonly [{
    readonly faith: "islam";
    readonly name: "QuranEnc · Kementerian Agama / Saheeh International / Saeed Sato";
    readonly textLanguages: readonly ["id", "en", "ja"];
    readonly appLanguages: readonly ["id", "en", "ja"];
    readonly requiresKey: false;
    readonly source: "https://quranenc.com/en/home/api/";
}, {
    readonly faith: "protestantism";
    readonly name: "World English Bible · eBible.org";
    readonly textLanguages: readonly ["en"];
    readonly appLanguages: readonly ["id", "en", "ja"];
    readonly requiresKey: false;
    readonly source: "https://ebible.org/engwebp/";
}, {
    readonly faith: "catholicism";
    readonly name: "Bible API · Lembaga Alkitab Indonesia";
    readonly textLanguages: readonly ["id"];
    readonly appLanguages: readonly ["id", "en", "ja"];
    readonly requiresKey: true;
    readonly source: "https://bible-api.alkitab.or.id/";
}, {
    readonly faith: "buddhism";
    readonly name: "SuttaCentral · Bhikkhu Sujato";
    readonly textLanguages: readonly ["en"];
    readonly appLanguages: readonly ["id", "en", "ja"];
    readonly requiresKey: false;
    readonly source: "https://suttacentral.net/api/docs/index.html";
}, {
    readonly faith: "hinduism";
    readonly name: "Bhagavad Gita API · Sanskrit source and English rendering";
    readonly textLanguages: readonly ["sa", "en"];
    readonly appLanguages: readonly ["id", "en", "ja"];
    readonly requiresKey: false;
    readonly source: "https://vedicscriptures.github.io/";
}, {
    readonly faith: "confucianism";
    readonly name: "Chinese Text Project · Analects";
    readonly textLanguages: readonly ["zh", "en"];
    readonly appLanguages: readonly ["id", "en", "ja"];
    readonly requiresKey: true;
    readonly source: "https://ctext.org/tools/api/ens";
}];
/** Fetch today's cited passage. The app locale chooses a source edition where one is available. */
export declare function getDailyScripture(faith: ScriptureFaith, language?: string, date?: Date, signal?: AbortSignal): Promise<ScripturePassage>;
/** List source-published Quran translations available in Indonesian, English or Japanese. */
export declare function getQuranTranslations(language?: string, signal?: AbortSignal): Promise<QuranTranslationEdition[]>;
/** Fetch one complete Quran surah from the selected QuranEnc translation. */
export declare function getQuranChapter(number: number, language?: string, signal?: AbortSignal, translationKey?: string): Promise<QuranChapter>;
/** Fetch a cited Buruja daily-remembrance collection. Arabic and the source's English meaning stay distinct. */
export declare function getIslamicReadingCollection(slug: string, signal?: AbortSignal): Promise<IslamicReadingCollection>;
/** Open a cited adhkar collection in a Sela reader document without changing the general viewer/CDN contract. */
export declare function openIslamicCollection(slug: string, title: string, openBook: (book: Record<string, unknown>) => unknown, uiLanguage?: string, signal?: AbortSignal): Promise<IslamicReadingCollection>;
/** Create a safe HTML document that can be passed to Sela as format: "html". */
export declare function createScriptureDocument(title: string, sections: ScriptureSection[], attribution: string): Blob;
