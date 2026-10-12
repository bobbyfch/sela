// Generated from app/library/controls.ts by npm run build. Do not edit.
import { translate } from "../dist/source/src/i18n.js";
export const iconPaths = {
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  read: "M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v16h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3ZM12 6v16",
  info: "M12 8h.01M11 12h1v5M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20",
  person: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5m1 7a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  palette: "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.7-3.1 1.8 1.8 0 0 1 1.5-2.8H18a3 3 0 0 0 3-3c0-5-4-9-9-9ZM7.5 12h.01M10 8h.01M15 8h.01",
  storage: "M4 5c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Zm0 0v7c0 1.1 3.6 2 8 2m8-9v4M4 12v7c0 1.1 3.6 2 8 2m8-9v8m0 0-3-3m3 3 3-3",
  cloud: "M7 18a5 5 0 1 1 .8-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8Zm5-8v9m-3-3 3 3 3-3",
  battery: "M5 8h14v12H5zM9 8V5h6v3m6 4h2v4h-2M8 12h8",
  sliders: "M4 6h9m4 0h3M4 12h3m4 0h9M4 18h9m4 0h3M13 4v4m-6 2v4m10 2v4",
  clock: "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  journal: "M5 3h14v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 5h8m-8 4h8m-8 4h5M7 3v18",
  sparkles: "m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
  chevron: "m9 18 6-6-6-6",
  search: "M21 21l-6-6M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16",
  plus: "M12 4v16M4 12h16",
  close: "M6 6l12 12M18 6 6 18",
  favorite: "m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
  collection: "M3 6h7l2 3h9v12H3ZM3 6V3h7l2 3h9v3",
  check: "m5 12 4 4L19 6",
  remove: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7",
  undo: "M3 10h11a7 7 0 0 1 0 14M3 10l6-6M3 10l6 6",
  share: "M12 16V2m-5 5 5-5 5 5M5 11v10h14V11",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM8 12l3 3 5-6",
  filter: "M4 6h16M7 12h10M10 18h4",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  refresh: "M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1",
  image: "M4 4h16v16H4zM4 16l5-5 4 4 2-2 5 5M15 9h.01",
  shelf: "M3 5h18M3 12h18M3 19h18M5 5v7m7-7v7m7-7v7M7 12v7m10-7v7",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z"
};
export function controlIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("control-symbol");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", iconPaths[name]);
  svg.append(path);
  return svg;
}
export function notify(message, tone = "info") {
  let toast = document.getElementById("status");
  if (!toast) {
    toast = document.createElement("p");
    toast.id = "status";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  if (toast.classList.contains("sr-only")) {
    toast.dataset.toastSrOnly = "true";
    toast.classList.remove("sr-only");
  }
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.dataset.visible = "true";
  const token = String(Date.now() + Math.random());
  toast.dataset.toastToken = token;
  window.setTimeout(() => {
    if (toast?.dataset.toastToken === token) {
      toast.textContent = "";
      delete toast.dataset.visible;
      if (toast.dataset.toastSrOnly === "true") {
        toast.classList.add("sr-only");
        delete toast.dataset.toastSrOnly;
      }
    }
  }, tone === "error" ? 6500 : 4200);
}
export function iconAction(button, name, label) {
  button.classList.add("icon-action");
  button.dataset.controlIcon = name;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.replaceChildren(controlIcon(name));
  if (name === "read") {
    button.classList.remove("icon-action");
    button.classList.add("read-action");
    const copy = document.createElement("span");
    copy.textContent = translate("Read", "Baca", document.documentElement.lang || "en-US");
    button.append(copy);
  }
  return button;
}
export function animateDialog(dialog) {
  const nativeClose = dialog.close.bind(dialog);
  let run = 0;
  let opener = null;
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialog.dataset.closing = "false";
    requestAnimationFrame(() => {
      if (document.querySelector(".library-reader-overlay") && !opener?.closest(".library-reader-overlay")) return;
      if (opener?.isConnected && opener.getClientRects().length && !opener.closest("dialog:not([open])")) opener.focus();
    });
  });
  const show = dialog.showModal.bind(dialog);
  dialog.showModal = () => {
    ++run;
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.dataset.closing = "false";
    show();
  };
  dialog.close = (value) => {
    if (!dialog.open) return;
    const token = ++run;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
      nativeClose(value);
      return;
    }
    dialog.dataset.closing = "true";
    setTimeout(() => {
      if (token === run && dialog.open) nativeClose(value);
    }, 180);
  };
  return () => {
    ++run;
    if (dialog.open) nativeClose();
  };
}
export function toolbar(label) {
  const element = document.createElement("div");
  element.className = "control-toolbar";
  element.setAttribute("role", "group");
  element.setAttribute("aria-label", label);
  return element;
}
export function bottomSheet(title, content) {
  const dialog = document.createElement("dialog");
  dialog.className = "control-sheet";
  const heading = document.createElement("h2");
  heading.textContent = title;
  const id = "sheet-" + crypto.randomUUID();
  heading.id = id;
  dialog.setAttribute("aria-labelledby", id);
  const close = iconAction(document.createElement("button"), "close", title + " \xB7 Close");
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  const header = document.createElement("header");
  header.className = "control-sheet-header";
  header.append(heading, close);
  dialog.append(header, content);
  document.body.append(dialog);
  const finish = animateDialog(dialog);
  return { element: dialog, setTitle(value, closeLabel = "Close") {
    heading.textContent = value;
    iconAction(close, "close", closeLabel);
  }, open() {
    if (!dialog.open) dialog.showModal();
  }, close() {
    dialog.close();
  }, destroy() {
    finish();
    dialog.remove();
  } };
}
export function segmentedControl(label, choices, initial, change) {
  const group = toolbar(label);
  group.classList.add("control-segmented");
  for (const choice of choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.label;
    button.dataset.value = choice.value;
    button.setAttribute("aria-pressed", String(choice.value === initial));
    button.onclick = () => {
      for (const sibling of group.querySelectorAll("button")) sibling.setAttribute("aria-pressed", String(sibling === button));
      change(choice.value);
    };
    group.append(button);
  }
  return group;
}
export function animatePanel(panel) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "hidden");
  if (!descriptor?.get || !descriptor.set) return () => {
  };
  const get = descriptor.get, set = descriptor.set;
  let hidden = panel.hidden, run = 0;
  let timer;
  Object.defineProperty(panel, "hidden", { configurable: true, get() {
    return hidden;
  }, set(value) {
    hidden = !!value;
    const token = ++run;
    clearTimeout(timer);
    panel.inert = hidden;
    if (!hidden) {
      panel.dataset.panelClosing = "false";
      set.call(panel, false);
    } else if (get.call(panel) || matchMedia("(prefers-reduced-motion:reduce)").matches) {
      set.call(panel, true);
    } else {
      panel.dataset.panelClosing = "true";
      timer = setTimeout(() => {
        if (token === run) set.call(panel, true);
      }, 180);
    }
  } });
  return () => {
    ++run;
    clearTimeout(timer);
    delete panel.hidden;
  };
}
