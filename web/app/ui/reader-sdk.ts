const readerSdkPath = ['/dist', 'js', 'sela.esm.js'].join('/');

export async function loadReaderSdk() {
  return import(/* @vite-ignore */ new URL(readerSdkPath, window.location.origin).href);
}
