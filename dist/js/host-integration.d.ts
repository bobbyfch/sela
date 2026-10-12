// Generated from src/host-integration.ts by npm run build. Do not edit.
import type { Sela } from './sela.esm.js';
export { createReaderHost, mountReaderCommands, mountReaderDebug } from './host-controls.js';
export type { ReaderCommand, ReaderHostOptions, ReaderStorage, ReaderAnnotation, DocumentLoader, RendererAdapter, TextService } from './host-controls.js';
export interface SelaExtension {
    id: string;
    /** Called for each ready document. Keep host authentication outside diagnostics. */
    setup(viewer: Sela, signal: AbortSignal): void | (() => void);
}
/** Optional host integration, kept out of the core download. */
export declare function mountSelaExtension(viewer: Sela, extension: SelaExtension): () => void;
export declare function readerDiagnostics(viewer: Sela): Readonly<{
    version: string;
    open: boolean;
    mode: import("./sela.esm.js").SelaMode;
    page: number;
    pages: number;
    zoom: number;
}>;
