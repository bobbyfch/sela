// Generated from app/library/glass-navigation.ts by npm run build. Do not edit.
export function mountGlassNavigation(nav) {
  nav.classList.add("glass-navigation");
  const buttons = Array.from(nav.querySelectorAll("button[data-tab]"));
  const indicator = document.createElement("span");
  indicator.className = "glass-navigation-indicator";
  indicator.setAttribute("aria-hidden", "true");
  nav.prepend(indicator);
  nav.style.setProperty("--nav-count", String(buttons.length));
  const controller = new AbortController();
  nav.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }, { signal: controller.signal });
  return {
    select(tab) {
      const index = buttons.findIndex((button) => button.dataset.tab === tab);
      if (index < 0) return;
      nav.style.setProperty("--nav-index", String(index));
      for (const [i, button] of buttons.entries()) button.setAttribute("aria-current", String(i === index));
    },
    destroy() {
      controller.abort();
      indicator.remove();
      nav.classList.remove("glass-navigation");
    }
  };
}
