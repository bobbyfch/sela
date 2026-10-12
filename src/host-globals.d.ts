import type { Sela } from './public-api.ts';
interface PlatformCapabilities {mobile: boolean; ios: boolean; desktop: boolean; safari: boolean; modern: boolean;}
interface ReleaseStatus {checked: number; version: string; available: boolean; url: string;}
type ReleaseRequest = (url: string, options: RequestInit) => Promise<{ok: boolean; status?: number; json(): Promise<unknown>}>;
interface ReleaseUpdates {check(current: string, request?: ReleaseRequest): Promise<ReleaseStatus>; newer(remote: string, current: string): boolean;}
declare global {
  var Sela: typeof import('./public-api.ts').Sela;
  var SelaReady: Promise<typeof Sela>;
  var SelaPlatform: PlatformCapabilities;
  var SelaUpdates: ReleaseUpdates;
  /** Optional externally supplied DjVu decoder; never bundled into the MIT viewer. */
  var DjVu: any;
  interface Window {
    SelaReady: Promise<typeof Sela>;
    SelaPlatform: PlatformCapabilities;
    SelaUpdates: ReleaseUpdates;
    DjVu: any;
    __selaAttribution?: boolean;
  }
}
