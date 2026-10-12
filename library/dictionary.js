// Generated from app/library/dictionary.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { bottomSheet } from "./controls.js";
function node(tag, parent, text = "") {
  const e = document.createElement(tag);
  e.textContent = text;
  parent.append(e);
  return e;
}
function modal(title, build) {
  const body = document.createElement("div");
  body.className = "personal-sheet";
  const sheet = bottomSheet(title, body);
  build(body, sheet);
  sheet.element.addEventListener("close", () => sheet.destroy(), { once: true });
  sheet.open();
  return sheet;
}
function button(parent, label, run) {
  const b = node("button", parent, label);
  b.type = "button";
  let busy = false;
  b.onclick = async () => {
    if (busy) return;
    busy = true;
    b.focus();
    b.setAttribute("aria-busy", "true");
    try {
      await run();
    } catch (e) {
      let status = parent.querySelector("[role=status]");
      if (!status) {
        status = node("p", parent);
        status.setAttribute("role", "status");
      }
      status.textContent = e.message;
    } finally {
      busy = false;
      b.removeAttribute("aria-busy");
    }
  };
  return b;
}
function input(parent, label, type = "text") {
  const wrap = node("label", parent, label), e = node("input", wrap);
  e.type = type;
  e.setAttribute("aria-label", label);
  return e;
}
export function openDictionary(text, t) {
  modal(t("Dictionary & translation", "Kamus & terjemahan"), (body) => {
    const word = input(body, t("Word or passage", "Kata atau penggalan"));
    word.maxLength = 1e3;
    word.value = text.slice(0, 1e3);
    const output = node("p", body);
    output.setAttribute("role", "status");
    const pack = input(body, t("Local dictionary JSON", "Kamus lokal JSON"), "file");
    pack.accept = ".json,application/json";
    let dictionary = {};
    try {
      dictionary = JSON.parse(localStorage.getItem("sela-library:dictionary") || "{}");
    } catch {
    }
    pack.onchange = async () => {
      try {
        const file = pack.files[0];
        if (!file || file.size > 1048576) throw Error("Dictionary limit: 1 MiB");
        const data = JSON.parse(await file.text());
        if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length > 2e4 || Object.values(data).some((v) => typeof v !== "string" || v.length > 2e3)) throw Error("Dictionary must map words to definitions");
        dictionary = data;
        localStorage.setItem("sela-library:dictionary", JSON.stringify(data));
        output.textContent = t("Dictionary ready", "Kamus siap");
      } catch (e) {
        output.textContent = e.message;
      }
    };
    button(body, t("Look up locally", "Cari lokal"), () => {
      output.textContent = (Object.hasOwn(dictionary, word.value.trim().toLowerCase()) ? dictionary[word.value.trim().toLowerCase()] : null) || t("Word not in your dictionary pack.", "Kata belum ada di paket kamusmu.");
    });
    button(body, t("Look up English online", "Cari English online"), async () => {
      const r = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word.value.trim()), { signal: AbortSignal.timeout(1e4) });
      if (!r.ok) throw Error("Dictionary unavailable");
      const data = JSON.parse(await responseText(r, 128 * 1024));
      output.textContent = data[0]?.meanings?.flatMap((m) => m.definitions.map((d) => d.definition)).slice(0, 3).join(" \xB7 ") || "";
    });
    const pair = node("select", body);
    pair.setAttribute("aria-label", t("Translation direction", "Arah terjemahan"));
    for (const [key, label] of [["en|id", "EN \u2192 ID"], ["id|en", "ID \u2192 EN"]]) {
      const option = node("option", pair, label);
      option.value = key;
    }
    node("small", body, t("Online actions send this text to their provider only when tapped.", "Aksi online mengirim teks ini ke provider hanya saat diketuk."));
    button(body, t("Translate online", "Terjemahkan online"), async () => {
      let passage = "";
      for (const character of word.value) {
        if (new TextEncoder().encode(passage + character).length > 500) break;
        passage += character;
      }
      const r = await fetch("https://api.mymemory.translated.net/get?langpair=" + encodeURIComponent(pair.value) + "&q=" + encodeURIComponent(passage), { signal: AbortSignal.timeout(1e4) });
      if (!r.ok) throw Error("Translation unavailable");
      const data = JSON.parse(await responseText(r, 128 * 1024));
      if (data.responseStatus !== void 0 && Number(data.responseStatus) !== 200) throw Error("Translation unavailable");
      if (typeof data.responseData?.translatedText !== "string") throw Error("Translation unavailable");
      output.textContent = data.responseData.translatedText;
    });
  });
}
