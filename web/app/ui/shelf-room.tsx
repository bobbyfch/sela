import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace, Texture } from 'three';
import type { PerspectiveCamera } from 'three';
import type { LibraryBook } from '../../../app/library/models.ts';
import { coverPixelsNeedFallback } from '../../../app/library/cover-analysis.ts';

const jackets = ['--cover-one', '--cover-two', '--cover-three', '--cover-four', '--cover-five', '--cover-six'];
const fallbackJackets = ['#c18a63', '#8aa27b', '#9181a3', '#718ea2', '#b77b70', '#b79b63'];
const colorCanvas = document.createElement('canvas');
colorCanvas.width = colorCanvas.height = 1;
const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
const resolvedColors = new Map<string, string>();

function threeColor(token: string, fallback: string) {
  const root = document.querySelector('.sela-app') || document.documentElement;
  const raw = getComputedStyle(root).getPropertyValue(token).trim() || fallback;
  const key = `${raw}|${fallback}`;
  const cached = resolvedColors.get(key);
  if (cached) return cached;
  if (!colorContext) return fallback;
  try {
    colorContext.fillStyle = fallback;
    colorContext.fillStyle = raw;
    colorContext.fillRect(0, 0, 1, 1);
    const [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
    const color = `#${[red, green, blue].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    resolvedColors.set(key, color);
    colorContext.clearRect(0, 0, 1, 1);
    return color;
  } catch {
    return fallback;
  }
}

function shelfRowMetrics(bookCount: number, compact: boolean) {
  const count = Math.max(1, bookCount);
  const scale = compact ? count === 1 ? 1.65 : count === 2 ? 1.42 : count === 3 ? 1.2 : count === 4 ? 1.1 : 1 : count === 1 ? 1.78 : count === 2 ? 1.52 : count === 3 ? 1.3 : count === 4 ? 1.16 : count === 5 ? 1.08 : 1;
  const spacing = compact ? count <= 2 ? 1.75 : count === 3 ? 1.45 : count === 4 ? 1.18 : count === 5 ? 0.9 : count === 6 ? 0.76 : 0.68 : count <= 2 ? 1.95 : count === 3 ? 1.62 : count === 4 ? 1.34 : count === 5 ? 1.08 : count === 6 ? 0.92 : 0.82;
  const coverWidth = 1.46 * scale * 0.667;
  const boardWidth = Math.max(compact ? count <= 2 ? 4.5 : 3.6 : count <= 2 ? 5.5 : 4.2, (count - 1) * spacing + coverWidth + 1.1);
  return { scale, spacing, boardWidth };
}

function ResponsiveCamera({ booksInRow }: { booksInRow: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const compact = size.width < 600;
    const compactDistances = [5.2, 4.8, 6.2, 7.1, 7.2, 7.5, 7.9, 8];
    const distance = compact
      ? compactDistances[Math.min(7, Math.max(1, booksInRow))]
      : booksInRow === 1 ? 4.4 : booksInRow === 2 ? 4.8 : booksInRow === 3 ? 5.2 : booksInRow === 4 ? 5.8 : booksInRow === 5 ? 6.2 : 6.8;
    const perspective = camera as PerspectiveCamera;
    perspective.position.set(0, 0.1, distance);
    perspective.lookAt(0, 0, 0);
    perspective.updateProjectionMatrix();
  }, [booksInRow, camera, size.width]);
  return null;
}

function fallbackCoverTexture(book: LibraryBook, index: number, jacketColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 680;
  const context = canvas.getContext('2d');
  if (!context) {
    canvas.width = canvas.height = 2;
    const fallback = canvas.getContext('2d');
    fallback?.fillRect(0, 0, 2, 2);
  } else {
    context.fillStyle = jacketColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const light = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    light.addColorStop(0, 'rgba(255,255,255,.28)');
    light.addColorStop(.46, 'rgba(255,255,255,.035)');
    light.addColorStop(1, 'rgba(24,22,18,.18)');
    context.fillStyle = light;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'rgba(255,255,255,.34)';
    context.lineWidth = 2;
    context.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
    context.strokeStyle = 'rgba(35,31,27,.2)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(58, 74);
    context.lineTo(162, 74);
    context.moveTo(58, 590);
    context.lineTo(422, 590);
    context.stroke();

    const motifX = index % 2 ? 358 : 348;
    const motifY = 162 + (index % 3) * 10;
    [76, 50, 24].forEach((radius, ring) => {
      context.beginPath();
      context.arc(motifX, motifY, radius, 0, Math.PI * 2);
      context.strokeStyle = ring === 1 ? 'rgba(35,31,27,.14)' : 'rgba(255,255,255,.28)';
      context.lineWidth = ring === 0 ? 2 : 1.5;
      context.stroke();
    });
    context.fillStyle = 'rgba(255,255,255,.17)';
    context.fillRect(52, 101, 7, 474);

    const title = book.metadata?.title || book.name || 'Untitled';
    const author = book.metadata?.author || 'Sela Books';
    const fontSize = title.length > 46 ? 27 : title.length > 27 ? 32 : 38;
    context.font = `600 ${fontSize}px Georgia, 'Times New Roman', serif`;
    context.fillStyle = '#25231f';
    context.textBaseline = 'top';
    const words = title.trim().split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > 350) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    const visibleLines = lines.slice(0, 7);
    if (lines.length > visibleLines.length) visibleLines[visibleLines.length - 1] = `${visibleLines.at(-1)?.replace(/[.,;:]?$/, '')}…`;
    visibleLines.forEach((text, lineIndex) => context.fillText(text, 58, 268 + lineIndex * (fontSize + 12), 352));

    context.font = '600 14px system-ui, sans-serif';
    context.fillStyle = 'rgba(37,35,31,.74)';
    context.fillText(author.toLocaleUpperCase(), 58, 612, 354);
    context.font = '12px system-ui, sans-serif';
    context.fillStyle = 'rgba(37,35,31,.54)';
    context.fillText('SELA · OPEN EDITION', 58, 634, 354);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function coverImageIsUseful(image: HTMLImageElement) {
  if (image.naturalWidth < 2 || image.naturalHeight < 2) return false;
  try {
    const sample = document.createElement('canvas');
    sample.width = 40;
    sample.height = 56;
    const context = sample.getContext('2d', { willReadFrequently: true });
    if (!context) return false;
    context.drawImage(image, 0, 0, sample.width, sample.height);
    return !coverPixelsNeedFallback(context.getImageData(0, 0, sample.width, sample.height).data);
  } catch {
    return false;
  }
}

function CoverArt({ book, width, height, depth, scale, index, jacketColor }: { book: LibraryBook; width: number; height: number; depth: number; scale: number; index: number; jacketColor: string }) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const invalidate = useThree(state => state.invalidate);

  useEffect(() => {
    const fallback = fallbackCoverTexture(book, index, jacketColor);
    setTexture(fallback);
    invalidate();
    if (!book.cover) return;

    let active = true;
    const image = new Image();
    let url = '';
    image.onload = () => {
      if (!active) return;
      if (!coverImageIsUseful(image)) return;
      const loaded = new Texture(image);
      loaded.colorSpace = SRGBColorSpace;
      loaded.needsUpdate = true;
      setTexture(loaded);
      invalidate();
    };
    image.onerror = () => { /* Keep the designed fallback cover visible. */ };
    try {
      url = URL.createObjectURL(book.cover);
      image.src = url;
    } catch {
      return () => { active = false; image.onload = null; image.onerror = null; fallback.dispose(); };
    }

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
      if (url) URL.revokeObjectURL(url);
      fallback.dispose();
    };
  }, [book, book.cover, book.metadata?.title, book.metadata?.author, index, jacketColor, invalidate]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;
  return <mesh position={[0, 0, depth / 2 + 0.008]}>
    <planeGeometry args={[width - 0.035 * scale, height - 0.035 * scale]} />
    <meshBasicMaterial map={texture} toneMapped={false} />
  </mesh>;
}

function Spine({ book, index, position, scale, onOpen }: { book: LibraryBook; index: number; position: [number, number, number]; scale: number; onOpen: (book: LibraryBook) => void }) {
  const height = (1.34 + (index % 4) * 0.04) * scale;
  const width = height * 0.667;
  const depth = 0.2 * scale;
  const color = threeColor(jackets[index % jackets.length], fallbackJackets[index % fallbackJackets.length]);
  const pages = threeColor('--color-paper-raised', '#eee8dc');
  return <group position={position} rotation={[0, (index % 2 ? 1 : -1) * 0.07, 0]} onClick={() => onOpen(book)}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.78} />
    </mesh>
    <mesh position={[0, 0, -0.002]} castShadow>
      <boxGeometry args={[width - 0.035, height - 0.045, depth * 0.72]} />
      <meshStandardMaterial color={pages} roughness={0.96} />
    </mesh>
    <mesh position={[-width * 0.43, 0, depth * 0.51]}>
      <boxGeometry args={[width * 0.07, height * 0.94, 0.008]} />
      <meshStandardMaterial color={threeColor('--color-glass-highlight', '#ffffff')} transparent opacity={0.16} roughness={0.5} />
    </mesh>
    <CoverArt book={book} width={width} height={height} depth={depth} scale={scale} index={index} jacketColor={fallbackJackets[index % fallbackJackets.length]} />
  </group>;
}

function ShelfBoards({ finish, rowCounts, singleRow }: { finish: string; rowCounts: number[]; singleRow: boolean }) {
  const { size } = useThree();
  const compact = size.width < 720;
  const levels = singleRow ? [0.05] : [-1.32, 0.7];
  const woodToken = finish === 'oak' ? '--shelf-oak' : finish === 'olive' ? '--shelf-olive' : '--shelf-ink';
  const wood = threeColor(woodToken, '#8e806c');
  const hardware = threeColor('--color-muted', '#766c5c');
  return <>
    {levels.map((y, row) => {
      const width = shelfRowMetrics(rowCounts[row] || 1, compact).boardWidth;
      return <group key={y}>
      <mesh position={[0, y, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.15, 0.9]} />
        <meshStandardMaterial color={wood} roughness={0.7} />
      </mesh>
      {[-width * 0.34, width * 0.34].map(x => <group key={x}>
        <mesh position={[x, y - 0.14, -0.47]} castShadow>
          <boxGeometry args={[0.045, 0.28, 0.045]} />
          <meshStandardMaterial color={hardware} roughness={0.58} metalness={0.28} />
        </mesh>
        <mesh position={[x, y - 0.17, -0.2]} castShadow>
          <boxGeometry args={[0.045, 0.045, 0.58]} />
          <meshStandardMaterial color={hardware} roughness={0.58} metalness={0.28} />
        </mesh>
      </group>)}
    </group>;
    })}
  </>;
}

function BookRow({ books, row, singleRow, onOpen }: { books: LibraryBook[]; row: number; singleRow: boolean; onOpen: (book: LibraryBook) => void }) {
  const { size } = useThree();
  const compact = size.width < 720;
  const start = row === 0 ? 0 : 7;
  const rowBooks = books.slice(start, start + 7);
  const metrics = shelfRowMetrics(rowBooks.length, compact);
  const floor = singleRow ? 0.125 : row === 0 ? -1.245 : 0.775;
  return <>{rowBooks.map((book, column) => {
    const index = start + column;
    const height = (1.34 + (index % 4) * 0.04) * metrics.scale;
    const x = (column - (rowBooks.length - 1) / 2) * metrics.spacing;
    return <Spine key={book.id} book={book} index={index} position={[x, floor + height / 2, 0.18]} scale={metrics.scale} onOpen={onOpen} />;
  })}</>;
}

export default function ShelfRoom({ books, finish, onOpen }: { books: LibraryBook[]; finish: string; onOpen: (book: LibraryBook) => void }) {
  const visible = books.slice(0, 14);
  const singleRow = visible.length <= 7;
  const rowCounts = singleRow ? [visible.length] : [Math.min(7, visible.length), visible.length - 7];
  const booksInRow = Math.max(...rowCounts);
  return <div className="shelf-room" role="img" aria-label={`${visible.length} books displayed on floating wall shelves. Use the book list below to open one.`}>
    <Canvas frameloop="demand" dpr={[1, 1.35]} shadows="percentage" camera={{ position: [0, 0.1, 7.8], fov: 36 }} gl={{ alpha: true, antialias: true }}>
      <ResponsiveCamera booksInRow={booksInRow} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[-3.5, 5.5, 6]} intensity={2.15} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0002} />
      <ShelfBoards finish={finish} rowCounts={rowCounts} singleRow={singleRow} />
      <BookRow books={visible} row={0} singleRow={singleRow} onOpen={onOpen} />
      {!singleRow && <BookRow books={visible} row={1} singleRow={false} onOpen={onOpen} />}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={1.48} maxPolarAngle={1.66} minAzimuthAngle={-0.16} maxAzimuthAngle={0.16} />
    </Canvas>
  </div>;
}
