// Generated from web/app/platform/pwa.ts by npm run build. Do not edit.
import { notify } from "../library/controls.js";
import { translate } from "../dist/source/src/i18n.js";
import { VERSION } from "../library/version.js";
const status = document.getElementById("app-offline-status");
const check = document.getElementById("check-update"), updateStatus = document.getElementById("update-status");
const t = (en, id) => translate(en, id, document.documentElement.lang || "en-US");
const save = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
  }
};
let registration, activating = false, lastCheck = 0, pendingWorker, noticeWorker, dismissedWorker;
const busy = () => !!document.querySelector('.sela-app.reader-app,.reader-layout,.library-reader-overlay,.sela-app[data-importing="true"],[data-pwa-busy="true"],[role="dialog"][aria-modal="true"]:not(.pwa-notice),dialog[open]:not(.pwa-notice)');
function feedback(copy, tone = "info") {
  if (status) {
    delete status.dataset.offlineState;
    status.textContent = copy;
  }
  notify(copy, tone);
}
let updateMessage = "", updateTone = "info";
function publishUpdateStatus(copy, tone = "info", checking = false) {
  if (copy !== void 0) {
    updateMessage = copy;
    updateTone = tone;
    if (updateStatus) updateStatus.textContent = copy;
  }
  document.dispatchEvent(new CustomEvent("sela:update-status", { detail: { message: updateMessage, tone: updateTone, checking } }));
}
function offlineStatus(state) {
  if (!status) return;
  const copy = state === "preparing" ? ["Preparing the offline app\u2026", "Menyiapkan app offline\u2026"] : state === "ready" ? ["Bookshelf ready for local files offline. Keep a backup.", "Rak siap untuk berkas lokal offline. Tetap simpan cadangan."] : ["Offline shell unavailable; keep your originals.", "Shell offline belum tersedia; simpan berkas asli."];
  status.dataset.offlineState = state;
  status.textContent = t(copy[0], copy[1]);
}
document.addEventListener("sela:language", () => {
  const state = status?.dataset.offlineState;
  if (state === "preparing" || state === "ready" || state === "unavailable") offlineStatus(state);
});
if (status) status.classList.add("sr-only");
const banner = document.createElement("dialog");
banner.className = "pwa-notice";
banner.setAttribute("aria-label", t("App update", "Pembaruan aplikasi"));
const mark = document.createElement("span");
mark.className = "pwa-notice__mark";
mark.setAttribute("aria-hidden", "true");
const markSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
markSvg.setAttribute("viewBox", "0 0 24 24");
markSvg.setAttribute("fill", "none");
markSvg.setAttribute("stroke", "currentColor");
markSvg.setAttribute("stroke-width", "1.7");
markSvg.setAttribute("stroke-linecap", "round");
markSvg.setAttribute("stroke-linejoin", "round");
const markPath = document.createElementNS(markSvg.namespaceURI, "path");
markPath.setAttribute("d", "M20 7v5h-5M4 17v-5h5M5.6 9a7.5 7.5 0 0 1 12-2L20 12M4 12l2.4 5a7.5 7.5 0 0 0 12-2");
markSvg.append(markPath);
mark.append(markSvg);
const content = document.createElement("div");
content.className = "pwa-notice__content";
const eyebrow = document.createElement("span");
eyebrow.className = "pwa-notice__eyebrow";
eyebrow.textContent = t("APP UPDATE", "PEMBARUAN APP");
const message = document.createElement("p");
message.className = "pwa-notice__message";
content.append(eyebrow, message);
const actions = document.createElement("div");
actions.className = "pwa-notice__actions";
const apply = document.createElement("button"), later = document.createElement("button");
apply.type = later.type = "button";
apply.className = "pwa-notice__apply";
later.className = "pwa-notice__later";
actions.append(apply, later);
banner.append(mark, content, actions);
document.body.append(banner);
banner.addEventListener("cancel", (event) => {
  event.preventDefault();
  later.click();
});
const themedVariables = ["--color-paper", "--color-paper-raised", "--color-paper-soft", "--color-ink", "--color-muted", "--color-rule", "--color-accent", "--color-accent-soft", "--color-glass", "--color-glass-edge", "--color-glass-highlight", "--color-shadow"];
function syncNoticeTheme() {
  const source = document.querySelector(".sela-app");
  if (!source) return;
  const computed = getComputedStyle(source);
  for (const name of themedVariables) {
    const value = computed.getPropertyValue(name);
    if (value) banner.style.setProperty(name, value);
  }
  banner.style.colorScheme = source.dataset.theme === "oled" ? "dark" : "light";
}
const themeObserver = new MutationObserver(syncNoticeTheme);
themeObserver.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["data-theme"] });
syncNoticeTheme();
function notice(copy, action, label, onLater) {
  message.textContent = copy;
  apply.textContent = label;
  apply.disabled = false;
  later.textContent = t("Later", "Nanti");
  apply.onclick = action;
  later.onclick = () => {
    if (banner.open) banner.close("later");
    onLater?.();
  };
  if (!banner.open) banner.show();
  publishUpdateStatus(copy, "success");
}
async function workerVersion(worker) {
  return await new Promise((resolve) => {
    const channel = new MessageChannel(), timer = window.setTimeout(() => {
      channel.port1.close();
      resolve(t("new version", "versi baru"));
    }, 900);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      channel.port1.close();
      resolve(typeof event.data?.version === "string" ? event.data.version : t("new version", "versi baru"));
    };
    worker.postMessage({ type: "GET_VERSION" }, [channel.port2]);
  });
}
async function waiting() {
  const worker = registration?.waiting;
  if (!worker || worker === pendingWorker || worker === noticeWorker || worker === dismissedWorker) return;
  pendingWorker = worker;
  const nextVersion = await workerVersion(worker);
  if (pendingWorker === worker) pendingWorker = void 0;
  if (registration?.waiting !== worker) return;
  noticeWorker = worker;
  const installed = nextVersion === VERSION ? "" : t(` Installed: ${VERSION}.`, ` Terpasang: ${VERSION}.`);
  notice(t(`Sela ${nextVersion} is ready.${installed} Your books and progress stay on this device.`, `Sela ${nextVersion} siap dipasang.${installed} Buku dan progres tetap aman di perangkat ini.`), () => {
    if (registration?.waiting !== worker) {
      if (banner.open) banner.close();
      void waiting();
      return;
    }
    if (busy()) {
      const copy = t("Close the reader or finish the active action before updating.", "Tutup reader atau selesaikan tindakan aktif sebelum memperbarui.");
      message.textContent = copy;
      publishUpdateStatus(copy, "error");
      return;
    }
    activating = true;
    apply.disabled = true;
    message.textContent = t("Updating safely\u2026 Sela will reopen when ready.", "Memperbarui dengan aman\u2026 Sela akan terbuka kembali setelah siap.");
    publishUpdateStatus(message.textContent, "info");
    worker.postMessage({ type: "ACTIVATE_UPDATE" });
  }, t("Update now", "Perbarui sekarang"), () => {
    dismissedWorker = worker;
    if (noticeWorker === worker) noticeWorker = void 0;
  });
}
async function checkWorker(manual = false) {
  if (!registration || !navigator.onLine) {
    if (manual) publishUpdateStatus(t("Connect to check for an app update.", "Hubungkan internet untuk memeriksa pembaruan app."), "error");
    return;
  }
  if (!manual && Date.now() - lastCheck < 36e5) return;
  lastCheck = Date.now();
  if (manual) {
    if (check) check.disabled = true;
    publishUpdateStatus(t("Checking app files\u2026", "Memeriksa berkas app\u2026"), "info", true);
  }
  try {
    await registration.update();
    save("sela-update-last-checked", Date.now());
    if (registration.waiting) {
      waiting();
      const copy = t("Update ready. Use Update now to reload safely.", "Pembaruan siap. Gunakan Perbarui sekarang untuk memuat ulang.");
      publishUpdateStatus(copy, "success");
    } else if (manual) {
      const copy = t("App checked. Updates appear here when ready.", "App diperiksa. Pembaruan akan tampil di sini setelah siap.");
      publishUpdateStatus(copy, "success");
    }
  } catch {
    if (manual) publishUpdateStatus(t("Could not check. Try again online.", "Belum bisa memeriksa. Coba lagi saat online."), "error");
  } finally {
    if (manual) {
      if (check) check.disabled = false;
      publishUpdateStatus(void 0, updateTone, false);
    }
  }
}
if ("serviceWorker" in navigator) {
  document.addEventListener("sela:check-update", () => {
    lastCheck = 0;
    void checkWorker(true);
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (activating) location.reload();
  });
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "UPDATE_BLOCKED") {
      activating = false;
      apply.disabled = false;
      const copy = t("Close other Sela windows before updating, then try again.", "Tutup jendela Sela lainnya sebelum memperbarui, lalu coba lagi.");
      message.textContent = copy;
      publishUpdateStatus(copy, "error");
    }
  });
  try {
    const activeRegistration = await navigator.serviceWorker.register(new URL("./sw.js", import.meta.url), { scope: new URL("./", import.meta.url).href, updateViaCache: "none" });
    registration = activeRegistration;
    offlineStatus("preparing");
    void navigator.serviceWorker.ready.then(() => {
      if (status && !new URL(location.href).searchParams.has("incoming")) offlineStatus("ready");
      else if (status) delete status.dataset.offlineState;
    });
    if (check) {
      const releaseCheck = check.onclick;
      check.onclick = async () => {
        lastCheck = 0;
        await checkWorker(true);
        await releaseCheck?.();
      };
    }
    activeRegistration.addEventListener("updatefound", () => {
      const worker = activeRegistration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) waiting();
      });
    });
    if (registration.waiting) waiting();
    void checkWorker();
    window.addEventListener("online", () => void checkWorker());
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) void checkWorker();
    });
  } catch {
    offlineStatus("unavailable");
  }
}
function receive(files) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (books) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(books);
    };
    const timer = setTimeout(() => finish([]), 3e4);
    document.dispatchEvent(new CustomEvent("sela:incoming-files", { detail: { files, complete: finish } }));
  });
}
const launchQueue = window.launchQueue;
if (launchQueue) launchQueue.setConsumer(async (launch) => {
  try {
    const files = [];
    for (const handle of launch.files || []) files.push(await handle.getFile());
    if (files.length) await receive(files);
  } catch {
    feedback(t("Could not open this file. Add it using +.", "Berkas belum dapat dibuka. Tambahkan melalui +."), "error");
  }
});
const incoming = new URL(location.href).searchParams.get("incoming");
if (incoming === "error") feedback(t("Could not receive files. Add them using +.", "Berkas belum dapat diterima. Tambahkan melalui +."), "error");
if (incoming === "1") {
  let db;
  const share = new URL(location.href).searchParams.get("share"), key = share && /^share:[a-f0-9-]{36}$/.test(share) ? share : "pending";
  try {
    const database = await new Promise((resolve, reject) => {
      const req = indexedDB.open("sela-incoming", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("files");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db = database;
    const records = await new Promise((resolve, reject) => {
      const req = database.transaction("files").objectStore("files").get(key);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    if (records.length) {
      const result = await receive(records.map((r) => new File([r.bytes], r.name, { type: r.type })));
      if (result?.length === records.length) await new Promise((resolve, reject) => {
        const tx = database.transaction("files", "readwrite");
        tx.objectStore("files").delete(key);
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
      });
    }
  } catch {
    feedback(t("Import unfinished. Keep originals and retry with +.", "Impor belum selesai. Simpan berkas asli dan coba melalui +."), "error");
  } finally {
    db?.close();
    const url = new URL(location.href);
    url.searchParams.delete("incoming");
    url.searchParams.delete("share");
    history.replaceState(history.state, "", url);
  }
}
