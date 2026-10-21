export function coverPixelsNeedFallback(pixels: ArrayLike<number>) {
  const pixelCount = Math.floor(pixels.length / 4);
  if (pixelCount < 4) return true;

  let luminanceSum = 0;
  let squaredLuminanceSum = 0;
  let darkPixels = 0;
  let transparentPixels = 0;
  for (let index = 0; index < pixelCount; index++) {
    const offset = index * 4;
    const alpha = pixels[offset + 3] ?? 0;
    const luminance = 0.2126 * (pixels[offset] ?? 0) + 0.7152 * (pixels[offset + 1] ?? 0) + 0.0722 * (pixels[offset + 2] ?? 0);
    luminanceSum += luminance;
    squaredLuminanceSum += luminance * luminance;
    if (alpha < 18) transparentPixels++;
    if (luminance < 18 && alpha > 18) darkPixels++;
  }

  if (transparentPixels / pixelCount > 0.92) return true;
  const average = luminanceSum / pixelCount;
  const variance = Math.max(0, squaredLuminanceSum / pixelCount - average * average);
  return average < 12 && darkPixels / pixelCount > 0.985 && variance < 64;
}
