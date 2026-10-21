export function resolveReaderSdkUrl(baseUrl: string | URL = document.baseURI): URL {
  const appBase = new URL('./', baseUrl);
  return new URL('../dist/js/sela.esm.js', appBase);
}

export async function loadReaderSdk() {
  const sdkUrl = resolveReaderSdkUrl();
  return import(/* @vite-ignore */ sdkUrl.href);
}
