// Generated from app/library/weather.ts by npm run build. Do not edit.
import { bottomSheet, notify } from "./controls.js";
import { node } from "./network.js";
const KEY = "sela-library:weather", ASKED = "sela-library:weather-location-asked", DISABLED = "sela-library:weather-disabled";
const descriptions = (code) => code === 0 ? ["Clear", "Cerah"] : code <= 3 ? ["Cloudy", "Berawan"] : code <= 48 ? ["Fog", "Berkabut"] : code <= 67 ? ["Rain", "Hujan"] : code <= 77 ? ["Snow", "Salju"] : code <= 82 ? ["Showers", "Hujan"] : code <= 86 ? ["Snow", "Salju"] : ["Thunderstorm", "Badai petir"];
function storedFlag(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function mountWeather(parent, { t }) {
  const widget = node(parent, "section", "", "weather-widget");
  widget.setAttribute("aria-label", t("Weather", "Cuaca"));
  parent.insertBefore(widget, parent.querySelector(".cup"));
  const summary = node(widget, "div", "", "weather-summary"), temperature = node(summary, "strong", "\u2014"), condition = node(summary, "span", t("Your weather", "Cuaca di kotamu"));
  const details = node(widget, "details"), toggle = node(details, "summary", t("Weather options", "Opsi cuaca")), form = node(details, "form"), input = node(form, "input");
  input.type = "search";
  input.maxLength = 80;
  input.placeholder = t("City name", "Nama kota");
  input.setAttribute("aria-label", input.placeholder);
  const actions = node(details, "div", "", "weather-location-actions"), find = node(form, "button", t("Find", "Cari"));
  find.type = "submit";
  const useLocation = node(actions, "button", t("Use my location", "Gunakan lokasiku"));
  useLocation.type = "button";
  const choices = node(details, "div", "", "weather-cities");
  const off = node(details, "button", t("Turn off weather", "Matikan cuaca"));
  off.type = "button";
  const feedback = node(details, "p");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  const credit = node(widget, "a", "Open-Meteo \xB7 CC BY 4.0");
  credit.href = "https://open-meteo.com/";
  credit.target = "_blank";
  credit.rel = "noopener noreferrer";
  credit.title = "Weather data: Open-Meteo.com. Free endpoint for non-commercial use.";
  const privacyNote = node(details, "small", t("Coordinates are sent to Open-Meteo for forecasts and saved on this device.", "Koordinat dikirim ke Open-Meteo untuk prakiraan dan disimpan di perangkat ini."), "weather-location-privacy");
  const cityBody = document.createElement("div");
  cityBody.className = "personal-sheet";
  cityBody.append(form, actions, choices, off, privacyNote, feedback);
  const citySheet = bottomSheet(t("Weather settings", "Pengaturan cuaca"), cityBody);
  toggle.onclick = (e) => {
    e.preventDefault();
    citySheet.open();
  };
  let saved = null, controller, sequence = 0, requestingLocation = false;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!saved || !Number.isFinite(saved.latitude) || !Number.isFinite(saved.longitude) || Math.abs(saved.latitude) > 90 || Math.abs(saved.longitude) > 180) saved = null;
  } catch {
    saved = null;
  }
  function store() {
    try {
      if (saved) localStorage.setItem(KEY, JSON.stringify(saved));
      else localStorage.removeItem(KEY);
    } catch {
    }
  }
  function display() {
    const code = saved?.current?.weather_code;
    document.documentElement.dataset.weatherStale = String(!!saved && Date.now() - saved.at > 18e5);
    document.documentElement.dataset.weather = code == null ? "neutral" : code === 0 ? "clear" : code <= 3 ? "cloudy" : code <= 48 ? "fog" : code <= 67 ? "rain" : code <= 77 ? "snow" : code <= 82 ? "rain" : code <= 86 ? "snow" : "storm";
    if (saved?.current?.is_day !== void 0) document.documentElement.dataset.weatherNight = String(!saved.current.is_day);
    else delete document.documentElement.dataset.weatherNight;
    document.dispatchEvent(new Event("sela:weather"));
    toggle.textContent = saved?.name === "__nearby__" ? t("Nearby", "Sekitar sini") : saved?.name || t("Weather options", "Opsi cuaca");
    const current = saved?.current;
    if (current && Number.isFinite(current.temperature_2m)) {
      temperature.textContent = Math.round(current.temperature_2m) + "\xB0C";
      const [en, id] = descriptions(current.weather_code);
      condition.textContent = t(en, id) + (Date.now() - saved.at > 18e5 ? t(" \xB7 last update", " \xB7 data terakhir") : "");
    } else {
      temperature.textContent = "\u2014";
      condition.textContent = t("Your weather", "Cuaca di kotamu");
    }
    credit.hidden = !saved;
    off.hidden = !saved;
  }
  async function json(url, signal) {
    const response = await fetch(url, { signal, credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error("Weather unavailable");
    return response.json();
  }
  async function update(force = false) {
    if (!saved || !force && Date.now() - (saved.at || 0) < 18e5 || navigator.onLine === false) return;
    const currentCity = saved, id = ++sequence;
    controller?.abort();
    controller = new AbortController();
    const active = controller, timer = setTimeout(() => active.abort(), 12e3);
    try {
      const data = await json("https://api.open-meteo.com/v1/forecast?latitude=" + saved.latitude + "&longitude=" + saved.longitude + "&current=temperature_2m,weather_code,is_day&timezone=auto", active.signal);
      if (id !== sequence || saved !== currentCity) return;
      if (!Number.isFinite(data.current?.temperature_2m) || !Number.isInteger(data.current.weather_code) || data.current.weather_code < 0 || data.current.weather_code > 99) throw new Error("No weather");
      saved.current = data.current;
      saved.at = Date.now();
      store();
      feedback.textContent = "";
      display();
    } catch {
      if (id === sequence) {
        feedback.textContent = t("Weather unavailable. Saved data stays visible.", "Cuaca belum tersedia. Data tersimpan tetap ditampilkan.");
        if (force) notify(feedback.textContent, "error");
        display();
      }
    } finally {
      clearTimeout(timer);
    }
  }
  function locationError(error) {
    if (error?.code === 1) feedback.textContent = t("Location permission was declined. Choose a city or allow it in browser settings.", "Izin lokasi ditolak. Pilih kota atau izinkan lewat pengaturan browser.");
    else if (error?.code === 2) feedback.textContent = t("Your location is unavailable. Choose a city instead.", "Lokasimu belum tersedia. Silakan pilih kota.");
    else feedback.textContent = t("Location request timed out. You can choose a city instead.", "Permintaan lokasi terlalu lama. Kamu bisa memilih kota.");
  }
  function requestLocation() {
    if (requestingLocation) return;
    if (!navigator.geolocation) {
      feedback.textContent = t("Location is not supported here. Choose a city instead.", "Lokasi tidak didukung di sini. Silakan pilih kota.");
      return;
    }
    requestingLocation = true;
    useLocation.disabled = true;
    feedback.textContent = t("Waiting for location permission\u2026", "Menunggu izin lokasi\u2026");
    const id = ++sequence;
    navigator.geolocation.getCurrentPosition((position) => {
      requestingLocation = false;
      useLocation.disabled = false;
      if (id !== sequence) return;
      saved = { name: "__nearby__", latitude: position.coords.latitude, longitude: position.coords.longitude, at: 0 };
      try {
        localStorage.removeItem(DISABLED);
        localStorage.setItem(ASKED, "true");
      } catch {
      }
      store();
      choices.replaceChildren();
      feedback.textContent = "";
      display();
      void update(true);
      citySheet.close();
    }, (error) => {
      requestingLocation = false;
      useLocation.disabled = false;
      if (id !== sequence) return;
      try {
        localStorage.setItem(ASKED, "true");
      } catch {
      }
      locationError(error);
    }, { enableHighAccuracy: false, timeout: 1e4, maximumAge: 30 * 60 * 1e3 });
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (input.value.trim().length < 2) return;
    const id = ++sequence;
    controller?.abort();
    controller = new AbortController();
    const active = controller, timer = setTimeout(() => active.abort(), 12e3);
    find.disabled = true;
    choices.replaceChildren();
    feedback.textContent = t("Searching cities\u2026", "Mencari kota\u2026");
    try {
      const language = (document.documentElement.lang || "en").split("-")[0];
      const data = await json("https://geocoding-api.open-meteo.com/v1/search?count=5&language=" + encodeURIComponent(language) + "&name=" + encodeURIComponent(input.value.trim()), active.signal);
      if (id !== sequence) return;
      for (const city of data.results || []) {
        if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude) || Math.abs(city.latitude) > 90 || Math.abs(city.longitude) > 180) continue;
        const name = [city.name, city.admin1, city.country].filter(Boolean).join(", ").slice(0, 180), button = node(choices, "button", name);
        button.type = "button";
        button.onclick = () => {
          ++sequence;
          controller?.abort();
          saved = { name, latitude: city.latitude, longitude: city.longitude, at: 0 };
          try {
            localStorage.removeItem(DISABLED);
          } catch {
          }
          store();
          details.open = false;
          citySheet.close();
          choices.replaceChildren();
          display();
          void update(true);
        };
      }
      feedback.textContent = choices.children.length ? t("Choose your city.", "Pilih kotamu.") : t("City not found.", "Kota tidak ditemukan.");
    } catch {
      if (id === sequence) {
        feedback.textContent = t("City search unavailable. Try again.", "Pencarian kota belum tersedia. Coba lagi.");
        notify(feedback.textContent, "error");
      }
    } finally {
      clearTimeout(timer);
      find.disabled = false;
    }
  };
  useLocation.onclick = requestLocation;
  off.onclick = () => {
    ++sequence;
    controller?.abort();
    saved = null;
    try {
      localStorage.setItem(DISABLED, "true");
    } catch {
    }
    store();
    choices.replaceChildren();
    feedback.textContent = "";
    details.open = false;
    citySheet.close();
    display();
  };
  display();
  if (!saved && storedFlag(DISABLED) !== "true" && storedFlag(ASKED) !== "true" && window.isSecureContext && navigator.geolocation) {
    try {
      localStorage.setItem(ASKED, "true");
    } catch {
    }
    requestLocation();
  }
  void update();
  const interval = setInterval(() => {
    if (!document.hidden) void update();
  }, 18e5);
  window.addEventListener("pagehide", () => {
    clearInterval(interval);
    controller?.abort();
    citySheet.destroy();
  }, { once: true });
  return { localize() {
    widget.setAttribute("aria-label", t("Weather", "Cuaca"));
    input.placeholder = t("City name", "Nama kota");
    input.setAttribute("aria-label", input.placeholder);
    find.textContent = t("Find", "Cari");
    useLocation.textContent = t("Use my location", "Gunakan lokasiku");
    off.textContent = t("Turn off weather", "Matikan cuaca");
    privacyNote.textContent = t("Coordinates are sent to Open-Meteo for forecasts and saved on this device.", "Koordinat dikirim ke Open-Meteo untuk prakiraan dan disimpan di perangkat ini.");
    citySheet.setTitle(t("Weather settings", "Pengaturan cuaca"), t("Close", "Tutup"));
    display();
  } };
}
