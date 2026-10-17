// Generated from app/library/shelf-interactions.ts by npm run build. Do not edit.
export function bindBookSelection(cover, checkbox) {
  const original = cover.onclick;
  const toggle = () => {
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  };
  cover.onclick = (event) => {
    if (document.body.dataset.selectionMode === "true") {
      event.preventDefault();
      toggle();
      return;
    }
    return original?.call(cover, event);
  };
}
