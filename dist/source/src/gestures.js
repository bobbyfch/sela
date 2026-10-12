// Generated from src/gestures.ts by npm run build. Do not edit.
export function bindZoomGestures(container, owner, options) {
  const pointers = /* @__PURE__ */ new Map();
  let pinch = null;
  let pan = null;
  let frame = 0;
  let pendingZoom = null;
  let pendingPan = null;
  function flush() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (pendingZoom) {
      const { zoom, point } = pendingZoom;
      pendingZoom = null;
      owner.setZoom(zoom, point);
    }
    if (pendingPan) {
      const { x, y } = pendingPan;
      pendingPan = null;
      owner.panBy?.(x, y);
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(flush);
  }
  const center = () => {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const wheel = (event) => {
    if (event.target instanceof Element && event.target.closest("button,input,select,a") || !(event.ctrlKey || options.wheelZoom)) return;
    event.preventDefault();
    owner.setZoom(owner.zoom * Math.exp(-Math.max(-120, Math.min(120, event.deltaY)) * 6e-3), { x: event.clientX, y: event.clientY });
  };
  const distance = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const down = (event) => {
    if (event.pointerType !== "touch" || event.target instanceof Element && event.target.closest("button,input,select,a") || pointers.size >= 2) return;
    flush();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      pinch = { distance: Math.max(1, distance()), zoom: owner.zoom };
      pan = null;
      owner.beginGesture?.();
    } else if (owner.panBy && owner.zoom > 1) pan = { x: event.clientX, y: event.clientY };
    if (pointers.size === 2 || pan) try {
      container.setPointerCapture(event.pointerId);
    } catch {
    }
  };
  const move = (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) {
      event.preventDefault();
      pendingZoom = { zoom: pinch.zoom * distance() / pinch.distance, point: center() };
      schedule();
    } else if (pan && pointers.size === 1) {
      event.preventDefault();
      pendingPan = { x: (pendingPan?.x || 0) + pan.x - event.clientX, y: (pendingPan?.y || 0) + pan.y - event.clientY };
      pan = { x: event.clientX, y: event.clientY };
      schedule();
    }
  };
  const up = (event) => {
    if (!pointers.has(event.pointerId)) return;
    flush();
    pointers.delete(event.pointerId);
    if (pinch && pointers.size < 2) {
      pinch = null;
      owner.endGesture?.();
    }
    pan = null;
    if (pointers.size === 1 && owner.panBy && owner.zoom > 1) pan = { ...[...pointers.values()][0] };
  };
  const cancel = (event) => {
    if (event && !pointers.has(event.pointerId)) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pendingZoom = pendingPan = null;
    const active = !!pinch;
    pinch = pan = null;
    const ids = [...pointers.keys()];
    pointers.clear();
    if (active) owner.endGesture?.();
    for (const id of ids) try {
      container.releasePointerCapture(id);
    } catch {
    }
  };
  container.addEventListener("wheel", wheel, { passive: false });
  container.addEventListener("pointerdown", down);
  container.addEventListener("pointermove", move, { passive: false });
  container.addEventListener("pointerup", up);
  container.addEventListener("pointercancel", cancel);
  container.addEventListener("lostpointercapture", cancel);
  return () => {
    cancel();
    container.style.touchAction = "";
    container.removeEventListener("wheel", wheel);
    container.removeEventListener("pointerdown", down);
    container.removeEventListener("pointermove", move);
    container.removeEventListener("pointerup", up);
    container.removeEventListener("pointercancel", cancel);
    container.removeEventListener("lostpointercapture", cancel);
    pointers.clear();
  };
}
