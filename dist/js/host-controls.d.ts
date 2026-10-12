// Generated from src/host-controls.ts by npm run build. Do not edit.
import type { Sela, SelaSource } from './sela.esm.js';
export interface ReaderAnnotation {
    id: string;
    page: number;
    text: string;
    note?: string;
}
export interface ReaderStorage {
    read(key: string, signal: AbortSignal): Promise<readonly ReaderAnnotation[]>;
    write(key: string, annotations: readonly ReaderAnnotation[], signal: AbortSignal): Promise<void>;
}
export type TextService = (text: string, signal: AbortSignal) => Promise<string>;
export interface DocumentLoader {
    id: string;
    accepts(source: SelaSource): boolean;
    load(source: SelaSource, signal: AbortSignal): Promise<SelaSource>;
}
export interface RendererAdapter {
    id: string;
    accepts(source: SelaSource): boolean;
    /** Host renderers use their own container; they never replace internal SDK methods. */
    mount(container: HTMLElement, source: SelaSource, signal: AbortSignal): Promise<() => void>;
}
export interface ReaderHostOptions {
    container?: HTMLElement;
    loaders?: readonly DocumentLoader[];
    renderers?: readonly RendererAdapter[];
    storage?: ReaderStorage;
    documentKey?: string;
    dictionary?: TextService;
    translation?: TextService;
}
export interface ReaderCommand {
    id: string;
    label: string;
    run(context: {
        viewer: Sela;
        page: number;
        text: string;
        signal: AbortSignal;
    }): void | Promise<void>;
}
/** Host data/providers are opt-in. No tokens or document contents enter diagnostics. */
export declare function createReaderHost(viewer: Sela, options?: ReaderHostOptions): {
    open(source: SelaSource): Promise<{
        renderer: string;
    }>;
    dictionary: () => Promise<string>;
    translation: () => Promise<string>;
    annotations(): Promise<readonly ReaderAnnotation[]>;
    saveAnnotations(values: readonly ReaderAnnotation[]): Promise<void>;
    close(): void;
    destroy(): void;
};
/** Custom toolbars/context menus share one command contract and disposable lifetime. */
export declare function mountReaderCommands(viewer: Sela, container: HTMLElement, commands: readonly ReaderCommand[], kind?: 'toolbar' | 'context-menu'): () => void;
export declare function mountReaderDebug(viewer: Sela, container: HTMLElement): () => void;
