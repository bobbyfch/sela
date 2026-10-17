// Generated from app/library/home-widgets.ts by npm run build. Do not edit.
import EmblaCarousel from "./vendor/embla-carousel.js";
import { editPersonal, readPersonal } from "./personal-store.js";
import { bottomSheet, controlIcon, iconAction, notify } from "./controls.js";
import { loadPublicHolidays } from "./holiday-calendar.js";
import { holidayCountry, localeBase } from "../dist/source/src/i18n.js";
import { HOME_NEWS_TOPICS, loadOnThisDay, loadTopicNews, readNewsSource, readNewsTopics, saveNewsSource, saveNewsTopics } from "./home-feeds.js";
import { QURAN_PATTERN_BACKGROUND, QURAN_SCENE_BACKGROUND, faithSource, loadFaithLibrary, loadFaithReading, openFaithReadingInSela, openIslamicReadingInSela, openQuranInSela } from "./scripture-sources.js";
import { mountPrayerTimes } from "./prayer-times.js";
import { PROPHET_PASSAGES } from "./prophet-passages.js";
const WATER_KEY = "sela-library:water-glasses";
function localDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
function locale() {
  return document.documentElement.lang || navigator.language || "en-US";
}
function node(tag, className = "", parent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  parent?.append(element);
  return element;
}
function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}
function shiftMonth(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
}
function makeCalendar(t) {
  const card = node("section", "home-widget-card home-calendar-widget tw:rounded-3xl tw:border tw:border-sela-line/70 tw:bg-sela-surface/75 tw:p-4 tw:shadow-sm tw:backdrop-blur-lg tw:sm:p-5");
  card.setAttribute("aria-labelledby", "home-calendar-title");
  const header = node("div", "home-widget-heading", card), copy = node("div", "", header), title = node("h2", "", copy);
  title.id = "home-calendar-title";
  const subtitle = node("p", "home-widget-subtitle", copy), monthControls = node("div", "home-calendar-controls", header);
  const previous = iconAction(node("button", "", monthControls), "chevron", t("Previous month", "Bulan sebelumnya"));
  previous.type = "button";
  previous.classList.add("home-month-arrow", "is-previous");
  const monthLabel = node("strong", "home-calendar-month", monthControls);
  const next = iconAction(node("button", "", monthControls), "chevron", t("Next month", "Bulan berikutnya"));
  next.type = "button";
  next.classList.add("home-month-arrow");
  const weekdayRow = node("div", "home-calendar-weekdays", card);
  weekdayRow.setAttribute("aria-hidden", "true");
  const grid = node("div", "home-calendar-grid", card);
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", t("Reading days", "Hari membaca"));
  const legend = node("div", "home-calendar-legend", card), holidayLegend = node("span", "", legend), dot = node("i", "", holidayLegend), holidayText = node("span", "", holidayLegend);
  dot.setAttribute("aria-hidden", "true");
  holidayLegend.dataset.kind = "national";
  const source = node("a", "home-calendar-source", legend);
  source.href = "https://date.nager.at/";
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "Nager.Date";
  source.setAttribute("aria-label", t("Public holiday source: Nager.Date", "Sumber hari libur: Nager.Date"));
  const detail = node("p", "home-calendar-detail", card);
  detail.setAttribute("role", "status");
  detail.setAttribute("aria-live", "polite");
  const viewToggle = node("button", "home-calendar-view", card);
  viewToggle.type = "button";
  let month = monthStart(/* @__PURE__ */ new Date()), selected = localDateKey(/* @__PURE__ */ new Date()), todayKey = selected, weekMode = matchMedia("(max-width: 600px)").matches, viewWasChosen = false;
  let country = holidayCountry(locale());
  const holidays = /* @__PURE__ */ new Map(), loadedYears = /* @__PURE__ */ new Set(), yearLoads = /* @__PURE__ */ new Map();
  function holidayName(item) {
    return localeBase(locale()) === "en" ? item.name : item.localName || item.name;
  }
  function loadYear(year) {
    if (loadedYears.has(year)) return Promise.resolve();
    if (yearLoads.has(year)) return yearLoads.get(year);
    const request = loadPublicHolidays(year, country).then((result) => {
      if (country !== result.country) return;
      for (const old of [...holidays.keys()]) if (old.startsWith(year + "-")) holidays.delete(old);
      for (const item of result.holidays) holidays.set(item.date, item);
      loadedYears.add(year);
      if (selected.startsWith(year + "-")) render();
    }).catch(() => {
      if (selected.startsWith(year + "-")) {
        detail.textContent = t("Holiday information is unavailable offline until it has been loaded once.", "Informasi hari libur belum tersedia offline sebelum sempat dimuat.");
      }
    }).finally(() => yearLoads.delete(year));
    yearLoads.set(year, request);
    return request;
  }
  function sessionsByDate() {
    const counts = /* @__PURE__ */ new Map();
    for (const session of readPersonal().sessions) {
      if (session.seconds <= 0) continue;
      const key = localDateKey(new Date(session.at)), value = counts.get(key) || { count: 0, seconds: 0 };
      value.count++;
      value.seconds += session.seconds;
      counts.set(key, value);
    }
    return counts;
  }
  function showDetail(key, counts) {
    const date = /* @__PURE__ */ new Date(`${key}T12:00:00`), entry = counts.get(key), holiday = holidays.get(key), parts = [];
    if (entry) parts.push(t("Reading saved \xB7 ", "Bacaan tersimpan \xB7 ") + entry.count + " " + t(entry.count === 1 ? "session" : "sessions", entry.count === 1 ? "sesi" : "sesi") + " \xB7 " + Math.max(1, Math.round(entry.seconds / 60)) + " " + t("min", "menit"));
    if (holiday) parts.push(t("Public holiday", "Libur nasional") + " \xB7 " + holidayName(holiday));
    if (!parts.length) parts.push(t("A quiet day. No reading saved here yet.", "Hari yang tenang. Belum ada sesi baca tersimpan.") + " \xB7 " + new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short" }).format(date));
    detail.textContent = parts.join(" \xB7 ");
  }
  function render() {
    const current = monthStart(/* @__PURE__ */ new Date()), counts = sessionsByDate();
    title.textContent = t("Reading calendar", "Kalender membaca");
    holidayText.textContent = t("Public holiday", "Libur nasional");
    source.setAttribute("aria-label", t("Public holiday source: Nager.Date", "Sumber hari libur: Nager.Date"));
    const activeDays = [...counts.keys()].filter((key) => {
      const date = /* @__PURE__ */ new Date(`${key}T12:00:00`);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    }).length;
    subtitle.textContent = activeDays ? t(activeDays === 1 ? "A little reading on 1 day" : "A little reading on " + activeDays + " days", activeDays === 1 ? "Ada waktu membaca pada 1 hari" : "Ada waktu membaca pada " + activeDays + " hari") : t("Small moments count.", "Jeda kecil tetap berarti.");
    const compact = matchMedia("(max-width: 600px)").matches;
    monthLabel.textContent = new Intl.DateTimeFormat(locale(), { month: compact ? "short" : "long", year: compact ? "2-digit" : "numeric" }).format(month);
    previous.setAttribute("aria-label", t("Previous month", "Bulan sebelumnya"));
    next.setAttribute("aria-label", t("Next month", "Bulan berikutnya"));
    next.disabled = month.getFullYear() === current.getFullYear() && month.getMonth() === current.getMonth();
    viewToggle.textContent = weekMode ? t("Show the whole month", "Lihat satu bulan") : t("Show this week", "Lihat minggu ini");
    viewToggle.setAttribute("aria-label", viewToggle.textContent);
    viewToggle.setAttribute("aria-expanded", String(!weekMode));
    weekdayRow.replaceChildren();
    const monday = new Date(2024, 0, 1, 12);
    for (let index = 0; index < 7; index++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      node("span", "", weekdayRow).textContent = new Intl.DateTimeFormat(locale(), { weekday: weekMode ? "narrow" : "short" }).format(date).replace(/\.$/, "");
    }
    grid.replaceChildren();
    const first = monthStart(month), offset = (first.getDay() + 6) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12).getDate();
    const dates = [];
    if (weekMode) {
      const anchor = /* @__PURE__ */ new Date(`${selected}T12:00:00`);
      anchor.setDate(anchor.getDate() - (anchor.getDay() + 6) % 7);
      for (let index = 0; index < 7; index++) {
        const date = new Date(anchor);
        date.setDate(anchor.getDate() + index);
        dates.push(date);
      }
    } else {
      for (let blank = 0; blank < offset; blank++) {
        const empty = node("span", "home-calendar-blank", grid);
        empty.setAttribute("aria-hidden", "true");
      }
      for (let day = 1; day <= days; day++) dates.push(new Date(month.getFullYear(), month.getMonth(), day, 12));
    }
    for (const date of dates) {
      const key = localDateKey(date), entry = counts.get(key), holiday = holidays.get(key), button = node("button", "home-calendar-day tw:!scroll-mb-32", grid);
      button.type = "button";
      button.textContent = String(date.getDate());
      button.dataset.date = key;
      button.setAttribute("aria-pressed", String(key === selected));
      button.classList.toggle("is-today", key === localDateKey(/* @__PURE__ */ new Date()));
      button.classList.toggle("has-reading", !!entry);
      button.classList.toggle("has-holiday", !!holiday);
      button.classList.toggle("outside-month", date.getMonth() !== month.getMonth());
      const holidayLabel = holiday ? " \xB7 " + t("Public holiday", "Libur nasional") + " \xB7 " + holidayName(holiday) : "";
      button.title = holiday ? holidayName(holiday) : "";
      button.setAttribute("aria-label", new Intl.DateTimeFormat(locale(), { weekday: "long", day: "numeric", month: "long" }).format(date) + (entry ? " \xB7 " + entry.count + " " + t("reading sessions", "sesi membaca") : "") + holidayLabel);
      button.onclick = () => {
        selected = key;
        if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) month = monthStart(date);
        render();
      };
    }
    showDetail(selected, counts);
    for (const year of new Set(dates.map((date) => date.getFullYear()))) if (![...holidays.keys()].some((key) => key.startsWith(year + "-"))) void loadYear(year);
  }
  previous.onclick = () => {
    month = shiftMonth(month, -1);
    selected = localDateKey(month);
    render();
  };
  next.onclick = () => {
    if (!next.disabled) {
      month = shiftMonth(month, 1);
      selected = localDateKey(month);
      render();
    }
  };
  viewToggle.onclick = () => {
    weekMode = !weekMode;
    viewWasChosen = true;
    render();
  };
  window.addEventListener("resize", () => {
    const compact = matchMedia("(max-width: 600px)").matches;
    if (!viewWasChosen && compact !== weekMode) {
      weekMode = compact;
      render();
    }
  });
  document.addEventListener("sela:personal", render);
  document.addEventListener("sela:language", () => {
    country = holidayCountry(locale());
    holidays.clear();
    loadedYears.clear();
    yearLoads.clear();
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    const nextToday = localDateKey(/* @__PURE__ */ new Date());
    if (nextToday !== todayKey) {
      const wasCurrentMonth = month.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear() && month.getMonth() === (/* @__PURE__ */ new Date()).getMonth();
      todayKey = nextToday;
      if (wasCurrentMonth) {
        month = monthStart(/* @__PURE__ */ new Date());
        selected = nextToday;
      }
    }
    render();
  });
  render();
  return { card, localize: render };
}
function makeWaterWidget(t) {
  const card = node("section", "home-widget-card home-water-widget tw:rounded-3xl tw:border tw:border-sela-line/70 tw:bg-sela-surface/75 tw:p-4 tw:shadow-sm tw:backdrop-blur-lg tw:sm:p-5");
  card.setAttribute("aria-labelledby", "home-water-title");
  const heading = node("div", "home-widget-heading", card), icon = node("span", "home-water-icon", heading);
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2.5s-6.5 7.1-6.5 12.1a6.5 6.5 0 1 0 13 0C18.5 9.6 12 2.5 12 2.5Z"/></svg>';
  const copy = node("div", "", heading), title = node("h2", "", copy);
  title.id = "home-water-title";
  const subtitle = node("p", "home-widget-subtitle", copy);
  const row = node("div", "home-water-row tw:!flex-wrap tw:gap-3", card), stat = node("div", "home-water-stat tw:min-w-0", row), value = node("strong", "home-water-value", stat), label = node("span", "home-water-label", stat);
  stat.setAttribute("aria-live", "polite");
  stat.setAttribute("aria-atomic", "true");
  const controls = node("div", "home-water-actions", row), add = node("button", "home-water-add", controls);
  add.type = "button";
  add.append(controlIcon("plus"));
  const addText = node("span", "", add);
  const undo = iconAction(node("button", "", controls), "undo", t("Undo one glass", "Urungkan satu gelas"));
  undo.type = "button";
  undo.classList.add("home-water-undo");
  const personalize = node("section", "home-water-personalize", card), personalizeSummary = node("h3", "home-water-settings-heading", personalize), settings = node("div", "home-water-settings", personalize);
  const guideField = node("div", "home-water-setting", settings), guideLabel = node("label", "home-water-goal-label", guideField), guideSelect = node("select", "home-water-guide", guideField);
  guideLabel.htmlFor = "home-water-guide";
  guideSelect.id = "home-water-guide";
  for (const [value2, en, id] of [["custom", "My own goal", "Target pilihanku"], ["id-male-adult", "Indonesia AKG \xB7 male \xB7 19\u201364", "AKG Indonesia \xB7 laki-laki \xB7 19\u201364"], ["id-female-adult", "Indonesia AKG \xB7 female \xB7 19\u201364", "AKG Indonesia \xB7 perempuan \xB7 19\u201364"], ["off", "No target", "Tanpa target"]]) {
    const option = node("option", "", guideSelect);
    option.value = value2;
    option.textContent = t(en, id);
  }
  const goalField = node("div", "home-water-setting", settings), goalLabel = node("label", "home-water-goal-label", goalField), goalInput = node("input", "home-water-goal", goalField);
  goalLabel.htmlFor = "home-water-goal";
  goalInput.id = "home-water-goal";
  goalInput.type = "number";
  goalInput.min = "0";
  goalInput.max = "5000";
  goalInput.step = "250";
  goalInput.inputMode = "numeric";
  const sizeField = node("div", "home-water-setting", settings), sizeLabel = node("label", "home-water-goal-label", sizeField), sizeSelect = node("select", "home-water-size", sizeField);
  sizeLabel.htmlFor = "home-water-size";
  sizeSelect.id = "home-water-size";
  for (const amount of [150, 200, 250, 330, 500]) {
    const option = node("option", "", sizeSelect);
    option.value = String(amount);
    option.textContent = amount + " mL";
  }
  const settingsHelp = node("p", "home-water-settings-help", settings), source = node("a", "home-water-source", settings);
  source.href = "https://peraturan.bpk.go.id/Details/138621/permenkes-no-28-tahun-2019";
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = t("Indonesia AKG source \u2197", "Sumber AKG Indonesia \u2197");
  const progress = node("div", "home-water-progress", card), progressTrack = node("div", "home-water-progress-track", progress), progressFill = node("span", "home-water-progress-fill", progressTrack), progressText = node("span", "home-water-progress-text", progress);
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-valuemin", "0");
  const note = node("p", "home-water-note", card);
  note.setAttribute("aria-live", "polite");
  let day = localDateKey(/* @__PURE__ */ new Date()), glasses = 0, goalMl = 0, servingMl = 250, goalGuide = "off";
  function normalizeGoal(value2) {
    return Number.isFinite(value2) ? Math.min(5e3, Math.max(0, Math.round(Number(value2) / 250) * 250)) : 0;
  }
  function storedCount() {
    try {
      const saved = JSON.parse(localStorage.getItem(WATER_KEY) || "null");
      goalMl = normalizeGoal(saved?.goalMl ?? (Number.isInteger(saved?.goal) ? saved.goal * 250 : 0));
      servingMl = [150, 200, 250, 330, 500].includes(saved?.servingMl) ? saved.servingMl : 250;
      goalGuide = ["custom", "id-male-adult", "id-female-adult", "off"].includes(saved?.goalGuide) ? saved.goalGuide : goalMl ? "custom" : "off";
      if (saved?.day === localDateKey(/* @__PURE__ */ new Date()) && Number.isInteger(saved.glasses)) return Math.min(99, Math.max(0, saved.glasses));
      return 0;
    } catch {
      goalMl = 0;
      servingMl = 250;
      goalGuide = "off";
      return 0;
    }
  }
  function resetDay() {
    const current = localDateKey(/* @__PURE__ */ new Date());
    if (day !== current) {
      day = current;
      glasses = 0;
    }
  }
  function save() {
    resetDay();
    try {
      localStorage.setItem(WATER_KEY, JSON.stringify({ day, glasses, goalMl, servingMl, goalGuide }));
    } catch {
    }
    paint();
    document.dispatchEvent(new Event("sela:water"));
  }
  function amountLabel(amount) {
    return amount >= 1e3 && amount % 1e3 === 0 ? amount / 1e3 + " L" : amount + " mL";
  }
  function paint() {
    resetDay();
    title.textContent = t("A little water break", "Jeda minum air");
    subtitle.textContent = t("Track your sips at your own pace.", "Catat minum air dengan ritmemu sendiri.");
    value.textContent = amountLabel(glasses * servingMl);
    label.textContent = t("logged today", "tercatat hari ini");
    addText.textContent = t("Add a glass", "Tambah segelas");
    undo.setAttribute("aria-label", t("Undo one glass", "Urungkan satu gelas"));
    undo.title = t("Undo one glass", "Urungkan satu gelas");
    undo.disabled = glasses === 0;
    personalizeSummary.textContent = t("Water goal", "Target minum");
    guideLabel.textContent = t("Goal guide", "Acuan target");
    goalLabel.textContent = t("Daily goal (mL)", "Target harian (mL)");
    sizeLabel.textContent = t("Serving size", "Ukuran gelas");
    for (const option of [...guideSelect.options]) option.textContent = option.value === "custom" ? t("My own goal", "Target pilihanku") : option.value === "id-male-adult" ? t("Indonesia AKG \xB7 male \xB7 19\u201364", "AKG Indonesia \xB7 laki-laki \xB7 19\u201364") : option.value === "id-female-adult" ? t("Indonesia AKG \xB7 female \xB7 19\u201364", "AKG Indonesia \xB7 perempuan \xB7 19\u201364") : t("No target", "Tanpa target");
    guideSelect.value = goalGuide;
    goalInput.value = String(goalMl);
    sizeSelect.value = String(servingMl);
    settingsHelp.textContent = t("Indonesia\u2019s adult AKG reference (ages 19\u201364): 2,500 mL for men, 2,350 mL for women. It is a population guide; food and drinks count toward total water, while Sela logs only the glasses you enter. Weight and height alone are not a validated personal formula. Activity, heat and health can change needs; adjust gently and follow clinical advice when relevant.", "Acuan AKG dewasa Indonesia (usia 19\u201364): 2.500 mL untuk laki-laki, 2.350 mL untuk perempuan. Ini acuan populasi; makanan dan minuman lain ikut dihitung sebagai total air, sedangkan Sela hanya mencatat gelas yang kamu masukkan. Berat dan tinggi saja bukan rumus personal yang tervalidasi. Aktivitas, cuaca panas, dan kondisi kesehatan dapat mengubah kebutuhan; sesuaikan perlahan dan ikuti saran tenaga kesehatan bila relevan.");
    source.textContent = t("Indonesia AKG source \u2197", "Sumber AKG Indonesia \u2197");
    progress.hidden = goalMl === 0;
    if (goalMl > 0) {
      const amount = glasses * servingMl, percent = Math.min(100, Math.round(amount / goalMl * 100));
      progressTrack.setAttribute("aria-valuemax", String(goalMl));
      progressTrack.setAttribute("aria-valuenow", String(Math.min(amount, goalMl)));
      progressTrack.setAttribute("aria-label", t("Water habit progress", "Progres kebiasaan minum air"));
      progressFill.style.width = percent + "%";
      progressText.textContent = amount >= goalMl ? t("Your chosen goal is reached. Nice work; pause when you need to.", "Target pilihanmu tercapai. Bagus; berhenti sejenak saat perlu.") : amount === 0 ? t("A fresh start", "Awal yang segar") : percent < 50 ? t("First sips logged", "Tegukan pertama tercatat") + " \xB7 " + amountLabel(amount) + " / " + amountLabel(goalMl) : percent === 50 ? t("Halfway there", "Setengah jalan") + " \xB7 " + amountLabel(amount) + " / " + amountLabel(goalMl) : t("More than halfway", "Lebih dari setengah") + " \xB7 " + amountLabel(amount) + " / " + amountLabel(goalMl);
      note.textContent = amount >= goalMl ? t("Your chosen goal is reached. Nice work; pause when you need to.", "Target pilihanmu tercapai. Bagus; berhenti sejenak saat perlu.") : t("A gentle reminder, not a rule. Drink when you feel thirsty.", "Pengingat lembut, bukan aturan. Minumlah saat merasa haus.");
    } else {
      progressText.textContent = "";
      note.textContent = t("Set an optional goal if it feels helpful, or leave it off.", "Pasang target bila terasa membantu, atau biarkan mati.");
    }
  }
  guideSelect.onchange = () => {
    goalGuide = guideSelect.value;
    if (goalGuide === "id-male-adult") goalMl = 2500;
    else if (goalGuide === "id-female-adult") goalMl = 2350;
    else if (goalGuide === "off") goalMl = 0;
    goalInput.value = String(goalMl);
    save();
  };
  add.onclick = () => {
    resetDay();
    glasses = Math.min(99, glasses + 1);
    save();
  };
  undo.onclick = () => {
    resetDay();
    glasses = Math.max(0, glasses - 1);
    save();
  };
  goalInput.onchange = () => {
    goalMl = normalizeGoal(Number(goalInput.value));
    goalGuide = goalMl ? "custom" : "off";
    guideSelect.value = goalGuide;
    goalInput.value = String(goalMl);
    save();
  };
  sizeSelect.onchange = () => {
    servingMl = Number(sizeSelect.value) || 250;
    save();
  };
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && day !== localDateKey(/* @__PURE__ */ new Date())) {
      glasses = 0;
      paint();
    }
  });
  glasses = storedCount();
  paint();
  return { card, settings: personalize, localize: paint };
}
const newsTopicLabels = { books: ["Books & literature", "Buku & sastra"], science: ["Science", "Sains"], nature: ["Nature & climate", "Alam & iklim"], art: ["Art & design", "Seni & desain"], technology: ["Technology", "Teknologi"], culture: ["Culture & film", "Budaya & film"] };
const newsSourceLabels = { auto: ["Automatic", "Otomatis"], google: ["Google News", "Google News"], gdelt: ["GDELT", "GDELT"], antara: ["ANTARA", "ANTARA"] };
function appendFeedEmptyScene(parent, kind) {
  const scene = node("span", "home-feed-empty-scene", parent);
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = kind === "news" ? '<svg viewBox="0 0 120 86"><path d="M16 27 60 13l44 14v45L60 59 16 72Z"/><path d="M60 13v46M27 34l22-7m-22 17 22-7m22-3 22 7m-22 3 22 7"/><circle cx="91" cy="19" r="9"/><path d="m91 13 1.8 4.2L97 19l-4.2 1.8L91 25l-1.8-4.2L85 19l4.2-1.8Z"/></svg>' : '<svg viewBox="0 0 120 86"><rect x="25" y="12" width="70" height="61" rx="12"/><path d="M25 30h70M43 8v12m34-12v12M42 45h10m16 0h10m-36 14h10m16 0h10"/><path d="m83 45 2.5 5 5.5 2.5-5.5 2.5-2.5 5-2.5-5L75 52.5l5.5-2.5Z"/></svg>';
}
function makeFeedWidget(kind, t) {
  const card = node("article", "home-widget-card home-feed-card tw:rounded-3xl tw:border tw:border-sela-line/70 tw:bg-sela-surface/75 tw:p-4 tw:shadow-sm tw:backdrop-blur-lg tw:sm:p-5");
  const header = node("div", "home-widget-heading tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3", card), copy = node("div", "tw:min-w-0 tw:flex-1"), title = node("h2", "tw:mb-1 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink", copy), subtitle = node("p", "home-widget-subtitle tw:m-0 tw:text-xs tw:leading-5 tw:text-sela-muted", copy);
  header.append(copy);
  const controls = node("div", "tw:flex tw:shrink-0 tw:items-center tw:gap-1", header), list = node("div", "home-feed-list tw:mt-3 tw:space-y-1");
  list.setAttribute("aria-live", "polite");
  list.setAttribute("aria-busy", "false");
  card.append(list);
  const refresh = iconAction(node("button", "tw:grid tw:size-10 tw:place-items-center tw:rounded-full tw:text-sela-muted tw:transition-colors tw:hover:bg-sela-canvas tw:hover:text-sela-accent", controls), "refresh", t("Refresh stories", "Muat ulang cerita"));
  refresh.type = "button";
  let topicButton, sourcePicker, sequence = 0, controller, topics = readNewsTopics(), source = readNewsSource();
  if (kind === "on-this-day") {
    title.textContent = t("On this day", "Pada hari ini");
    subtitle.textContent = t("A small window into the past.", "Jendela kecil untuk melihat masa lalu.");
  } else {
    title.textContent = t("Around the world", "Kabar dari berbagai tempat");
    subtitle.textContent = t("Stories shaped by your topics and app language.", "Berita sesuai topik dan bahasa aplikasi.");
    sourcePicker = node("select", "tw:h-10 tw:w-[7.5rem] tw:min-w-0 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:px-2.5 tw:text-[11px] tw:font-medium tw:text-sela-ink tw:shadow-sm tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-sela-accent", controls);
    sourcePicker.setAttribute("aria-label", t("News source", "Sumber berita"));
    sourcePicker.title = t("Choose a news source", "Pilih sumber berita");
    for (const value of ["auto", "google", "gdelt", "antara"]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = t(...newsSourceLabels[value]);
      sourcePicker.append(option);
    }
    topicButton = iconAction(node("button", "tw:grid tw:size-10 tw:place-items-center tw:rounded-full tw:text-sela-muted tw:transition-colors tw:hover:bg-sela-canvas tw:hover:text-sela-accent", controls), "sliders", t("Choose news topics", "Pilih topik berita"));
    topicButton.type = "button";
  }
  function render(items, state = "ready") {
    list.replaceChildren();
    list.dataset.feedState = items.length ? "ready" : state;
    card.classList.toggle("home-feed-is-empty", !items.length);
    if (!items.length) {
      const empty = node("div", "home-feed-empty", list);
      appendFeedEmptyScene(empty, kind);
      const copy2 = node("div", "", empty), heading = node("strong", "home-feed-empty-title", copy2), message = node("p", "home-feed-empty-copy", copy2);
      heading.textContent = kind === "news" ? t(state === "error" ? "Stories are taking a little break" : "A quiet moment for your news shelf", "Rak berita sedang beristirahat sebentar") : t(state === "error" ? "Today\u2019s little history note is resting" : "A quiet moment in history", "Catatan sejarah hari ini sedang beristirahat");
      message.textContent = kind === "news" ? state === "error" ? t("The news services could not be reached. Your last saved stories will return when available.", "Layanan berita belum dapat dijangkau. Berita tersimpan akan tampil lagi saat layanan tersedia.") : t("No matching stories right now. Try another topic or refresh later.", "Belum ada berita yang cocok. Coba topik lain atau muat ulang nanti.") : state === "error" ? t("This source could not be reached. Try again when you are online.", "Sumber belum dapat dijangkau. Coba lagi saat online.") : t("No story is available for this date yet.", "Belum ada cerita untuk tanggal ini.");
      return;
    }
    for (const item of items.slice(0, 4)) {
      const link = node("a", "home-feed-item tw:group tw:flex tw:min-w-0 tw:items-start tw:gap-3 tw:rounded-2xl tw:px-2 tw:py-2 tw:text-inherit tw:no-underline tw:transition-colors tw:hover:bg-sela-canvas/75 tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-sela-accent", list);
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (kind === "news" || item.image) {
        const cover = node("span", "home-feed-image tw:relative tw:grid tw:size-[4.5rem] tw:shrink-0 tw:place-items-center tw:overflow-hidden tw:rounded-xl tw:bg-sela-canvas tw:text-sela-muted tw:shadow-sm tw:sm:size-20", link);
        cover.append(controlIcon(kind === "news" ? "newspaper" : "calendar"));
        if (item.image) {
          const image = node("img", "tw:absolute tw:inset-0 tw:h-full tw:w-full tw:object-cover", cover);
          image.src = item.image;
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          image.referrerPolicy = "no-referrer";
          image.onerror = () => image.remove();
        }
      }
      const text = node("span", "home-feed-copy tw:min-w-0 tw:flex-1 tw:py-0.5", link), headline = node("strong", "tw:line-clamp-3 tw:text-sm tw:font-medium tw:leading-5 tw:text-sela-ink group-hover:tw:text-sela-accent", text);
      headline.textContent = item.title;
      if (kind === "news" && item.description) {
        const summary = node("span", "home-feed-description tw:mt-1 tw:line-clamp-2 tw:text-xs tw:leading-4 tw:text-sela-muted", text);
        summary.textContent = item.description;
      }
      if (kind === "on-this-day" && item.year) {
        const year = node("small", "tw:mt-1 tw:block tw:text-[11px] tw:text-sela-muted", text);
        year.textContent = String(item.year);
      }
      if (kind === "news" && item.source) {
        const source2 = node("small", "tw:mt-1 tw:block tw:truncate tw:text-[11px] tw:font-medium tw:text-sela-muted", text);
        source2.textContent = item.source;
      }
    }
  }
  async function load() {
    const current = ++sequence;
    controller?.abort();
    controller = new AbortController();
    refresh.disabled = true;
    list.setAttribute("aria-busy", "true");
    list.dataset.feedState = "loading";
    list.replaceChildren();
    for (let index = 0; index < 4; index++) {
      const skeleton = node("div", "home-feed-skeleton", list);
      skeleton.setAttribute("aria-hidden", "true");
      node("span", "home-feed-skeleton-image", skeleton);
      const lines = node("span", "home-feed-skeleton-lines", skeleton);
      node("i", "", lines);
      node("i", "", lines);
    }
    try {
      const items = kind === "on-this-day" ? await loadOnThisDay(locale(), /* @__PURE__ */ new Date(), controller.signal) : await loadTopicNews(topics, locale(), controller.signal, source, (partial) => {
        if (current === sequence) render(partial);
      });
      if (current === sequence) render(items, items.length ? "ready" : "empty");
    } catch (error) {
      if (current !== sequence || controller.signal.aborted) return;
      render([], "error");
    } finally {
      if (current === sequence) {
        refresh.disabled = false;
        list.setAttribute("aria-busy", "false");
      }
    }
  }
  function openTopicSettings() {
    if (kind !== "news") return;
    const body = node("div", "personal-sheet news-topics-sheet tw:space-y-3"), hint = node("p", "tw:text-sm tw:leading-6 tw:text-sela-muted", body);
    hint.textContent = t("Choose up to four topics. Only topic words and your app language are sent to the news service.", "Pilih maksimal empat topik. Hanya kata topik dan bahasa aplikasi yang dikirim ke layanan berita.");
    const checks = /* @__PURE__ */ new Map();
    for (const key of HOME_NEWS_TOPICS) {
      const row = node("label", "tw:flex tw:min-h-12 tw:items-center tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-line tw:px-3 tw:py-2 tw:text-sm tw:font-medium tw:text-sela-ink", body), input = node("input", "tw:size-4 tw:accent-sela-accent", row);
      input.type = "checkbox";
      input.checked = topics.includes(key);
      input.value = key;
      checks.set(key, input);
      const label = node("span", "", row);
      label.textContent = t(...newsTopicLabels[key]);
    }
    const save = node("button", "tw:min-h-11 tw:w-full tw:rounded-2xl tw:bg-sela-accent tw:px-4 tw:font-semibold tw:text-white", body);
    save.type = "button";
    save.textContent = t("Save topics", "Simpan topik");
    const modal = bottomSheet(t("Your news topics", "Topik berita pilihanmu"), body);
    modal.element.addEventListener("close", () => modal.destroy(), { once: true });
    save.onclick = () => {
      const selected = [...checks].filter(([, input]) => input.checked).map(([key]) => key);
      if (!selected.length) {
        notify(t("Choose at least one topic.", "Pilih minimal satu topik."), "info");
        return;
      }
      topics = saveNewsTopics(selected);
      modal.close();
      void load();
    };
    modal.open();
  }
  function localize() {
    title.textContent = kind === "news" ? t("Around the world", "Kabar dari berbagai tempat") : t("On this day", "Pada hari ini");
    subtitle.textContent = kind === "news" ? t("Stories shaped by your topics and app language.", "Berita sesuai topik dan bahasa aplikasi.") : t("A small window into the past.", "Jendela kecil untuk melihat masa lalu.");
    if (topicButton) iconAction(topicButton, "sliders", t("Choose news topics", "Pilih topik berita"));
    if (sourcePicker) {
      sourcePicker.setAttribute("aria-label", t("News source", "Sumber berita"));
      sourcePicker.title = t("Choose a news source", "Pilih sumber berita");
      for (const option of [...sourcePicker.options]) option.textContent = t(...newsSourceLabels[option.value]);
      const antarOption = [...sourcePicker.options].find((option) => option.value === "antara");
      if (antarOption) antarOption.disabled = localeBase(locale()) !== "id";
      sourcePicker.value = source;
    }
    iconAction(refresh, "refresh", t("Refresh stories", "Muat ulang cerita"));
  }
  sourcePicker?.addEventListener("change", () => {
    source = saveNewsSource(sourcePicker?.value);
    void load();
  });
  refresh.onclick = () => void load();
  topicButton?.addEventListener("click", openTopicSettings);
  document.addEventListener("sela:language", () => {
    if (localeBase(locale()) !== "id" && source === "antara") {
      source = saveNewsSource("auto");
    }
    localize();
    void load();
  });
  localize();
  void load();
  return { card, localize() {
    localize();
    void load();
  } };
}
const faithNames = { islam: ["Islamic reading", "Bacaan Islami"], christianity: ["Christian reading", "Bacaan Nasrani"], protestantism: ["Protestant reading", "Bacaan Kristen Protestan"], catholicism: ["Catholic reading", "Bacaan Katolik"], judaism: ["Jewish reading", "Bacaan Yahudi"], buddhism: ["Buddhist reading", "Bacaan Buddha"], hinduism: ["Hindu reading", "Bacaan Hindu"], sikhism: ["Sikh reading", "Bacaan Sikh"], confucianism: ["Confucian classics", "Klasik Konghucu"] };
function makeFaithLibraryDialog(t, openBook, getFaith) {
  const dialog = node("dialog", "tw:w-[min(44rem,calc(100%-2rem))] tw:max-w-none tw:rounded-3xl tw:border tw:border-sela-line tw:bg-sela-surface tw:p-0 tw:text-sela-ink tw:shadow-2xl tw:backdrop:bg-slate-950/45 tw:backdrop:backdrop-blur-sm");
  dialog.setAttribute("aria-labelledby", "faith-library-title");
  const form = node("form", "tw:grid tw:gap-5 tw:p-5 tw:sm:p-7", dialog);
  form.method = "dialog";
  const header = node("div", "tw:flex tw:items-start tw:justify-between tw:gap-4", form), headingCopy = node("div", "tw:min-w-0", header), kicker = node("p", "tw:mb-1 tw:text-[10px] tw:font-bold tw:tracking-[.16em] tw:text-sela-accent", headingCopy), heading = node("h2", "tw:m-0 tw:text-xl tw:font-bold tw:tracking-tight tw:text-sela-ink", headingCopy), closeButton = node("button", "tw:grid tw:size-10 tw:shrink-0 tw:place-items-center tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-canvas/60 tw:text-sela-muted hover:tw:text-sela-ink", header);
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", t("Close", "Tutup"));
  closeButton.append(controlIcon("close"));
  kicker.textContent = t("SOURCE TEXTS", "TEKS BERSUMBER");
  heading.id = "faith-library-title";
  heading.textContent = t("Browse a text", "Jelajahi bacaan");
  const description = node("p", "tw:m-0 tw:text-sm tw:leading-6 tw:text-sela-muted", form);
  description.textContent = t("Choose a book and chapter. The edition and source will stay attached in the reader.", "Pilih kitab dan bab. Edisi dan sumber akan tetap dicantumkan di reader.");
  const fields = node("div", "tw:grid tw:grid-cols-1 tw:gap-3 tw:sm:grid-cols-2", form);
  const bookLabel = node("label", "tw:grid tw:min-w-0 tw:gap-2 tw:text-xs tw:font-semibold tw:text-sela-muted", fields);
  bookLabel.append(document.createTextNode(t("Book", "Kitab")));
  const bookSelect = node("select", "tw:min-h-12 tw:w-full tw:min-w-0 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:px-3 tw:text-sm tw:text-sela-ink focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-sela-accent/30", bookLabel);
  bookSelect.setAttribute("aria-label", t("Book", "Kitab"));
  const chapterLabel = node("label", "tw:grid tw:min-w-0 tw:gap-2 tw:text-xs tw:font-semibold tw:text-sela-muted", fields);
  chapterLabel.append(document.createTextNode(t("Chapter", "Bab")));
  const chapterSelect = node("select", "tw:min-h-12 tw:w-full tw:min-w-0 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:px-3 tw:text-sm tw:text-sela-ink focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-sela-accent/30", chapterLabel);
  chapterSelect.setAttribute("aria-label", t("Chapter", "Bab"));
  const attribution = node("p", "tw:m-0 tw:rounded-2xl tw:bg-sela-canvas/70 tw:p-3 tw:text-xs tw:leading-5 tw:text-sela-muted", form), status = node("p", "tw:m-0 tw:min-h-5 tw:text-xs tw:text-sela-muted", form);
  status.setAttribute("role", "status");
  const actions = node("div", "tw:flex tw:flex-wrap tw:justify-end tw:gap-2", form), cancel = node("button", "tw:min-h-11 tw:rounded-full tw:border tw:border-sela-line tw:bg-transparent tw:px-4 tw:text-sm tw:font-semibold tw:text-sela-ink hover:tw:bg-sela-canvas", actions), open = node("button", "tw:inline-flex tw:min-h-11 tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-5 tw:text-sm tw:font-semibold tw:text-white hover:tw:brightness-105 disabled:tw:opacity-50", actions);
  cancel.type = "button";
  open.type = "submit";
  cancel.textContent = t("Cancel", "Batal");
  open.append(controlIcon("read"));
  node("span", "", open).textContent = t("Open in Sela", "Buka di Sela");
  document.body.append(dialog);
  let library = null, selectedFaith = "none", books = [], chapters = [];
  function addOption(select, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }
  function chapterForSelection() {
    return chapters[Number(chapterSelect.value)] ?? chapters[0];
  }
  function refreshChapters() {
    chapterSelect.replaceChildren();
    const book = books[Number(bookSelect.value)];
    chapters = book?.chapters || [];
    chapters.forEach((chapter, index) => addOption(chapterSelect, String(index), chapter.title || `${t("Chapter", "Bab")} ${chapter.number}`));
    chapterLabel.hidden = !chapters.length;
    chapterSelect.disabled = !chapters.length;
    open.disabled = !chapters.length;
  }
  bookSelect.onchange = () => {
    if (library?.books?.length && selectedFaith === "confucianism") {
      open.disabled = !books[Number(bookSelect.value)];
    } else if (library?.books?.length) refreshChapters();
    else {
      chapters = library?.chapters || [];
      open.disabled = !chapters[Number(bookSelect.value)];
    }
  };
  async function show() {
    selectedFaith = getFaith();
    if (selectedFaith === "islam" || selectedFaith === "none") return;
    if (!dialog.open) dialog.showModal();
    status.textContent = t("Loading local edition\u2026", "Memuat edisi lokal\u2026");
    open.disabled = true;
    bookSelect.disabled = true;
    chapterSelect.disabled = true;
    try {
      library = await loadFaithLibrary(selectedFaith);
      if (!dialog.open || getFaith() !== selectedFaith) return;
      books = library.books || [];
      bookSelect.replaceChildren();
      if (library.books?.length) {
        books = library.books;
        books.forEach((book, index) => addOption(bookSelect, String(index), book.name || book.title || `${t("Book", "Kitab")} ${index + 1}`));
        bookLabel.firstChild.textContent = selectedFaith === "confucianism" ? t("Book", "Kitab") : t("Book", "Kitab");
        bookLabel.hidden = false;
      } else if (library.chapters?.length) {
        books = [];
        chapters = library.chapters;
        library.chapters.forEach((chapter, index) => addOption(bookSelect, String(index), chapter.title || `${t("Chapter", "Bab")} ${chapter.number}`));
        bookLabel.firstChild.textContent = t("Chapter", "Bab");
        bookLabel.hidden = false;
        chapterLabel.hidden = true;
      } else throw Error("This edition has no readable chapters.");
      if (library.books?.length && selectedFaith === "confucianism") {
        chapterLabel.hidden = true;
        chapters = [];
      } else if (library.books?.length) refreshChapters();
      bookSelect.disabled = false;
      chapterSelect.disabled = !chapters.length;
      const canOpen = selectedFaith === "confucianism" ? books.length > 0 : chapters.length > 0;
      open.disabled = !canOpen;
      const translator = library.translator ? ` \xB7 ${library.translator}` : "";
      const faithLabel = faithNames[selectedFaith];
      attribution.textContent = `${library.edition || library.title || t(faithLabel[0], faithLabel[1])}${translator} \xB7 ${library.license || t("Edition details", "Detail edisi")}`;
      status.textContent = t("Available offline after this edition has loaded once.", "Tersedia offline setelah edisi ini selesai dimuat sekali.");
    } catch (error) {
      if (!dialog.open) return;
      status.textContent = t("This local edition could not be loaded. Check the connection once, then retry.", "Edisi lokal belum dapat dimuat. Periksa koneksi sekali, lalu coba lagi.");
      notify(error instanceof Error ? error.message : String(error), "error");
    }
  }
  function closeDialog() {
    dialog.close();
  }
  closeButton.onclick = closeDialog;
  cancel.onclick = closeDialog;
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!library) return;
    const faith = selectedFaith;
    if (faith === "none") return;
    const book = library.books?.length ? books[Number(bookSelect.value)] : void 0, chapter = library.chapters?.length ? library.chapters[Number(bookSelect.value)] : faith === "confucianism" ? void 0 : chapterForSelection();
    const title = faith === "confucianism" ? book?.title || library.title : chapter?.title || `${t("Chapter", "Bab")} ${chapter?.number}`;
    const verses = chapter?.verses?.map((verse) => `${verse.number}. ${verse.text}`).join("\n") || chapter?.text || book?.text || "";
    const text = verses.trim();
    if (!text) {
      status.textContent = t("This section has no readable text. Choose another chapter.", "Bagian ini tidak memiliki teks yang dapat dibaca. Pilih bab lain.");
      return;
    }
    const bookName = faith === "confucianism" || !book ? "" : `${book.name || book.title} \xB7 `, reference = faith === "confucianism" ? String(book?.title || "") : bookName + title;
    const faithLabel = faithNames[faith];
    const reading = { faith, title: library.edition || library.title || t(faithLabel[0], faithLabel[1]), text, reference, attribution: [library.edition || library.title || t(faithLabel[0], faithLabel[1]), library.translator, library.license].filter(Boolean).join(" \xB7 "), sourceUrl: library.source || faithSource(faith), language: "en", license: library.license };
    closeDialog();
    void openFaithReadingInSela(reading, openBook).catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
  });
  return { show, dialog };
}
function makeFaithWidget(t, openBook) {
  const card = node("article", "home-widget-card home-faith-widget tw:relative tw:rounded-3xl tw:border tw:border-sela-line/70 tw:bg-sela-canvas/25 tw:p-4 tw:shadow-sm tw:backdrop-blur-sm tw:sm:p-5");
  card.hidden = true;
  const header = node("div", "home-widget-heading tw:flex tw:items-start tw:gap-3", card), badge = node("span", "tw:grid tw:size-10 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-accent/10 tw:text-sela-accent", header), mark = controlIcon("sparkles");
  badge.append(mark);
  const copy = node("div", "tw:min-w-0 tw:flex-1", header), title = node("h2", "tw:mb-1 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink", copy), subtitle = node("p", "home-widget-subtitle tw:m-0 tw:text-xs tw:leading-5 tw:text-sela-muted", copy);
  const quote = node("blockquote", "home-faith-quote tw:my-4 tw:text-base tw:leading-7 tw:text-sela-ink", card), reference = node("p", "tw:mb-1 tw:text-xs tw:font-semibold tw:text-sela-ink", card), attribution = node("p", "tw:m-0 tw:text-xs tw:leading-5 tw:text-sela-muted", card), actions = node("div", "tw:mt-4 tw:flex tw:flex-wrap tw:items-center tw:gap-2", card), read = node("button", "tw:inline-flex tw:min-h-10 tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-4 tw:text-sm tw:font-semibold tw:text-white tw:transition tw:hover:brightness-105", actions);
  card.style.backgroundImage = `linear-gradient(125deg,color-mix(in srgb,var(--panel) 82%,transparent),color-mix(in srgb,var(--palette-soft,var(--panel)) 82%,transparent)),${QURAN_SCENE_BACKGROUND},${QURAN_PATTERN_BACKGROUND}`;
  card.style.backgroundSize = "auto,cover,180px 180px";
  card.style.backgroundPosition = "center,center,center";
  card.style.backgroundRepeat = "no-repeat,no-repeat,repeat";
  read.type = "button";
  badge.setAttribute("aria-hidden", "true");
  read.append(controlIcon("read"));
  const readLabel = node("span", "", read);
  const browse = node("button", "tw:inline-flex tw:min-h-10 tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface/75 tw:px-4 tw:text-sm tw:font-semibold tw:text-sela-ink tw:transition hover:tw:border-sela-accent hover:tw:text-sela-accent", actions);
  browse.type = "button";
  browse.append(controlIcon("books"));
  const browseLabel = node("span", "", browse);
  const source = node("a", "tw:inline-flex tw:min-h-10 tw:items-center tw:gap-1.5 tw:rounded-full tw:px-3 tw:text-sm tw:font-semibold tw:text-sela-muted tw:underline-offset-4 tw:hover:bg-sela-canvas tw:hover:text-sela-accent tw:hover:underline", actions);
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.append(controlIcon("info"));
  const sourceLabel = node("span", "", source);
  let current = null, faith = "none", sequence = 0, controller;
  const faithLibrary = makeFaithLibraryDialog(t, openBook, () => faith);
  function localize() {
    if (faith === "none") return;
    title.textContent = faith === "islam" ? t("Verse of the day", "Ayat hari ini") : t("Reading of the day", "Bacaan hari ini");
    subtitle.textContent = t("A passage with its edition and source attached.", "Bacaan dengan edisi dan sumber yang dicantumkan.");
    readLabel.textContent = faith === "islam" ? t("Open verse in the Quran", "Buka ayat di Al-Qur\u2019an") : t("Read in Sela", "Baca di Sela");
    browseLabel.textContent = t("Browse library", "Jelajahi pustaka");
    browse.hidden = true;
    sourceLabel.textContent = t("Source", "Sumber");
  }
  async function load() {
    const next = readPersonal().faith;
    if (next === faith && current) return;
    faith = next;
    controller?.abort();
    const run = ++sequence;
    if (faith === "none") {
      card.hidden = true;
      current = null;
      return;
    }
    card.hidden = false;
    current = null;
    localize();
    quote.textContent = t("Finding a reading from the selected source\u2026", "Mencari bacaan dari sumber pilihan\u2026");
    reference.textContent = "";
    attribution.textContent = "";
    source.href = faithSource(faith);
    source.hidden = false;
    read.disabled = true;
    controller = new AbortController();
    try {
      const item = await loadFaithReading(faith, locale(), /* @__PURE__ */ new Date(), controller.signal);
      if (run !== sequence) return;
      if (!item) {
        quote.textContent = t("No compatible text source is available right now. Open the source library for its current editions.", "Sumber teks yang cocok belum tersedia. Buka pustaka sumber untuk melihat edisinya.");
        read.disabled = true;
        return;
      }
      current = item;
      quote.textContent = item.text;
      quote.dir = item.direction || "auto";
      reference.textContent = item.reference;
      attribution.textContent = item.attribution + (item.language ? ` \xB7 ${item.language.toUpperCase()}` : "");
      source.href = item.sourceUrl;
      read.disabled = false;
    } catch (error) {
      if (run !== sequence || controller.signal.aborted) return;
      quote.textContent = t("This source is temporarily unavailable. Open its original library or try again later.", "Sumber ini sedang tidak tersedia. Buka perpustakaan aslinya atau coba lagi nanti.");
      reference.textContent = "";
      attribution.textContent = "";
      read.disabled = true;
    }
  }
  async function openQuranDirect() {
    const saved = readPersonal(), dailyReference = current?.reference.match(/(?:Surah|Surat)\s+(\d+)\s*:\s*(\d+)|\b(\d{1,3})\s*:\s*(\d+)\b/i), language = saved.quranLanguage || localeBase(locale()), hasSaved = !!saved.quranLanguage, translationKey = hasSaved ? saved.quranTranslationKey : void 0, surah = hasSaved ? saved.quranSurah || 1 : Number(dailyReference?.[1] || dailyReference?.[3]) || 1, verse = hasSaved ? saved.quranVerse || 1 : Number(dailyReference?.[2] || dailyReference?.[4]) || 1;
    await openQuranInSela(surah, language, openBook, void 0, { translationKey, arabicSize: saved.quranArabicSize, translationSize: saved.quranTranslationSize, verse });
    editPersonal((data) => {
      data.quranLanguage = language;
      data.quranSurah = surah;
      data.quranVerse = verse;
    });
  }
  const navigateQuran = (event) => {
    const detail = event.detail || {}, surah = Number(detail.surah), verse = Number(detail.verse), language = String(detail.language || "en"), translationKey = String(detail.translationKey || "");
    if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(verse) || verse < 1 || !["id", "en", "ja"].includes(language) || !/^[a-z0-9_]{1,80}$/.test(translationKey)) {
      detail.complete?.(new Error(t("The Quran location is not valid.", "Lokasi Al-Qur\u2019an tidak valid.")));
      return;
    }
    const arabicSize = Math.max(20, Math.min(48, Math.round(Number(detail.arabicSize) || 32))), translationSize = Math.max(14, Math.min(28, Math.round(Number(detail.translationSize) || 18)));
    editPersonal((data) => {
      data.quranTranslationKey = translationKey;
      data.quranLanguage = language;
      data.quranSurah = surah;
      data.quranVerse = verse;
      data.quranArabicSize = arabicSize;
      data.quranTranslationSize = translationSize;
    });
    void openQuranInSela(surah, language, openBook, void 0, { translationKey, arabicSize, translationSize, verse }).then(() => detail.complete?.()).catch((error) => detail.complete?.(error));
  };
  const updateQuranPreferences = (event) => {
    const detail = event.detail || {};
    if (!["id", "en", "ja"].includes(detail.language) || !/^[a-z0-9_]{1,80}$/.test(String(detail.translationKey || ""))) return;
    editPersonal((data) => {
      data.quranLanguage = detail.language;
      data.quranTranslationKey = detail.translationKey;
      data.quranSurah = Math.max(1, Math.min(114, Math.round(Number(detail.surah) || 1)));
      data.quranVerse = Math.max(1, Math.min(286, Math.round(Number(detail.verse) || 1)));
      data.quranArabicSize = Math.max(20, Math.min(48, Math.round(Number(detail.arabicSize) || 32)));
      data.quranTranslationSize = Math.max(14, Math.min(28, Math.round(Number(detail.translationSize) || 18)));
    });
  };
  document.addEventListener("sela:quran-navigate", navigateQuran);
  document.addEventListener("sela:quran-preferences", updateQuranPreferences);
  read.onclick = () => {
    if (faith === "islam") {
      void openQuranDirect().catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
      return;
    }
    if (current) void openFaithReadingInSela(current, openBook).catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
  };
  browse.onclick = () => void faithLibrary.show();
  document.addEventListener("sela:personal", () => void load());
  document.addEventListener("sela:language", () => {
    current = null;
    void load();
  });
  void load();
  return { card, openLibrary: () => faithLibrary.show(), localize() {
    localize();
    if (faith !== readPersonal().faith) {
      faith = "none";
      current = null;
    }
    void load();
  } };
}
function makeFaithShelf(t, openLibrary) {
  const section = node("section", "faith-reading-shelf tw:min-w-0 tw:space-y-3");
  section.hidden = true;
  section.setAttribute("aria-labelledby", "faith-reading-shelf-title");
  const card = node("article", "tw:flex tw:min-w-0 tw:flex-col tw:gap-4 tw:rounded-3xl tw:border tw:border-sela-line/80 tw:bg-sela-surface/85 tw:p-4 tw:shadow-sm tw:backdrop-blur-xl tw:sm:flex-row tw:sm:items-center tw:sm:justify-between tw:sm:p-5", section), identity = node("div", "tw:flex tw:min-w-0 tw:items-center tw:gap-3", card), mark = node("span", "tw:grid tw:size-11 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-accent/10 tw:text-sela-accent", identity), copy = node("div", "tw:min-w-0", identity), title = node("h2", "tw:m-0 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink", copy), description = node("p", "tw:mb-0 tw:mt-1 tw:text-xs tw:leading-5 tw:text-sela-muted", copy), button = node("button", "tw:inline-flex tw:min-h-11 tw:shrink-0 tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-4 tw:text-sm tw:font-semibold tw:text-white tw:transition hover:tw:brightness-105 focus-visible:tw:outline-2 focus-visible:tw:outline-offset-2 focus-visible:tw:outline-sela-accent", card), buttonLabel = node("span", "", button);
  mark.setAttribute("aria-hidden", "true");
  mark.append(controlIcon("books"));
  button.type = "button";
  button.append(controlIcon("read"));
  button.append(buttonLabel);
  button.onclick = () => {
    void openLibrary();
  };
  function localize() {
    const faith = readPersonal().faith;
    if (faith === "none" || faith === "islam") {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    title.textContent = t(...faithNames[faith]);
    description.textContent = t("Choose a book and chapter from your selected tradition, then read it in Sela.", "Pilih kitab dan bab dari tradisi pilihanmu, lalu baca langsung di Sela.");
    buttonLabel.textContent = t("Choose a reading", "Pilih bacaan");
    button.removeAttribute("aria-label");
  }
  document.addEventListener("sela:personal", localize);
  document.addEventListener("sela:language", localize);
  localize();
  return { section, localize };
}
function makeIslamicShelf(t, openBook) {
  const section = node("section", "faith-scripture-shelf tw:space-y-6");
  section.hidden = true;
  section.setAttribute("aria-labelledby", "faith-scripture-shelf-title");
  const heading = node("div", "home-scripture-shelf-heading tw:flex tw:items-center tw:justify-between tw:gap-4", section), copy = node("div", "tw:min-w-0", heading), title = node("h2", "tw:m-0 tw:text-xl tw:font-bold tw:tracking-tight tw:text-sela-ink", copy), subtitle = node("p", "tw:mb-0 tw:mt-1 tw:max-w-2xl tw:text-sm tw:leading-6 tw:text-sela-muted", copy), sticker = node("span", "tw:hidden tw:size-12 tw:shrink-0 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface tw:shadow-sm tw:md:block", heading);
  title.id = "faith-scripture-shelf-title";
  sticker.setAttribute("aria-hidden", "true");
  sticker.style.backgroundImage = 'url("' + new URL("../library/assets/jculture-companions-v3.webp", import.meta.url).href + '")';
  sticker.style.backgroundSize = "200% 200%";
  sticker.style.backgroundPosition = "0 0";
  const quranBooks = [
    { english: "The Quran", indonesian: "Al-Qur\u2019an", arabic: "\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645", surah: 1, verse: 1, color: "#4d8fc4", reference: "Surah 1" },
    { english: "Yasin", indonesian: "Yasin", arabic: "\u064A\u0633", surah: 36, verse: 1, color: "#6a83c5", reference: "Surah 36" },
    { english: "Al-Mulk", indonesian: "Al-Mulk", arabic: "\u0627\u0644\u0645\u0644\u0643", surah: 67, verse: 1, color: "#55a89a", reference: "Surah 67" },
    { english: "Al-Kahf", indonesian: "Al-Kahf", arabic: "\u0627\u0644\u0643\u0647\u0641", surah: 18, verse: 1, color: "#769b72", reference: "Surah 18" },
    { english: "Ayat Kursi", indonesian: "Ayat Kursi", arabic: "\u0622\u064A\u0629 \u0627\u0644\u0643\u0631\u0633\u064A", surah: 2, verse: 255, color: "#8a77bc", reference: "Al-Baqarah \xB7 255" },
    { english: "Quranic Duas", indonesian: "Doa Qur\u2019ani", arabic: "\u0631\u064E\u0628\u064E\u0651\u0646\u064E\u0627", surah: 2, verse: 201, color: "#548eaa", reference: "Al-Baqarah \xB7 201" }
  ];
  const lifeTopics = [
    { english: "Family & respect", indonesian: "Keluarga & hormat", arabic: "\u0623\u064F\u0633\u0652\u0631\u064E\u0629", color: "#648fbb", surah: 17, verse: 23, topic: true, reference: "Al-Isra 17:23\u201324", referenceId: "Al-Isra 17:23\u201324", detailEn: "Parents, kindness, and care across generations.", detailId: "Berbakti, berbuat baik, dan saling menjaga." },
    { english: "Justice & fairness", indonesian: "Keadilan", arabic: "\u0639\u064E\u062F\u0652\u0644", color: "#4b928a", surah: 4, verse: 135, topic: true, reference: "An-Nisa 4:135", referenceId: "An-Nisa 4:135", detailEn: "Stand for justice, even when it is difficult.", detailId: "Menegakkan keadilan, termasuk saat terasa berat." },
    { english: "Words & community", indonesian: "Ucapan & hidup bersama", arabic: "\u0643\u064E\u0644\u0650\u0645\u064E\u0629", color: "#7183bd", surah: 49, verse: 11, topic: true, reference: "Al-Hujurat 49:11\u201313", referenceId: "Al-Hujurat 49:11\u201313", detailEn: "Respect, avoid mockery, and know one another.", detailId: "Menghormati, menghindari ejekan, dan saling mengenal." },
    { english: "Hope through hardship", indonesian: "Harapan saat sulit", arabic: "\u0623\u064E\u0645\u064E\u0644", color: "#7a78b5", surah: 94, verse: 5, topic: true, reference: "Ash-Sharh 94:5\u20136", referenceId: "Ash-Sharh 94:5\u20136", detailEn: "Read both verses in their surrounding context.", detailId: "Baca kedua ayat bersama konteksnya." },
    { english: "Learning & humility", indonesian: "Belajar & rendah hati", arabic: "\u0639\u0650\u0644\u0652\u0645", color: "#448b9c", surah: 20, verse: 114, topic: true, reference: "Ta-Ha 20:114", referenceId: "Ta-Ha 20:114", detailEn: "A prayer to grow in knowledge.", detailId: "Doa untuk bertambah ilmu." },
    { english: "Work & provision", indonesian: "Ikhtiar & rezeki", arabic: "\u0639\u064E\u0645\u064E\u0644", color: "#568a72", surah: 62, verse: 10, topic: true, reference: "Al-Jumu\u2018ah 62:10", referenceId: "Al-Jumu\u2018ah 62:10", detailEn: "Work, remember God, and seek provision.", detailId: "Berusaha, mengingat Allah, dan mencari karunia-Nya." },
    { english: "Generosity & giving", indonesian: "Berbagi & sedekah", arabic: "\u0639\u064E\u0637\u064E\u0627\u0621", color: "#ba8850", surah: 2, verse: 261, topic: true, reference: "Al-Baqarah 2:261", referenceId: "Al-Baqarah 2:261", detailEn: "An image of generosity and its reward.", detailId: "Perumpamaan tentang memberi dan balasannya." },
    { english: "Care for the vulnerable", indonesian: "Peduli sesama", arabic: "\u0631\u064E\u062D\u0652\u0645\u064E\u0629", color: "#ad6b87", surah: 107, verse: 1, topic: true, reference: "Al-Ma\u2018un 107:1\u20137", referenceId: "Al-Ma\u2018un 107:1\u20137", detailEn: "Faith connected with care for people in need.", detailId: "Keimanan yang terhubung dengan kepedulian kepada yang membutuhkan." }
  ];
  const prophetStories = PROPHET_PASSAGES.map((passage, index) => ({ ...passage, color: ["#6c91bd", "#528b9d", "#578e7d", "#bd8b58"][index % 4], story: true }));
  const dailyBooks = [
    { english: "Waking Up", indonesian: "Bangun tidur", arabic: "\u0627\u0644\u062D\u0645\u062F \u0644\u0644\u0647", slug: "waking-up", color: "#6f98c5", reference: "Buruja \xB7 English meaning" },
    { english: "Morning Adhkar", indonesian: "Zikir pagi", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D", slug: "morning-adhkar", color: "#4d9d9b", reference: "Buruja \xB7 English meaning" },
    { english: "After Salah", indonesian: "Sesudah salat", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0644\u0627\u0629", slug: "after-salah", color: "#8c79b9", reference: "Buruja \xB7 English meaning" },
    { english: "Evening Adhkar", indonesian: "Zikir petang", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0645\u0633\u0627\u0621", slug: "evening-adhkar", color: "#607bb0", reference: "Buruja \xB7 English meaning" },
    { english: "Before Sleep", indonesian: "Sebelum tidur", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0646\u0648\u0645", slug: "before-sleep", color: "#697aaf", reference: "Buruja \xB7 English meaning" },
    { english: "Quranic Duas", indonesian: "Doa Qur\u2019ani", arabic: "\u0623\u062F\u0639\u064A\u0629 \u0642\u0631\u0622\u0646\u064A\u0629", slug: "quranic-duas", color: "#5a9e86", reference: "Buruja \xB7 English meaning" },
    { english: "Leaving Home", indonesian: "Keluar rumah", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0645\u0646\u0632\u0644", slug: "home", color: "#4d94aa", reference: "Buruja \xB7 English meaning" },
    { english: "Food & Drink", indonesian: "Makan & minum", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0637\u0639\u0627\u0645", slug: "food-drink", color: "#a078ad", reference: "Buruja \xB7 English meaning" },
    { english: "Travel Duas", indonesian: "Doa perjalanan", arabic: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0633\u0641\u0631", slug: "travel", color: "#648f79", reference: "Buruja \xB7 English meaning" }
  ];
  const groups = [
    { en: "Start with a surah", id: "Mulai dari surat", items: quranBooks, kind: "quran" },
    { en: "Explore life through Quran themes", id: "Jelajahi tema kehidupan dalam Al-Qur\u2019an", items: lifeTopics, kind: "topic" },
    { en: "Stories of the 25 prophets", id: "Kisah 25 nabi", items: prophetStories, kind: "story" },
    { en: "Daily prayers & remembrance", id: "Doa & zikir sehari-hari", items: dailyBooks, kind: "daily" }
  ];
  const carousels = [];
  const slideLocalizers = [];
  function openQuran(book) {
    const saved = readPersonal(), language = saved.quranLanguage || localeBase(locale()), surah = book.surah || 1, verse = book.verse || 1;
    return openQuranInSela(surah, language, openBook, void 0, { translationKey: saved.quranTranslationKey || void 0, arabicSize: saved.quranArabicSize, translationSize: saved.quranTranslationSize, verse }).then(() => editPersonal((data) => {
      data.quranLanguage = language;
      data.quranSurah = surah;
      data.quranVerse = verse;
    }));
  }
  function openStory(book) {
    const language = localeBase(locale()) === "id" ? "id" : "en", name = t(book.english, book.indonesian), summary = language === "id" ? book.storyId || book.storyEn || "" : book.storyEn || book.storyId || "", note = language === "id" ? book.noteId || book.noteEn : book.noteEn || book.noteId;
    const reading = { faith: "islam", title: t("Quranic story \xB7 " + book.english, "Kisah Qur\u2019ani \xB7 " + book.indonesian), text: summary, reference: book.reference, attribution: t("Sela editorial summary based on the Quran reference. Not a tafsir.", "Ringkasan editorial Sela berdasarkan rujukan Al-Qur\u2019an. Bukan kitab tafsir."), sourceUrl: "https://quran.kemenag.go.id/quran/per-ayat/surah/" + (book.surah || 1), language, license: "Original Sela summary; Quran reference: " + book.reference };
    if (note) reading.note = note;
    void openFaithReadingInSela(reading, openBook).catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
  }
  function openDaily(book, button) {
    if (!book.slug) return;
    button.disabled = true;
    void openIslamicReadingInSela(book.slug, t(book.english, book.indonesian), openBook, locale()).catch((error) => notify(error instanceof Error ? error.message : String(error), "error")).finally(() => {
      button.disabled = false;
    });
  }
  for (const group of groups) {
    const wrapper = node("section", "home-scripture-shelf-group tw:min-w-0", section), groupHeading = node("div", "tw:mb-3 tw:flex tw:items-center tw:justify-between tw:gap-3", wrapper), groupTitle = node("h3", "tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink", groupHeading), controls = node("div", "tw:flex tw:shrink-0 tw:gap-2", groupHeading), previous = node("button", "tw:grid tw:size-9 tw:place-items-center tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:text-sela-muted tw:transition hover:tw:text-sela-ink disabled:tw:opacity-40", controls), next = node("button", "tw:grid tw:size-9 tw:place-items-center tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:text-sela-muted tw:transition hover:tw:text-sela-ink disabled:tw:opacity-40", controls);
    previous.type = next.type = "button";
    previous.setAttribute("aria-label", t("Scroll backward", "Gulir ke kiri"));
    next.setAttribute("aria-label", t("Scroll forward", "Gulir ke kanan"));
    previous.append(controlIcon("chevron"));
    previous.firstElementChild?.classList.add("tw:rotate-180");
    next.append(controlIcon("chevron"));
    const viewport = node("div", "tw:overflow-hidden", wrapper), track = node("div", "tw:flex tw:touch-pan-y tw:-ml-3", viewport);
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-roledescription", "carousel");
    const slides = [];
    for (const book of group.items) {
      const slide = node("div", "tw:min-w-0 tw:flex-[0_0_84%] tw:pl-3 tw:sm:flex-[0_0_48%] tw:lg:flex-[0_0_32%] tw:2xl:flex-[0_0_25%]", track);
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slides.push(slide);
      if (group.kind === "story") {
        const card = node("article", "tw:flex tw:h-full tw:min-h-56 tw:min-w-0 tw:flex-col tw:gap-3 tw:rounded-3xl tw:border tw:border-sela-line/80 tw:bg-sela-surface/90 tw:p-4 tw:shadow-sm tw:backdrop-blur-xl", slide), top = node("div", "tw:flex tw:items-start tw:gap-3", card), symbol = node("span", "tw:grid tw:size-11 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-accent/10 tw:text-lg tw:text-sela-accent", top), copy2 = node("div", "tw:min-w-0 tw:flex-1", top), name = node("h4", "tw:mb-1 tw:break-words tw:text-base tw:font-bold tw:leading-tight tw:text-sela-ink", copy2), ref = node("p", "tw:m-0 tw:text-xs tw:leading-5 tw:text-sela-muted", copy2), summary = node("p", "tw:line-clamp-3 tw:m-0 tw:flex-1 tw:text-sm tw:leading-6 tw:text-sela-muted", card), actions = node("div", "tw:flex tw:flex-wrap tw:gap-2", card);
        symbol.textContent = book.arabic || "\u06DE";
        symbol.setAttribute("aria-hidden", "true");
        const storyButton = node("button", "tw:inline-flex tw:min-h-10 tw:flex-1 tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-3 tw:text-sm tw:font-semibold tw:text-white tw:transition hover:tw:brightness-105", actions);
        storyButton.type = "button";
        storyButton.append(controlIcon("read"));
        const storyLabel = node("span", "", storyButton);
        storyButton.onclick = () => openStory(book);
        const verseButton = node("button", "tw:inline-flex tw:min-h-10 tw:flex-1 tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-canvas/70 tw:px-3 tw:text-sm tw:font-semibold tw:text-sela-ink tw:transition hover:tw:border-sela-accent/60", actions);
        verseButton.type = "button";
        verseButton.append(controlIcon("journal"));
        const verseLabel = node("span", "", verseButton);
        verseButton.onclick = () => void openQuran(book).catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
        const localizeSlide = () => {
          const language = localeBase(locale()), storyText = language === "id" ? book.storyId || book.storyEn || "" : book.storyEn || book.storyId || "";
          name.textContent = t(book.english, book.indonesian);
          ref.textContent = t(book.reference, book.referenceId || book.reference);
          summary.textContent = storyText;
          storyLabel.textContent = t("Read story", "Baca kisah");
          verseLabel.textContent = t("Read Quran verse", "Baca ayat Al-Qur\u2019an");
        };
        slideLocalizers.push(localizeSlide);
        localizeSlide();
      } else {
        const card = node("article", "tw:flex tw:h-full tw:min-h-48 tw:min-w-0 tw:flex-col tw:gap-3 tw:rounded-3xl tw:border tw:border-sela-line/80 tw:bg-sela-surface/90 tw:p-4 tw:shadow-sm tw:backdrop-blur-xl", slide), eyebrow = node("div", "tw:flex tw:items-center tw:justify-between tw:gap-3", card), symbol = node("span", "tw:grid tw:size-10 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-accent/10 tw:text-lg tw:text-sela-accent", eyebrow), arabic = node("span", "tw:truncate tw:text-lg tw:text-sela-muted", eyebrow), name = node("h4", "tw:m-0 tw:break-words tw:text-base tw:font-bold tw:leading-tight tw:text-sela-ink", card), reference = node("p", "tw:m-0 tw:text-xs tw:leading-5 tw:text-sela-muted", card), detail = node("p", "tw:mb-0 tw:mt-auto tw:text-sm tw:leading-6 tw:text-sela-muted", card), action = node("button", "tw:inline-flex tw:min-h-10 tw:w-full tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-3 tw:text-sm tw:font-semibold tw:text-white tw:transition hover:tw:brightness-105", card);
        symbol.append(controlIcon(group.kind === "daily" ? "sparkles" : "journal"));
        arabic.textContent = book.arabic;
        action.append(controlIcon("read"));
        const actionLabel = node("span", "", action);
        if (group.kind === "quran") action.onclick = () => void openQuran(book).catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
        else if (group.kind === "topic") action.onclick = () => void openQuran(book).catch((error) => notify(error instanceof Error ? error.message : String(error), "error"));
        else action.onclick = () => openDaily(book, action);
        const localizeSlide = () => {
          name.textContent = t(book.english, book.indonesian);
          if (group.kind === "quran") {
            reference.textContent = t(book.reference, book.referenceId || book.reference);
            detail.textContent = t("Open this surah in the Sela reader.", "Buka surat ini di reader Sela.");
            actionLabel.textContent = t("Read surah", "Baca surat");
          } else if (group.kind === "topic") {
            reference.textContent = t(book.reference, book.referenceId || book.reference);
            detail.textContent = t(book.detailEn || "A Quran reference for this theme.", book.detailId || "Rujukan Al-Qur\u2019an untuk tema ini.");
            actionLabel.textContent = t("Read cited verses", "Baca ayat rujukan");
          } else {
            reference.textContent = t("Daily remembrance \xB7 sourced text", "Zikir harian \xB7 teks bersumber");
            detail.textContent = t("Arabic, transliteration, meaning, and reference.", "Arab, transliterasi, makna, dan rujukan.");
            actionLabel.textContent = t("Open reading", "Buka bacaan");
          }
        };
        slideLocalizers.push(localizeSlide);
        localizeSlide();
      }
    }
    const api = EmblaCarousel(viewport, { align: "start", containScroll: "trimSnaps", dragFree: true, loop: false });
    carousels.push(api);
    const syncControls = () => {
      previous.disabled = !api.canScrollPrev();
      next.disabled = !api.canScrollNext();
    };
    api.on("select", syncControls);
    api.on("reInit", syncControls);
    previous.onclick = () => api.scrollPrev();
    next.onclick = () => api.scrollNext();
    syncControls();
    if (group.kind === "story") {
      const note = node("p", "tw:mb-0 tw:mt-2 tw:max-w-3xl tw:text-xs tw:leading-5 tw:text-sela-muted", wrapper);
      note.dataset.scriptureNote = "true";
      note.textContent = t("These are Quran-based summaries, not a complete biography, tafsir, or dated historical timeline. Some prophets are mentioned only briefly.", "Ini ringkasan berdasarkan Al-Qur\u2019an, bukan biografi lengkap, tafsir, atau kronologi bertanggal. Sebagian nabi hanya disebut singkat.");
    }
  }
  function localize() {
    title.textContent = t("Islamic reading room", "Ruang baca Islami");
    subtitle.textContent = t("Read the Quran by surah or life theme, browse daily prayers, or open a standalone story with its Quran references.", "Baca Al-Qur\u2019an berdasarkan surat atau tema hidup, jelajahi doa harian, atau buka kisah mandiri beserta rujukan ayatnya.");
    for (const [index, group] of groups.entries()) {
      const groupHeading = section.querySelectorAll(".home-scripture-shelf-group h3")[index];
      if (groupHeading) groupHeading.textContent = t(group.en, group.id);
      const api = carousels[index];
      if (api) api.reInit();
    }
    for (const update of slideLocalizers) update();
    const note = section.querySelector("[data-scripture-note]");
    if (note) note.textContent = t("These are Quran-based summaries, not a complete biography, tafsir, or dated historical timeline. Some prophets are mentioned only briefly.", "Ini ringkasan berdasarkan Al-Qur\u2019an, bukan biografi lengkap, tafsir, atau kronologi bertanggal. Sebagian nabi hanya disebut singkat.");
  }
  const updateVisibility = () => {
    section.hidden = readPersonal().faith !== "islam";
    if (!section.hidden) for (const api of carousels) api.reInit();
  };
  document.addEventListener("sela:personal", updateVisibility);
  document.addEventListener("sela:navigation-change", () => {
    if (document.body.dataset.page === "library" && !section.hidden) for (const api of carousels) api.reInit();
  });
  localize();
  return { section, localize() {
    localize();
    updateVisibility();
  } };
}
export function mountHomeWidgets({ t, openBook }) {
  const section = node("section", "home-widgets tw:mt-2 tw:space-y-6");
  section.setAttribute("aria-label", t("Reading room and daily discoveries", "Ruang baca dan temuan harian"));
  const calendar = makeCalendar(t), water = makeWaterWidget(t), history = makeFeedWidget("on-this-day", t), news = makeFeedWidget("news", t), faith = makeFaithWidget(t, openBook), islamicShelf = makeIslamicShelf(t, openBook), faithShelf = makeFaithShelf(t, faith.openLibrary), prayerTimes = mountPrayerTimes(t), daily = node("div", "home-daily-overview", section), utility = node("section", "home-utility-section");
  daily.append(faith.card, prayerTimes.card);
  const utilityHeading = node("h2", "tw:mb-3 tw:text-lg tw:font-semibold tw:tracking-tight tw:text-sela-ink", utility);
  utilityHeading.textContent = t("A little for your day", "Sedikit teman untuk harimu");
  const grid = node("div", "home-utility-grid tw:grid tw:!grid-cols-1 tw:gap-5 tw:lg:!grid-cols-2", utility), primary = node("div", "home-utility-column home-utility-primary tw:min-w-0", grid), secondary = node("div", "home-utility-column home-utility-secondary tw:min-w-0", grid);
  primary.append(calendar.card, history.card);
  secondary.append(water.card, news.card);
  section.append(utility);
  const syncDaily = () => {
    daily.hidden = Boolean(faith.card.hidden && prayerTimes.card.hidden);
    daily.dataset.prayerVisible = String(!prayerTimes.card.hidden);
  };
  document.addEventListener("sela:personal", syncDaily);
  syncDaily();
  return { section, islamicShelf, faithShelf, waterSettings: water.settings, localize() {
    calendar.localize();
    water.localize();
    history.localize();
    news.localize();
    faith.localize();
    islamicShelf.localize();
    faithShelf.localize();
    prayerTimes.localize();
    syncDaily();
    utilityHeading.textContent = t("A little for your day", "Sedikit teman untuk harimu");
    section.setAttribute("aria-label", t("Reading room and daily discoveries", "Ruang baca dan temuan harian"));
  } };
}
