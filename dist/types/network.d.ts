// Generated from src/network.ts by npm run build. Do not edit.
export declare const MAX_IMPORT: number;
export declare function fetchFile(url: string, name: string, { headers, signal }?: {
    headers?: HeadersInit;
    signal?: AbortSignal;
}): Promise<File>;
export declare function link(parent: HTMLElement, label: string, url: string): HTMLAnchorElement;
export declare function node<K extends keyof HTMLElementTagNameMap>(parent: HTMLElement, tag: K, text?: string, className?: string): HTMLElementTagNameMap[K];
export declare function responseText(response: Response, limit?: number): Promise<string>;
