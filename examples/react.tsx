import { useEffect, useRef } from 'react';
import Sela, { type FlippyMode } from '@bobbyfch/sela';

export function PdfButton({ url, mode = 'book', onError = console.error }: {
  url: string; mode?: FlippyMode; onError?: (error: Error) => void;
}) {
  const viewer = useRef<Sela | null>(null);
  useEffect(() => {
    const instance = new Sela({ pdfUrl: url, mode, soundEnabled: false });
    viewer.current = instance;
    return () => { instance.destroy(); viewer.current = null; };
  }, [url, mode]);
  return <button type="button" onClick={() => {
    viewer.current?.open().catch(error => { if (error.name !== 'AbortError') onError(error); });
  }}>Read PDF</button>;
}
