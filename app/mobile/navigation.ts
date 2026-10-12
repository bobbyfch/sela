export type AppTab = 'home' | 'library' | 'browse' | 'settings';
export interface NavigationMount {
  nav: HTMLElement;
  navigate: (tab: AppTab) => void;
  translate: (english: string, indonesian: string) => string;
}
declare global {
  interface DocumentEventMap {
    'sela:navigation-mount': CustomEvent<NavigationMount>;
    'sela:navigation-change': CustomEvent<AppTab>;
    'sela:navigation-localize': Event;
  }
}
