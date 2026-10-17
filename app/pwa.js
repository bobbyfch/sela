// Generated from app/mobile/pwa.ts by npm run build. Do not edit.
import { notify } from "../library/controls.js";
import { translate } from "../dist/source/src/i18n.js";
import { VERSION } from "../library/version.js";
const status = document.getElementById("mobile-offline-status");
const check = document.getElementById("check-update"), updateStatus = document.getElementById("update-status");
const t = (en, id) => translate(en, id, document.documentElement.lang || "en-US");
const save = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
  }
};
let registration, activating = false, lastCheck = 0, pendingWorker, noticeWorker;
const busy = () => !!document.querySelector(".library-reader-overlay,.book-info-dialog[open],#books:disabled,#restore-library:disabled,#export-library:disabled,#share-library:disabled");
function feedback(copy, tone = "info") {
  if (status) {
    delete status.dataset.offlineState;
    status.textContent = copy;
  }
  notify(copy, tone);
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
const banner = document.createElement("aside");
banner.className = "pwa-notice";
banner.hidden = true;
banner.setAttribute("role", "status");
const message = document.createElement("p"), apply = document.createElement("button"), later = document.createElement("button");
apply.type = later.type = "button";
banner.append(message, apply, later);
document.body.append(banner);
function notice(copy, action, label, onLater) {
  message.textContent = copy;
  apply.textContent = label;
  apply.onclick = action;
  later.textContent = t("Later", "Nanti");
  later.onclick = () => {
    banner.hidden = true;
    onLater?.();
  };
  banner.hidden = false;
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
  if (!worker || worker === pendingWorker || worker === noticeWorker) return;
  pendingWorker = worker;
  const nextVersion = await workerVersion(worker);
  if (pendingWorker === worker) pendingWorker = void 0;
  if (registration?.waiting !== worker) return;
  noticeWorker = worker;
  notice(t(`Sela ${nextVersion} is ready. Installed version: ${VERSION}. Your books and progress stay on this device.`, `Sela ${nextVersion} siap diperbarui. Versi terpasang: ${VERSION}. Buku dan progres tetap aman di perangkat ini.`), () => {
    if (registration?.waiting !== worker) {
      banner.hidden = true;
      void waiting();
      return;
    }
    if (busy()) {
      const copy = t("Close the reader and finish importing before updating.", "Tutup reader dan selesaikan impor sebelum memperbarui.");
      message.textContent = copy;
      feedback(copy, "error");
      return;
    }
    activating = true;
    apply.disabled = true;
    message.textContent = t("Updating safely\u2026 Sela will reopen when ready.", "Memperbarui dengan aman\u2026 Sela akan terbuka kembali setelah siap.");
    feedback(message.textContent);
    worker.postMessage({ type: "ACTIVATE_UPDATE" });
  }, t("Update now", "Perbarui sekarang"), () => {
    if (noticeWorker === worker) noticeWorker = void 0;
  });
}
async function checkWorker(manual = false) {
  if (!registration || !navigator.onLine) {
    if (manual) {
      const copy = t("Connect to check for an app update.", "Hubungkan internet untuk memeriksa pembaruan app.");
      if (updateStatus) updateStatus.textContent = copy;
      feedback(copy, "error");
    }
    return;
  }
  if (!manual && Date.now() - lastCheck < 36e5) return;
  lastCheck = Date.now();
  if (manual) {
    check.disabled = true;
    if (updateStatus) updateStatus.textContent = t("Checking app files\u2026", "Memeriksa berkas app\u2026");
  }
  try {
    await registration.update();
    save("sela-update-last-checked", Date.now());
    if (registration.waiting) {
      waiting();
      const copy = t("Update ready. Use Update now to reload safely.", "Pembaruan siap. Gunakan Perbarui sekarang untuk memuat ulang.");
      if (updateStatus) updateStatus.textContent = copy;
      if (manual) feedback(copy, "success");
    } else if (manual) {
      const copy = t("App checked. Updates appear here when ready.", "App diperiksa. Pembaruan akan tampil di sini setelah siap.");
      if (updateStatus) updateStatus.textContent = copy;
      feedback(copy, "success");
    }
  } catch {
    if (manual) {
      const copy = t("Could not check. Try again online.", "Belum bisa memeriksa. Coba lagi saat online.");
      if (updateStatus) updateStatus.textContent = copy;
      feedback(copy, "error");
    }
  } finally {
    if (manual && check) check.disabled = false;
  }
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (activating) location.reload();
  });
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "UPDATE_BLOCKED") {
      activating = false;
      apply.disabled = false;
      const copy = t("Close other Sela windows before updating, then try again.", "Tutup jendela Sela lainnya sebelum memperbarui, lalu coba lagi.");
      message.textContent = copy;
      feedback(copy, "error");
    }
  });
  try {
    registration = await navigator.serviceWorker.register(new URL("./sw.js", import.meta.url), { scope: new URL("./", import.meta.url).href, updateViaCache: "none" });
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
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
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
async function receive(files) {
  const { receiveFiles } = await import("../library/library.js");
  return receiveFiles(files);
}
if ("launchQueue" in window) window.launchQueue.setConsumer(async (launch) => {
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
    db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("sela-incoming", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("files");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const records = await new Promise((resolve, reject) => {
      const req = db.transaction("files").objectStore("files").get(key);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    if (records.length) {
      const result = await receive(records.map((r) => new File([r.bytes], r.name, { type: r.type })));
      if (result?.length === records.length) await new Promise((resolve, reject) => {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").delete(key);
        tx.oncomplete = resolve;
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
