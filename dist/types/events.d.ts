// Generated from src/events.ts by npm run build. Do not edit.
import type { SelaMode } from './index.js';
export interface SelaEventMap {
    ready: {
        pages: number;
    };
    loading: {
        loading: boolean;
    };
    documentLoaded: {
        pages: number;
        format: string;
    };
    pagechange: {
        page: number;
    };
    pageChanged: {
        page: number;
    };
    progressChanged: {
        page: number;
        pages: number;
        progress: number;
    };
    modeChanged: {
        mode: SelaMode;
    };
    pageerror: {
        page: number;
        error: Error;
    };
    close: Record<string, never>;
    destroyed: Record<string, never>;
    error: {
        error: Error;
    };
    preferenceschange: Partial<import('./index.js').SelaOptions>;
}
export type SelaEventName = keyof SelaEventMap;
export type SelaEventListener<K extends SelaEventName> = (detail: SelaEventMap[K]) => void;
/** A disposer and an optional host signal keep subscriptions tied to mount lifetime. */
export declare function subscribe<K extends SelaEventName>(target: EventTarget, name: K, listener: SelaEventListener<K>, signal?: AbortSignal): () => void;
