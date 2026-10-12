// Generated from app/library/cover-transition.ts by npm run build. Do not edit.
let active;
export function beginCoverTransition(source) {
  active?.();
  const idle = { ready() {
  }, close() {
  }, cancel() {
  } };
  if (!source || matchMedia("(prefers-reduced-motion: reduce)").matches || !source.animate) return idle;
  const origin = source.getBoundingClientRect();
  if (origin.width < 1 || origin.height < 1 || origin.bottom < 0 || origin.top > innerHeight) return idle;
  const scroll = { x: scrollX, y: scrollY };
  const snapshot = source.cloneNode(true);
  const computed = getComputedStyle(source);
  for (const property of ["display", "flex-direction", "justify-content", "align-items", "gap", "padding", "background", "color", "border", "border-radius", "font", "text-align"]) snapshot.style.setProperty(property, computed.getPropertyValue(property));
  const originals = source.querySelectorAll("*");
  snapshot.querySelectorAll("*").forEach((node, index) => {
    const original = originals[index];
    if (!original) return;
    const style = getComputedStyle(original);
    for (const property of ["position", "inset", "width", "height", "object-fit", "font", "color", "text-align", "display"]) node.style.setProperty(property, style.getPropertyValue(property));
  });
  snapshot.removeAttribute("id");
  snapshot.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  snapshot.setAttribute("aria-hidden", "true");
  snapshot.inert = true;
  snapshot.className = "cover-transition";
  Object.assign(snapshot.style, { position: "fixed", left: origin.left + "px", top: origin.top + "px", width: origin.width + "px", height: origin.height + "px", margin: "0", pointerEvents: "none", zIndex: "2147483647" });
  document.body.append(snapshot);
  const scale = Math.min(1.8, (innerWidth - 48) / origin.width, innerHeight * 0.6 / origin.height);
  const transform = `translate(${innerWidth / 2 - origin.left - origin.width / 2}px, ${innerHeight / 2 - origin.top - origin.height / 2}px) scale(${scale})`;
  let animation;
  let timer;
  let cancelled = false;
  const clean = () => {
    animation?.cancel();
    clearTimeout(timer);
    snapshot.remove();
  };
  const cancel = () => {
    cancelled = true;
    clean();
    if (active === cancel) active = void 0;
  };
  active = cancel;
  animation = snapshot.animate([{ transform: "scale(.97)", opacity: 1 }, { transform, opacity: 1 }], { duration: 320, easing: "cubic-bezier(.22,.8,.2,1)", fill: "forwards" });
  timer = setTimeout(clean, 1200);
  return {
    ready() {
      if (cancelled || !snapshot.isConnected) return;
      animation?.cancel();
      animation = snapshot.animate([{ transform, opacity: 1 }, { transform, opacity: 0 }], { duration: 160, fill: "forwards" });
      void animation.finished.then(clean, clean);
    },
    close() {
      if (cancelled) return;
      clean();
      scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cancel();
        return;
      }
      document.body.append(snapshot);
      animation = snapshot.animate([{ transform, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 240, easing: "cubic-bezier(.22,.8,.2,1)", fill: "forwards" });
      void animation.finished.then(cancel, cancel);
      timer = setTimeout(cancel, 500);
    },
    cancel
  };
}
