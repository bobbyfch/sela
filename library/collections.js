// Generated from app/library/collections.ts by npm run build. Do not edit.
import { iconAction, bottomSheet, animateDialog } from "./controls.js";
import { listCollections, listBooks, changeCollection } from "./storage.js";
export async function showCollections({ t = (en) => en, ids, onChange = async () => {
} } = {}) {
  const returnFocus = document.activeElement;
  const dialog = document.createElement("dialog");
  dialog.className = "book-info-dialog collection-dialog";
  dialog.setAttribute("aria-label", t("Collections", "Koleksi"));
  animateDialog(dialog);
  dialog.addEventListener("close", () => {
    dialog.remove();
    (returnFocus?.isConnected && returnFocus.getClientRects().length && !returnFocus.closest("dialog:not([open])") ? returnFocus : document.querySelector(".shelf-refine-toggle"))?.focus();
  }, { once: true });
  const make = (tag, text, parent = dialog) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    parent.append(node);
    return node;
  };
  const header = make("header");
  make("h2", ids ? t("Book collections", "Koleksi buku") : t("Collections", "Koleksi"), header);
  const close = make("button", "\xD7", header);
  close.type = "button";
  close.setAttribute("aria-label", t("Close collections", "Tutup koleksi"));
  make("p", t("A book can belong to several collections. Removing a collection keeps its books and reading data.", "Satu buku dapat masuk beberapa koleksi. Menghapus koleksi tetap menyimpan buku dan data baca."));
  const form = make("form");
  const label = make("label", t("Collection name", "Nama koleksi"), form);
  const input = make("input", null, label);
  input.required = true;
  input.maxLength = 40;
  input.setAttribute("aria-label", label.firstChild.textContent);
  const create = make("button", t("Create collection", "Buat koleksi"), form);
  create.type = "submit";
  const list = make("div");
  list.className = "collection-list";
  const notice = make("p");
  notice.setAttribute("role", "status");
  let busy = false;
  function dismiss() {
    if (busy) return;
    dialog.close?.();
    (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : document.querySelector(".shelf-refine-toggle"))?.focus();
  }
  close.onclick = dismiss;
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    dismiss();
  });
  async function run(operation) {
    if (busy) return;
    busy = true;
    const controls = [...dialog.querySelectorAll("button,input,select")];
    controls.forEach((n) => n.disabled = true);
    notice.textContent = t("Saving\u2026", "Menyimpan\u2026");
    try {
      await changeCollection(operation);
      await onChange();
      await render();
      notice.textContent = t("Saved. Books remain on your shelf.", "Tersimpan. Buku tetap ada di rakmu.");
      return true;
    } catch (e) {
      notice.textContent = e.message;
    } finally {
      busy = false;
      controls.forEach((n) => n.disabled = false);
    }
  }
  function button(parent, en, id, fn) {
    const b = make("button", t(en, id), parent);
    b.type = "button";
    b.onclick = fn;
    return b;
  }
  async function render() {
    const [names, books] = await Promise.all([listCollections(), listBooks()]);
    list.replaceChildren();
    if (!names.length) make("p", t("No collections yet. Create your first one above.", "Belum ada koleksi. Buat yang pertama di atas."), list);
    for (const name of names) {
      const row = make("section", null, list);
      row.className = "collection-row";
      make("h3", name, row);
      const members = books.filter((b) => b.tags?.includes(name));
      make("small", members.length + " " + t("books", "buku"), row);
      const actions = make("div", null, row);
      actions.className = "collection-actions";
      if (ids) {
        const count = books.filter((b) => ids.includes(b.id) && b.tags?.includes(name)).length;
        make("small", count + " / " + ids.length + " " + t("selected books in this collection", "buku pilihan dalam koleksi ini"), row);
        button(actions, "Add selected", "Tambahkan pilihan", () => run({ action: "add", name, ids }));
        button(actions, "Remove membership", "Keluarkan dari koleksi", () => run({ action: "remove", name, ids }));
        const alternatives = names.filter((n) => n !== name);
        if (alternatives.length) {
          const target = make("select", null, actions);
          target.setAttribute("aria-label", t("Move from ", "Pindahkan dari ") + name);
          for (const n of alternatives) {
            const opt = make("option", n, target);
            opt.value = n;
          }
          button(actions, "Move selected", "Pindahkan pilihan", () => run({ action: "move", from: name, name: target.value, ids }));
        }
      } else {
        button(actions, "Rename collection", "Ganti nama koleksi", () => {
          actions.replaceChildren();
          const rename = make("input", null, actions);
          rename.value = name;
          rename.maxLength = 40;
          rename.setAttribute("aria-label", t("New collection name", "Nama koleksi baru"));
          button(actions, "Save name", "Simpan nama", () => run({ action: "rename", name, next: rename.value }));
          button(actions, "Cancel", "Batal", () => void render());
          rename.focus();
        });
        button(actions, "Delete collection", "Hapus koleksi", () => {
          actions.replaceChildren();
          make("p", t("Remove this collection? Its books will stay.", "Hapus koleksi ini? Bukunya tetap tersimpan."), actions);
          button(actions, "Keep collection", "Pertahankan koleksi", () => void render());
          button(actions, "Delete collection only", "Hapus koleksi saja", () => run({ action: "delete", name }));
        });
      }
    }
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    void run({ action: "create", name: input.value }).then((saved) => {
      if (saved) input.value = "";
    });
  };
  document.body.append(dialog);
  try {
    await render();
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute("open", "");
    input.focus();
  } catch (e) {
    dialog.remove();
    throw e;
  }
  return dialog;
}
export function mountShelfControls({ t, controls, onCollections }) {
  const details = document.createElement("div");
  details.className = "shelf-refine";
  const summary = document.createElement("button");
  summary.type = "button";
  summary.className = "shelf-refine-toggle";
  summary.setAttribute("aria-expanded", "false");
  iconAction(summary, "filter", t("Sort & filter", "Urutkan & saring"));
  details.append(summary);
  const panel = document.createElement("div");
  panel.className = "shelf-refine-panel";
  panel.id = "shelf-refine-panel";
  summary.setAttribute("aria-controls", panel.id);
  const sheet = bottomSheet(t("Sort & filter", "Urutkan & saring"), panel);
  sheet.element.addEventListener("close", () => {
    details.removeAttribute("open");
    summary.setAttribute("aria-expanded", "false");
    summary.focus();
  });
  window.addEventListener("pagehide", () => sheet.destroy(), { once: true });
  function setOpen(value) {
    details.toggleAttribute("open", value);
    summary.setAttribute("aria-expanded", String(value));
    if (value) sheet.open();
    else sheet.close();
  }
  summary.onclick = () => setOpen(!details.hasAttribute("open"));
  panel.addEventListener("change", (e) => {
    if (e.target.matches("select")) {
      setOpen(false);
      summary.focus();
    }
  });
  for (const [id, en, ind] of [["sort", "Sort books", "Urutkan buku"], ["format-filter", "Format", "Format"], ["read-filter", "Reading status", "Status baca"], ["tag-filter", "Collection", "Koleksi"]]) {
    const select = document.getElementById(id);
    if (!select) continue;
    const label = document.createElement("label");
    const span = document.createElement("span");
    span.textContent = t(en, ind);
    label.append(span, select);
    panel.append(label);
  }
  const collections = document.createElement("button");
  collections.type = "button";
  collections.className = "manage-collections";
  collections.textContent = t("Collections", "Koleksi");
  collections.onclick = () => {
    setOpen(false);
    summary.focus();
    onCollections();
  };
  panel.append(collections);
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = t("Done", "Selesai");
  close.onclick = () => {
    setOpen(false);
    summary.focus();
  };
  panel.append(close);
  controls.append(details);
  document.addEventListener("pointerdown", (e) => {
    if (details.hasAttribute("open") && !details.contains(e.target) && !sheet.element.contains(e.target)) setOpen(false);
  });
  details.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      summary.focus();
    }
  });
  return { localize() {
    sheet.setTitle(t("Sort & filter", "Urutkan & saring"), t("Close filters", "Tutup filter"));
    iconAction(summary, "filter", t("Sort & filter", "Urutkan & saring"));
    collections.textContent = t("Collections", "Koleksi");
    close.textContent = t("Done", "Selesai");
    for (const [i, en, id] of [[0, "Sort books", "Urutkan buku"], [1, "Format", "Format"], [2, "Reading status", "Status baca"], [3, "Collection", "Koleksi"]]) panel.querySelectorAll("label span")[i].textContent = t(en, id);
  } };
}
