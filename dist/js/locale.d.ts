// Generated from src/locale.ts by npm run build. Do not edit.
export declare const APP_LANGUAGES: readonly [{
    readonly locale: "en-US";
    readonly name: "English";
    readonly base: "en";
    readonly country: "US";
}, {
    readonly locale: "id-ID";
    readonly name: "Bahasa Indonesia";
    readonly base: "id";
    readonly country: "ID";
}, {
    readonly locale: "ja-JP";
    readonly name: "日本語";
    readonly base: "ja";
    readonly country: "JP";
}];
export type AppLocale = typeof APP_LANGUAGES[number]['locale'];
export declare function normalizeLocale(value: string | undefined | null): AppLocale;
export declare function localeBase(value: string): string;
export declare function holidayCountry(value: string): string;
/** Select one of Sela's supported languages by country; unknown regions use English. */
export declare function localeForCountry(country: string | undefined | null): AppLocale;
