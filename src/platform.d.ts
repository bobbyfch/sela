export {};
declare global {
 interface Navigator { standalone?: boolean; }
 interface Document { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void>; }
 interface Window { launchQueue?: {setConsumer(callback: (launch: {files?: Array<{getFile(): Promise<File>}>}) => void): void}; }
}
