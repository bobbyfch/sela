// Generated from app/library/cover-analysis.ts by npm run build. Do not edit.
export function coverPixelsNeedFallback(pixels) {
  const pixelCount = Math.floor(pixels.length / 4);
  if (pixelCount < 4) return true;
  let luminanceSum = 0;
  let squaredLuminanceSum = 0;
  let nearBlackPixels = 0;
  let transparentPixels = 0;
  for (let index = 0; index < pixelCount; index++) {
    const offset = index * 4;
    const alpha = pixels[offset + 3] ?? 0;
    const luminance = 0.2126 * (pixels[offset] ?? 0) + 0.7152 * (pixels[offset + 1] ?? 0) + 0.0722 * (pixels[offset + 2] ?? 0);
    luminanceSum += luminance;
    squaredLuminanceSum += luminance * luminance;
    if (alpha < 18) transparentPixels++;
    if (luminance < 30 && alpha > 18) nearBlackPixels++;
  }
  if (transparentPixels / pixelCount > 0.92) return true;
  const average = luminanceSum / pixelCount;
  const variance = Math.max(0, squaredLuminanceSum / pixelCount - average * average);
  return average < 32 && nearBlackPixels / pixelCount > 0.95 && variance < 600;
}
