// Generated from src/i18n.ts by npm run build. Do not edit.
export const APP_LANGUAGES = [
  { locale: "en-US", name: "English (US)", base: "en", country: "US", flag: "\u{1F1FA}\u{1F1F8}" },
  { locale: "en-GB", name: "English (UK)", base: "en", country: "GB", flag: "\u{1F1EC}\u{1F1E7}" },
  { locale: "id-ID", name: "Bahasa Indonesia", base: "id", country: "ID", flag: "\u{1F1EE}\u{1F1E9}" },
  { locale: "ja-JP", name: "\u65E5\u672C\u8A9E", base: "ja", country: "JP", flag: "\u{1F1EF}\u{1F1F5}" },
  { locale: "es-ES", name: "Espa\xF1ol", base: "es", country: "ES", flag: "\u{1F1EA}\u{1F1F8}" },
  { locale: "fr-FR", name: "Fran\xE7ais", base: "fr", country: "FR", flag: "\u{1F1EB}\u{1F1F7}" },
  { locale: "de-DE", name: "Deutsch", base: "de", country: "DE", flag: "\u{1F1E9}\u{1F1EA}" },
  { locale: "pt-BR", name: "Portugu\xEAs", base: "pt", country: "BR", flag: "\u{1F1E7}\u{1F1F7}" },
  { locale: "zh-CN", name: "\u7B80\u4F53\u4E2D\u6587", base: "zh", country: "CN", flag: "\u{1F1E8}\u{1F1F3}" },
  { locale: "ko-KR", name: "\uD55C\uAD6D\uC5B4", base: "ko", country: "KR", flag: "\u{1F1F0}\u{1F1F7}" }
];
const byBase = Object.fromEntries(APP_LANGUAGES.map((item) => [item.base, item]));
export function normalizeLocale(value) {
  if (!value) return "en-US";
  const normalized = value.replace("_", "-").toLowerCase();
  const exact = APP_LANGUAGES.find((item) => item.locale.toLowerCase() === normalized);
  if (exact) return exact.locale;
  const base = normalized.split("-")[0];
  return byBase[base]?.locale || "en-US";
}
export function localeBase(value) {
  return normalizeLocale(value).split("-")[0];
}
export function holidayCountry(value) {
  return APP_LANGUAGES.find((item) => item.locale === normalizeLocale(value))?.country || "US";
}
const countryLocales = {
  ID: "id-ID",
  JP: "ja-JP",
  ES: "es-ES",
  MX: "es-ES",
  AR: "es-ES",
  BO: "es-ES",
  CL: "es-ES",
  CO: "es-ES",
  CR: "es-ES",
  CU: "es-ES",
  DO: "es-ES",
  EC: "es-ES",
  SV: "es-ES",
  GQ: "es-ES",
  GT: "es-ES",
  HN: "es-ES",
  NI: "es-ES",
  PA: "es-ES",
  PY: "es-ES",
  PE: "es-ES",
  UY: "es-ES",
  VE: "es-ES",
  FR: "fr-FR",
  BE: "fr-FR",
  CH: "fr-FR",
  LU: "fr-FR",
  MC: "fr-FR",
  SN: "fr-FR",
  CI: "fr-FR",
  CD: "fr-FR",
  CG: "fr-FR",
  CM: "fr-FR",
  MG: "fr-FR",
  HT: "fr-FR",
  GN: "fr-FR",
  ML: "fr-FR",
  BF: "fr-FR",
  NE: "fr-FR",
  TG: "fr-FR",
  BJ: "fr-FR",
  DJ: "fr-FR",
  TD: "fr-FR",
  GA: "fr-FR",
  CF: "fr-FR",
  KM: "fr-FR",
  DE: "de-DE",
  AT: "de-DE",
  LI: "de-DE",
  BR: "pt-BR",
  PT: "pt-BR",
  AO: "pt-BR",
  MZ: "pt-BR",
  CV: "pt-BR",
  GW: "pt-BR",
  ST: "pt-BR",
  TL: "pt-BR",
  CN: "zh-CN",
  SG: "zh-CN",
  TW: "zh-CN",
  HK: "zh-CN",
  MO: "zh-CN",
  KR: "ko-KR",
  GB: "en-GB",
  IE: "en-GB",
  AU: "en-GB",
  NZ: "en-GB",
  CA: "en-US",
  US: "en-US",
  IN: "en-US",
  ZA: "en-US",
  NG: "en-US",
  KE: "en-US",
  PH: "en-US",
  PK: "en-US",
  BD: "en-US",
  GH: "en-US",
  JM: "en-US",
  TT: "en-US"
};
export function localeForCountry(country) {
  const code = (country || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? countryLocales[code] || "en-US" : "en-US";
}
const translated = {
  ja: {
    "Home": "\u30DB\u30FC\u30E0",
    "Shelf": "\u672C\u68DA",
    "Explore": "\u672C\u3092\u63A2\u3059",
    "Settings": "\u8A2D\u5B9A",
    "Add books": "\u672C\u3092\u8FFD\u52A0",
    "Check for updates": "\u66F4\u65B0\u3092\u78BA\u8A8D",
    "Appearance": "\u5916\u89B3",
    "Language": "\u8A00\u8A9E",
    "Updates": "\u30A2\u30C3\u30D7\u30C7\u30FC\u30C8",
    "Set the language for Sela.": "Sela\u306E\u8868\u793A\u8A00\u8A9E\u3092\u9078\u3073\u307E\u3059\u3002",
    "Choose light, dark, or automatic.": "\u30E9\u30A4\u30C8\u3001\u30C0\u30FC\u30AF\u3001\u81EA\u52D5\u304B\u3089\u9078\u3073\u307E\u3059\u3002",
    "Reading calendar": "\u8AAD\u66F8\u30AB\u30EC\u30F3\u30C0\u30FC",
    "Small moments count.": "\u5C11\u3057\u306E\u6642\u9593\u3082\u5927\u5207\u306B\u3002",
    "A little water break": "\u6C34\u5206\u88DC\u7D66\u306E\u3072\u3068\u4F11\u307F",
    "A gentle note to pause and sip.": "\u3072\u3068\u4F11\u307F\u3057\u3066\u6C34\u3092\u98F2\u307F\u307E\u3057\u3087\u3046\u3002",
    "Add a glass": "\u4E00\u676F\u8FFD\u52A0",
    "glass today": "\u4ECA\u65E5\u306E\u4E00\u676F",
    "glasses today": "\u4ECA\u65E5\u306E\u4E00\u676F",
    "Weather": "\u5929\u6C17",
    "Your weather": "\u73FE\u5728\u5730\u306E\u5929\u6C17",
    "Nearby": "\u8FD1\u304F",
    "Choose city": "\u5834\u6240\u3092\u9078\u3076",
    "City name": "\u90FD\u5E02\u540D",
    "Find": "\u691C\u7D22",
    "Turn off weather": "\u5929\u6C17\u3092\u30AA\u30D5",
    "Use my location": "\u73FE\u5728\u5730\u3092\u4F7F\u3046",
    "Allow location to show nearby weather.": "\u73FE\u5728\u5730\u306E\u5929\u6C17\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u4F4D\u7F6E\u60C5\u5831\u3092\u8A31\u53EF\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    "Location unavailable. Choose a city instead.": "\u4F4D\u7F6E\u60C5\u5831\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3002\u90FD\u5E02\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002",
    "Public holiday": "\u795D\u65E5",
    "Previous month": "\u524D\u306E\u6708",
    "Next month": "\u6B21\u306E\u6708",
    "Show the whole month": "\u6708\u5168\u4F53\u3092\u8868\u793A",
    "Show this week": "\u4ECA\u9031\u3092\u8868\u793A",
    "About Sela": "Sela\u306B\u3064\u3044\u3066",
    "Your personal reader": "\u3042\u306A\u305F\u306E\u305F\u3081\u306E\u8AAD\u66F8\u30A2\u30D7\u30EA",
    "Personal website": "\u500B\u4EBA\u30B5\u30A4\u30C8",
    "MIT license": "MIT\u30E9\u30A4\u30BB\u30F3\u30B9",
    "Third-party licenses": "\u30B5\u30FC\u30C9\u30D1\u30FC\u30C6\u30A3\u306E\u30E9\u30A4\u30BB\u30F3\u30B9",
    "Close": "\u9589\u3058\u308B",
    "Single page": "\u5358\u30DA\u30FC\u30B8",
    "Book spread": "\u898B\u958B\u304D",
    "Continuous scroll": "\u9023\u7D9A\u30B9\u30AF\u30ED\u30FC\u30EB",
    "Low power reader": "\u7701\u96FB\u529B\u30EA\u30FC\u30C0\u30FC",
    "Reduce motion and background effects.": "\u52D5\u304D\u3068\u80CC\u666F\u52B9\u679C\u3092\u6291\u3048\u307E\u3059\u3002",
    "Default reading mode": "\u6A19\u6E96\u306E\u8AAD\u66F8\u30E2\u30FC\u30C9",
    "Choose how new books open.": "\u65B0\u3057\u3044\u672C\u306E\u958B\u304D\u65B9\u3092\u9078\u3073\u307E\u3059\u3002",
    "Reading defaults": "\u8AAD\u66F8\u306E\u521D\u671F\u8A2D\u5B9A",
    "Books & storage": "\u672C\u3068\u4FDD\u5B58\u5BB9\u91CF",
    "Your books.": "\u3042\u306A\u305F\u306E\u672C\u3002",
    "Pick up where you left off.": "\u524D\u56DE\u306E\u7D9A\u304D\u304B\u3089\u8AAD\u307F\u307E\u3057\u3087\u3046\u3002",
    "Read": "\u8AAD\u3080",
    "Save offline": "\u30AA\u30D5\u30E9\u30A4\u30F3\u306B\u4FDD\u5B58",
    "Book information": "\u672C\u306E\u60C5\u5831",
    "Save": "\u4FDD\u5B58",
    "Cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
    "Search": "\u691C\u7D22",
    "Search book": "\u672C\u3092\u691C\u7D22",
    "Previous page": "\u524D\u306E\u30DA\u30FC\u30B8",
    "Next page": "\u6B21\u306E\u30DA\u30FC\u30B8",
    "Reader settings": "\u8AAD\u66F8\u8A2D\u5B9A",
    "Contents & bookmarks": "\u76EE\u6B21\u3068\u3057\u304A\u308A",
    "Bookmark page": "\u3057\u304A\u308A\u3092\u631F\u3080",
    "Download original": "\u5143\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u4FDD\u5B58",
    "Install Sela on this device": "\u3053\u306E\u7AEF\u672B\u306BSela\u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB",
    "Choose a little companion": "\u5C0F\u3055\u306A\u304A\u3068\u3082\u3092\u9078\u3076",
    "Cat": "\u306D\u3053",
    "Hamster": "\u30CF\u30E0\u30B9\u30BF\u30FC",
    "Rabbit": "\u3046\u3055\u304E",
    "Fox": "\u304D\u3064\u306D",
    "Owl": "\u3075\u304F\u308D\u3046",
    "Turtle": "\u304B\u3081",
    "Plant": "\u690D\u7269",
    "A quiet day. No reading saved here yet.": "\u9759\u304B\u306A\u4E00\u65E5\u3002\u307E\u3060\u8AAD\u66F8\u8A18\u9332\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "Privacy, updates & compatibility": "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u30FB\u66F4\u65B0\u30FB\u5BFE\u5FDC\u74B0\u5883"
  },
  es: { "Home": "Inicio", "Shelf": "Estanter\xEDa", "Explore": "Explorar", "Settings": "Ajustes", "Add books": "A\xF1adir libros", "Appearance": "Apariencia", "Language": "Idioma", "Updates": "Actualizaciones", "Reading calendar": "Calendario de lectura", "Small moments count.": "Cada peque\xF1o momento cuenta.", "A little water break": "Pausa para beber agua", "Add a glass": "A\xF1adir un vaso", "Weather": "Tiempo", "Nearby": "Cerca de ti", "Choose city": "Elegir ciudad", "Find": "Buscar", "Turn off weather": "Desactivar el tiempo", "Use my location": "Usar mi ubicaci\xF3n", "Public holiday": "Festivo", "Previous month": "Mes anterior", "Next month": "Mes siguiente", "About Sela": "Acerca de Sela", "Your personal reader": "Tu lector personal", "Personal website": "Sitio personal", "MIT license": "Licencia MIT", "Third-party licenses": "Licencias de terceros", "Close": "Cerrar", "Read": "Leer", "Save offline": "Guardar sin conexi\xF3n", "Book information": "Informaci\xF3n del libro", "Cat": "Gato", "Hamster": "H\xE1mster", "Rabbit": "Conejo", "Fox": "Zorro", "Owl": "B\xFAho", "Turtle": "Tortuga", "Plant": "Planta", "Privacy, updates & compatibility": "Privacidad, actualizaciones y compatibilidad" },
  fr: { "Home": "Accueil", "Shelf": "Biblioth\xE8que", "Explore": "Explorer", "Settings": "R\xE9glages", "Add books": "Ajouter des livres", "Appearance": "Apparence", "Language": "Langue", "Updates": "Mises \xE0 jour", "Reading calendar": "Calendrier de lecture", "Small moments count.": "Chaque instant compte.", "A little water break": "Petite pause hydratation", "Add a glass": "Ajouter un verre", "Weather": "M\xE9t\xE9o", "Nearby": "\xC0 proximit\xE9", "Choose city": "Choisir une ville", "Find": "Rechercher", "Turn off weather": "D\xE9sactiver la m\xE9t\xE9o", "Use my location": "Utiliser ma position", "Public holiday": "Jour f\xE9ri\xE9", "Previous month": "Mois pr\xE9c\xE9dent", "Next month": "Mois suivant", "About Sela": "\xC0 propos de Sela", "Your personal reader": "Votre lecteur personnel", "Personal website": "Site personnel", "MIT license": "Licence MIT", "Third-party licenses": "Licences tierces", "Close": "Fermer", "Read": "Lire", "Save offline": "Enregistrer hors ligne", "Book information": "Informations du livre", "Cat": "Chat", "Hamster": "Hamster", "Rabbit": "Lapin", "Fox": "Renard", "Owl": "Hibou", "Turtle": "Tortue", "Plant": "Plante", "Privacy, updates & compatibility": "Confidentialit\xE9, mises \xE0 jour et compatibilit\xE9" },
  de: { "Home": "Startseite", "Shelf": "B\xFCcherregal", "Explore": "Entdecken", "Settings": "Einstellungen", "Add books": "B\xFCcher hinzuf\xFCgen", "Appearance": "Darstellung", "Language": "Sprache", "Updates": "Aktualisierungen", "Reading calendar": "Lesekalender", "Small moments count.": "Auch kleine Momente z\xE4hlen.", "A little water break": "Kleine Trinkpause", "Add a glass": "Glas hinzuf\xFCgen", "Weather": "Wetter", "Nearby": "In der N\xE4he", "Choose city": "Ort ausw\xE4hlen", "Find": "Suchen", "Turn off weather": "Wetter ausschalten", "Use my location": "Standort verwenden", "Public holiday": "Feiertag", "Previous month": "Voriger Monat", "Next month": "N\xE4chster Monat", "About Sela": "\xDCber Sela", "Your personal reader": "Dein pers\xF6nlicher Reader", "Personal website": "Pers\xF6nliche Website", "MIT license": "MIT-Lizenz", "Third-party licenses": "Lizenzen von Drittanbietern", "Close": "Schlie\xDFen", "Read": "Lesen", "Save offline": "Offline speichern", "Book information": "Buchinformationen", "Cat": "Katze", "Hamster": "Hamster", "Rabbit": "Kaninchen", "Fox": "Fuchs", "Owl": "Eule", "Turtle": "Schildkr\xF6te", "Plant": "Pflanze", "Privacy, updates & compatibility": "Datenschutz, Updates und Kompatibilit\xE4t" },
  pt: { "Home": "In\xEDcio", "Shelf": "Estante", "Explore": "Explorar", "Settings": "Configura\xE7\xF5es", "Add books": "Adicionar livros", "Appearance": "Apar\xEAncia", "Language": "Idioma", "Updates": "Atualiza\xE7\xF5es", "Reading calendar": "Calend\xE1rio de leitura", "Small moments count.": "Cada momento importa.", "A little water break": "Pausa para beber \xE1gua", "Add a glass": "Adicionar um copo", "Weather": "Clima", "Nearby": "Perto de voc\xEA", "Choose city": "Escolher cidade", "Find": "Buscar", "Turn off weather": "Desativar clima", "Use my location": "Usar minha localiza\xE7\xE3o", "Public holiday": "Feriado", "Previous month": "M\xEAs anterior", "Next month": "Pr\xF3ximo m\xEAs", "About Sela": "Sobre o Sela", "Your personal reader": "Seu leitor pessoal", "Personal website": "Site pessoal", "MIT license": "Licen\xE7a MIT", "Third-party licenses": "Licen\xE7as de terceiros", "Close": "Fechar", "Read": "Ler", "Save offline": "Salvar offline", "Book information": "Informa\xE7\xF5es do livro", "Cat": "Gato", "Hamster": "Hamster", "Rabbit": "Coelho", "Fox": "Raposa", "Owl": "Coruja", "Turtle": "Tartaruga", "Plant": "Planta", "Privacy, updates & compatibility": "Privacidade, atualiza\xE7\xF5es e compatibilidade" },
  zh: { "Home": "\u9996\u9875", "Shelf": "\u4E66\u67B6", "Explore": "\u63A2\u7D22", "Settings": "\u8BBE\u7F6E", "Add books": "\u6DFB\u52A0\u4E66\u7C4D", "Appearance": "\u5916\u89C2", "Language": "\u8BED\u8A00", "Updates": "\u66F4\u65B0", "Reading calendar": "\u9605\u8BFB\u65E5\u5386", "Small moments count.": "\u6BCF\u4E00\u70B9\u9605\u8BFB\u90FD\u5F88\u73CD\u8D35\u3002", "A little water break": "\u559D\u6C34\u4F11\u606F\u4E00\u4E0B", "Add a glass": "\u6DFB\u52A0\u4E00\u676F", "Weather": "\u5929\u6C14", "Nearby": "\u9644\u8FD1", "Choose city": "\u9009\u62E9\u57CE\u5E02", "Find": "\u641C\u7D22", "Turn off weather": "\u5173\u95ED\u5929\u6C14", "Use my location": "\u4F7F\u7528\u6211\u7684\u4F4D\u7F6E", "Public holiday": "\u8282\u5047\u65E5", "Previous month": "\u4E0A\u4E2A\u6708", "Next month": "\u4E0B\u4E2A\u6708", "About Sela": "\u5173\u4E8E Sela", "Your personal reader": "\u4F60\u7684\u4E2A\u4EBA\u9605\u8BFB\u5668", "Personal website": "\u4E2A\u4EBA\u7F51\u7AD9", "MIT license": "MIT \u8BB8\u53EF\u8BC1", "Third-party licenses": "\u7B2C\u4E09\u65B9\u8BB8\u53EF\u8BC1", "Close": "\u5173\u95ED", "Read": "\u9605\u8BFB", "Save offline": "\u79BB\u7EBF\u4FDD\u5B58", "Book information": "\u4E66\u7C4D\u4FE1\u606F", "Cat": "\u732B\u54AA", "Hamster": "\u4ED3\u9F20", "Rabbit": "\u5154\u5B50", "Fox": "\u72D0\u72F8", "Owl": "\u732B\u5934\u9E70", "Turtle": "\u4E4C\u9F9F", "Plant": "\u690D\u7269", "Privacy, updates & compatibility": "\u9690\u79C1\u3001\u66F4\u65B0\u4E0E\u517C\u5BB9\u6027" },
  ko: { "Home": "\uD648", "Shelf": "\uCC45\uC7A5", "Explore": "\uB458\uB7EC\uBCF4\uAE30", "Settings": "\uC124\uC815", "Add books": "\uCC45 \uCD94\uAC00", "Appearance": "\uD654\uBA74", "Language": "\uC5B8\uC5B4", "Updates": "\uC5C5\uB370\uC774\uD2B8", "Reading calendar": "\uB3C5\uC11C \uB2EC\uB825", "Small moments count.": "\uC9E7\uC740 \uB3C5\uC11C\uB3C4 \uC18C\uC911\uD574\uC694.", "A little water break": "\uBB3C \uD55C \uC794 \uC26C\uC5B4\uAC00\uAE30", "Add a glass": "\uD55C \uC794 \uCD94\uAC00", "Weather": "\uB0A0\uC528", "Nearby": "\uB0B4 \uC8FC\uBCC0", "Choose city": "\uB3C4\uC2DC \uC120\uD0DD", "Find": "\uAC80\uC0C9", "Turn off weather": "\uB0A0\uC528 \uB044\uAE30", "Use my location": "\uB0B4 \uC704\uCE58 \uC0AC\uC6A9", "Public holiday": "\uACF5\uD734\uC77C", "Previous month": "\uC774\uC804 \uB2EC", "Next month": "\uB2E4\uC74C \uB2EC", "About Sela": "Sela \uC18C\uAC1C", "Your personal reader": "\uB098\uB9CC\uC758 \uB9AC\uB354", "Personal website": "\uAC1C\uC778 \uC6F9\uC0AC\uC774\uD2B8", "MIT license": "MIT \uB77C\uC774\uC120\uC2A4", "Third-party licenses": "\uC11C\uB4DC\uD30C\uD2F0 \uB77C\uC774\uC120\uC2A4", "Close": "\uB2EB\uAE30", "Read": "\uC77D\uAE30", "Save offline": "\uC624\uD504\uB77C\uC778 \uC800\uC7A5", "Book information": "\uCC45 \uC815\uBCF4", "Cat": "\uACE0\uC591\uC774", "Hamster": "\uD584\uC2A4\uD130", "Rabbit": "\uD1A0\uB07C", "Fox": "\uC5EC\uC6B0", "Owl": "\uBD80\uC5C9\uC774", "Turtle": "\uAC70\uBD81\uC774", "Plant": "\uC2DD\uBB3C", "Privacy, updates & compatibility": "\uAC1C\uC778\uC815\uBCF4, \uC5C5\uB370\uC774\uD2B8 \uBC0F \uD638\uD658\uC131" }
};
Object.assign(translated.ja, { "Red panda": "\u30EC\u30C3\u30B5\u30FC\u30D1\u30F3\u30C0", "Penguin": "\u30DA\u30F3\u30AE\u30F3", "Shiba": "\u67F4\u72AC", "Fawn": "\u5B50\u9E7F" });
Object.assign(translated.es, { "Red panda": "Panda rojo", "Penguin": "Ping\xFCino", "Shiba": "Shiba", "Fawn": "Cervatillo" });
Object.assign(translated.fr, { "Red panda": "Panda roux", "Penguin": "Manchot", "Shiba": "Shiba", "Fawn": "Faon" });
Object.assign(translated.de, { "Red panda": "Kleiner Panda", "Penguin": "Pinguin", "Shiba": "Shiba", "Fawn": "Rehkitz" });
Object.assign(translated.pt, { "Red panda": "Panda-vermelho", "Penguin": "Pinguim", "Shiba": "Shiba", "Fawn": "Cervo jovem" });
Object.assign(translated.zh, { "Red panda": "\u5C0F\u718A\u732B", "Penguin": "\u4F01\u9E45", "Shiba": "\u67F4\u72AC", "Fawn": "\u5C0F\u9E7F" });
Object.assign(translated.ko, { "Red panda": "\uB808\uC11C\uD310\uB2E4", "Penguin": "\uD3AD\uADC4", "Shiba": "\uC2DC\uBC14\uACAC", "Fawn": "\uC544\uAE30 \uC0AC\uC2B4" });
Object.assign(translated.ja, { "Weather options": "\u5929\u6C17\u306E\u8A2D\u5B9A", "Location permission was declined. Choose a city or allow it in browser settings.": "\u4F4D\u7F6E\u60C5\u5831\u304C\u8A31\u53EF\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u90FD\u5E02\u3092\u9078\u3076\u304B\u3001\u30D6\u30E9\u30A6\u30B6\u30FC\u306E\u8A2D\u5B9A\u3067\u8A31\u53EF\u3057\u3066\u304F\u3060\u3055\u3044\u3002", "Your location is unavailable. Choose a city instead.": "\u73FE\u5728\u5730\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3002\u90FD\u5E02\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002", "Location request timed out. You can choose a city instead.": "\u4F4D\u7F6E\u60C5\u5831\u306E\u53D6\u5F97\u304C\u30BF\u30A4\u30E0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F\u3002\u90FD\u5E02\u3092\u9078\u3079\u307E\u3059\u3002", "Waiting for location permission\u2026": "\u4F4D\u7F6E\u60C5\u5831\u306E\u8A31\u53EF\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026", "Searching cities\u2026": "\u90FD\u5E02\u3092\u691C\u7D22\u3057\u3066\u3044\u307E\u3059\u2026", "Choose your city.": "\u90FD\u5E02\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002", "City not found.": "\u90FD\u5E02\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002", "City search unavailable. Try again.": "\u90FD\u5E02\u3092\u691C\u7D22\u3067\u304D\u307E\u305B\u3093\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002", "Weather unavailable. Saved data stays visible.": "\u5929\u6C17\u60C5\u5831\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3002\u4FDD\u5B58\u6E08\u307F\u306E\u60C5\u5831\u3092\u8868\u793A\u3057\u307E\u3059\u3002", "Find a book": "\u672C\u3092\u691C\u7D22", "Continue reading": "\u7D9A\u304D\u304B\u3089\u8AAD\u3080", "A little book to start": "\u307E\u305A\u306F\u4E00\u518A", "All books": "\u3059\u3079\u3066\u306E\u672C", "Unread": "\u672A\u8AAD", "Started": "\u8AAD\u307F\u59CB\u3081\u305F\u672C", "Favorites": "\u304A\u6C17\u306B\u5165\u308A", "Newest": "\u65B0\u7740\u9806", "Last read": "\u6700\u5F8C\u306B\u8AAD\u3093\u3060\u9806", "Title": "\u30BF\u30A4\u30C8\u30EB", "All formats": "\u3059\u3079\u3066\u306E\u5F62\u5F0F", "Reading": "\u8AAD\u66F8\u4E2D", "Finished": "\u8AAD\u4E86", "About Sela": "Sela\u306B\u3064\u3044\u3066", "Notebook & memories": "\u30CE\u30FC\u30C8\u3068\u8A18\u9332", "Reading journal": "\u8AAD\u66F8\u65E5\u8A18", "Personalize my room": "\u8AAD\u66F8\u30B9\u30DA\u30FC\u30B9\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA", "Smart shelves": "\u30B9\u30DE\u30FC\u30C8\u672C\u68DA", "Care for my library": "\u672C\u68DA\u3092\u6574\u7406", "Share backup": "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u5171\u6709", "Restore backup": "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u5FA9\u5143" });
Object.assign(translated.es, { "Weather options": "Opciones del tiempo", "Find a book": "Buscar un libro", "Continue reading": "Seguir leyendo", "A little book to start": "Un libro para empezar", "All books": "Todos los libros", "Unread": "Sin leer", "Started": "Empezados", "Favorites": "Favoritos", "Newest": "M\xE1s recientes", "Last read": "\xDAltima lectura", "Title": "T\xEDtulo", "All formats": "Todos los formatos", "Reading": "Leyendo", "Finished": "Terminado", "Notebook & memories": "Cuaderno y recuerdos", "Reading journal": "Diario de lectura", "Personalize my room": "Personalizar mi espacio", "Smart shelves": "Estanter\xEDas inteligentes", "Care for my library": "Cuidar mi biblioteca", "Share backup": "Compartir copia", "Restore backup": "Restaurar copia", "Location permission was declined. Choose a city or allow it in browser settings.": "Se rechaz\xF3 el permiso de ubicaci\xF3n. Elige una ciudad o permite el acceso en los ajustes del navegador.", "Waiting for location permission\u2026": "Esperando el permiso de ubicaci\xF3n\u2026", "Searching cities\u2026": "Buscando ciudades\u2026", "Choose your city.": "Elige tu ciudad.", "City not found.": "No se encontr\xF3 la ciudad.", "Weather unavailable. Saved data stays visible.": "El tiempo no est\xE1 disponible. Se muestran los datos guardados." });
Object.assign(translated.fr, { "Weather options": "Options m\xE9t\xE9o", "Find a book": "Rechercher un livre", "Continue reading": "Reprendre la lecture", "A little book to start": "Un livre pour commencer", "All books": "Tous les livres", "Unread": "Non lus", "Started": "En cours", "Favorites": "Favoris", "Newest": "Les plus r\xE9cents", "Last read": "Derni\xE8re lecture", "Title": "Titre", "All formats": "Tous les formats", "Reading": "En cours de lecture", "Finished": "Termin\xE9", "Notebook & memories": "Carnet et souvenirs", "Reading journal": "Journal de lecture", "Personalize my room": "Personnaliser mon espace", "Smart shelves": "\xC9tag\xE8res intelligentes", "Care for my library": "Prendre soin de ma biblioth\xE8que", "Share backup": "Partager la sauvegarde", "Restore backup": "Restaurer la sauvegarde", "Location permission was declined. Choose a city or allow it in browser settings.": "L\u2019autorisation de localisation a \xE9t\xE9 refus\xE9e. Choisissez une ville ou autorisez-la dans les r\xE9glages du navigateur.", "Waiting for location permission\u2026": "En attente de l\u2019autorisation de localisation\u2026", "Searching cities\u2026": "Recherche de villes\u2026", "Choose your city.": "Choisissez votre ville.", "City not found.": "Ville introuvable.", "Weather unavailable. Saved data stays visible.": "M\xE9t\xE9o indisponible. Les donn\xE9es enregistr\xE9es restent visibles." });
Object.assign(translated.de, { "Weather options": "Wetteroptionen", "Find a book": "Buch suchen", "Continue reading": "Weiterlesen", "A little book to start": "Ein Buch zum Einstieg", "All books": "Alle B\xFCcher", "Unread": "Ungelesen", "Started": "Begonnen", "Favorites": "Favoriten", "Newest": "Neueste", "Last read": "Zuletzt gelesen", "Title": "Titel", "All formats": "Alle Formate", "Reading": "Wird gelesen", "Finished": "Abgeschlossen", "Notebook & memories": "Notizbuch und Erinnerungen", "Reading journal": "Lesetagebuch", "Personalize my room": "Leseraum anpassen", "Smart shelves": "Intelligente Regale", "Care for my library": "Bibliothek pflegen", "Share backup": "Sicherung teilen", "Restore backup": "Sicherung wiederherstellen", "Location permission was declined. Choose a city or allow it in browser settings.": "Die Standortfreigabe wurde abgelehnt. W\xE4hle einen Ort oder erlaube den Zugriff in den Browsereinstellungen.", "Waiting for location permission\u2026": "Warte auf die Standortfreigabe\u2026", "Searching cities\u2026": "Suche nach St\xE4dten\u2026", "Choose your city.": "W\xE4hle deinen Ort.", "City not found.": "Ort nicht gefunden.", "Weather unavailable. Saved data stays visible.": "Wetter nicht verf\xFCgbar. Gespeicherte Daten bleiben sichtbar." });
Object.assign(translated.pt, { "Weather options": "Op\xE7\xF5es de clima", "Find a book": "Buscar um livro", "Continue reading": "Continuar lendo", "A little book to start": "Um livro para come\xE7ar", "All books": "Todos os livros", "Unread": "N\xE3o lidos", "Started": "Iniciados", "Favorites": "Favoritos", "Newest": "Mais recentes", "Last read": "\xDAltima leitura", "Title": "T\xEDtulo", "All formats": "Todos os formatos", "Reading": "Lendo", "Finished": "Conclu\xEDdo", "Notebook & memories": "Caderno e mem\xF3rias", "Reading journal": "Di\xE1rio de leitura", "Personalize my room": "Personalizar meu espa\xE7o", "Smart shelves": "Estantes inteligentes", "Care for my library": "Cuidar da biblioteca", "Share backup": "Compartilhar backup", "Restore backup": "Restaurar backup", "Location permission was declined. Choose a city or allow it in browser settings.": "A permiss\xE3o de localiza\xE7\xE3o foi recusada. Escolha uma cidade ou permita o acesso nas configura\xE7\xF5es do navegador.", "Waiting for location permission\u2026": "Aguardando permiss\xE3o de localiza\xE7\xE3o\u2026", "Searching cities\u2026": "Buscando cidades\u2026", "Choose your city.": "Escolha sua cidade.", "City not found.": "Cidade n\xE3o encontrada.", "Weather unavailable. Saved data stays visible.": "Clima indispon\xEDvel. Os dados salvos continuam vis\xEDveis." });
Object.assign(translated.zh, { "Weather options": "\u5929\u6C14\u8BBE\u7F6E", "Find a book": "\u641C\u7D22\u4E66\u7C4D", "Continue reading": "\u7EE7\u7EED\u9605\u8BFB", "A little book to start": "\u4ECE\u4E00\u672C\u5C0F\u4E66\u5F00\u59CB", "All books": "\u6240\u6709\u4E66\u7C4D", "Unread": "\u672A\u8BFB", "Started": "\u5DF2\u5F00\u59CB", "Favorites": "\u6536\u85CF", "Newest": "\u6700\u65B0", "Last read": "\u6700\u8FD1\u9605\u8BFB", "Title": "\u6807\u9898", "All formats": "\u6240\u6709\u683C\u5F0F", "Reading": "\u6B63\u5728\u9605\u8BFB", "Finished": "\u5DF2\u8BFB\u5B8C", "Notebook & memories": "\u7B14\u8BB0\u4E0E\u56DE\u5FC6", "Reading journal": "\u9605\u8BFB\u65E5\u8BB0", "Personalize my room": "\u4E2A\u6027\u5316\u9605\u8BFB\u7A7A\u95F4", "Smart shelves": "\u667A\u80FD\u4E66\u67B6", "Care for my library": "\u6574\u7406\u4E66\u5E93", "Share backup": "\u5206\u4EAB\u5907\u4EFD", "Restore backup": "\u6062\u590D\u5907\u4EFD", "Location permission was declined. Choose a city or allow it in browser settings.": "\u4F4D\u7F6E\u6743\u9650\u5DF2\u88AB\u62D2\u7EDD\u3002\u8BF7\u9009\u62E9\u57CE\u5E02\uFF0C\u6216\u5728\u6D4F\u89C8\u5668\u8BBE\u7F6E\u4E2D\u5141\u8BB8\u8BBF\u95EE\u3002", "Waiting for location permission\u2026": "\u6B63\u5728\u7B49\u5F85\u4F4D\u7F6E\u6743\u9650\u2026", "Searching cities\u2026": "\u6B63\u5728\u641C\u7D22\u57CE\u5E02\u2026", "Choose your city.": "\u8BF7\u9009\u62E9\u57CE\u5E02\u3002", "City not found.": "\u672A\u627E\u5230\u57CE\u5E02\u3002", "Weather unavailable. Saved data stays visible.": "\u5929\u6C14\u6682\u4E0D\u53EF\u7528\uFF0C\u4ECD\u4F1A\u663E\u793A\u5DF2\u4FDD\u5B58\u7684\u6570\u636E\u3002" });
Object.assign(translated.ko, { "Weather options": "\uB0A0\uC528 \uC124\uC815", "Find a book": "\uCC45 \uAC80\uC0C9", "Continue reading": "\uC774\uC5B4\uC11C \uC77D\uAE30", "A little book to start": "\uAC00\uBCCD\uAC8C \uC2DC\uC791\uD560 \uCC45", "All books": "\uBAA8\uB4E0 \uCC45", "Unread": "\uC77D\uC9C0 \uC54A\uC74C", "Started": "\uC77D\uAE30 \uC2DC\uC791\uD568", "Favorites": "\uC990\uACA8\uCC3E\uAE30", "Newest": "\uCD5C\uC2E0\uC21C", "Last read": "\uCD5C\uADFC \uC77D\uC740 \uC21C", "Title": "\uC81C\uBAA9", "All formats": "\uBAA8\uB4E0 \uD615\uC2DD", "Reading": "\uC77D\uB294 \uC911", "Finished": "\uC644\uB8CC", "Notebook & memories": "\uB178\uD2B8\uC640 \uAE30\uB85D", "Reading journal": "\uB3C5\uC11C \uC77C\uC9C0", "Personalize my room": "\uB098\uB9CC\uC758 \uACF5\uAC04 \uAFB8\uBBF8\uAE30", "Smart shelves": "\uC2A4\uB9C8\uD2B8 \uCC45\uC7A5", "Care for my library": "\uCC45\uC7A5 \uC815\uB9AC", "Share backup": "\uBC31\uC5C5 \uACF5\uC720", "Restore backup": "\uBC31\uC5C5 \uBCF5\uC6D0", "Location permission was declined. Choose a city or allow it in browser settings.": "\uC704\uCE58 \uAD8C\uD55C\uC774 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB3C4\uC2DC\uB97C \uC120\uD0DD\uD558\uAC70\uB098 \uBE0C\uB77C\uC6B0\uC800 \uC124\uC815\uC5D0\uC11C \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.", "Waiting for location permission\u2026": "\uC704\uCE58 \uAD8C\uD55C\uC744 \uAE30\uB2E4\uB9AC\uB294 \uC911\u2026", "Searching cities\u2026": "\uB3C4\uC2DC \uAC80\uC0C9 \uC911\u2026", "Choose your city.": "\uB3C4\uC2DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.", "City not found.": "\uB3C4\uC2DC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", "Weather unavailable. Saved data stays visible.": "\uB0A0\uC528 \uC815\uBCF4\uB97C \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC800\uC7A5\uB41C \uC815\uBCF4\uB294 \uD45C\uC2DC\uB429\uB2C8\uB2E4." });
Object.assign(translated.ja, { "Appearance & language": "\u5916\u89B3\u3068\u8A00\u8A9E", "Weather settings": "\u5929\u6C17\u306E\u8A2D\u5B9A", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "\u5EA7\u6A19\u306F\u5929\u6C17\u4E88\u5831\u306E\u305F\u3081\u306BOpen-Meteo\u3078\u9001\u4FE1\u3055\u308C\u3001\u3053\u306E\u7AEF\u672B\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002", "Show the whole month": "\u6708\u5168\u4F53\u3092\u8868\u793A", "Show this week": "\u4ECA\u9031\u3092\u8868\u793A", "Clear": "\u6674\u308C", "Cloudy": "\u66C7\u308A", "Fog": "\u9727", "Rain": "\u96E8", "Snow": "\u96EA", "Showers": "\u306B\u308F\u304B\u96E8", "Thunderstorm": "\u96F7\u96E8", "Find": "\u691C\u7D22", "Set the language for Sela.": "Sela\u306E\u8868\u793A\u8A00\u8A9E\u3092\u9078\u3073\u307E\u3059\u3002" });
Object.assign(translated.es, { "Appearance & language": "Apariencia e idioma", "Weather settings": "Ajustes del tiempo", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "Las coordenadas se env\xEDan a Open-Meteo para el pron\xF3stico y se guardan en este dispositivo.", "Show the whole month": "Ver el mes completo", "Show this week": "Ver esta semana", "Clear": "Despejado", "Cloudy": "Nublado", "Fog": "Niebla", "Rain": "Lluvia", "Snow": "Nieve", "Showers": "Chubascos", "Thunderstorm": "Tormenta", "Set the language for Sela.": "Elige el idioma de Sela." });
Object.assign(translated.fr, { "Appearance & language": "Apparence et langue", "Weather settings": "R\xE9glages m\xE9t\xE9o", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "Les coordonn\xE9es sont envoy\xE9es \xE0 Open-Meteo pour les pr\xE9visions et enregistr\xE9es sur cet appareil.", "Show the whole month": "Afficher le mois entier", "Show this week": "Afficher cette semaine", "Clear": "Ensoleill\xE9", "Cloudy": "Nuageux", "Fog": "Brouillard", "Rain": "Pluie", "Snow": "Neige", "Showers": "Averses", "Thunderstorm": "Orage", "Set the language for Sela.": "Choisissez la langue de Sela." });
Object.assign(translated.de, { "Appearance & language": "Darstellung und Sprache", "Weather settings": "Wettereinstellungen", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "Koordinaten werden f\xFCr die Wettervorhersage an Open-Meteo gesendet und auf diesem Ger\xE4t gespeichert.", "Show the whole month": "Ganzen Monat anzeigen", "Show this week": "Diese Woche anzeigen", "Clear": "Klar", "Cloudy": "Bew\xF6lkt", "Fog": "Nebel", "Rain": "Regen", "Snow": "Schnee", "Showers": "Schauer", "Thunderstorm": "Gewitter", "Set the language for Sela.": "W\xE4hle die Sprache f\xFCr Sela." });
Object.assign(translated.pt, { "Appearance & language": "Apar\xEAncia e idioma", "Weather settings": "Configura\xE7\xF5es do clima", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "As coordenadas s\xE3o enviadas ao Open-Meteo para a previs\xE3o e salvas neste dispositivo.", "Show the whole month": "Mostrar o m\xEAs inteiro", "Show this week": "Mostrar esta semana", "Clear": "C\xE9u limpo", "Cloudy": "Nublado", "Fog": "Nevoeiro", "Rain": "Chuva", "Snow": "Neve", "Showers": "Pancadas de chuva", "Thunderstorm": "Tempestade", "Set the language for Sela.": "Escolha o idioma do Sela." });
Object.assign(translated.zh, { "Appearance & language": "\u5916\u89C2\u4E0E\u8BED\u8A00", "Weather settings": "\u5929\u6C14\u8BBE\u7F6E", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "\u5750\u6807\u4F1A\u53D1\u9001\u81F3 Open-Meteo \u83B7\u53D6\u5929\u6C14\u9884\u62A5\uFF0C\u5E76\u4FDD\u5B58\u5728\u6B64\u8BBE\u5907\u4E0A\u3002", "Show the whole month": "\u663E\u793A\u6574\u6708", "Show this week": "\u663E\u793A\u672C\u5468", "Clear": "\u6674\u6717", "Cloudy": "\u591A\u4E91", "Fog": "\u96FE", "Rain": "\u96E8", "Snow": "\u96EA", "Showers": "\u9635\u96E8", "Thunderstorm": "\u96F7\u66B4", "Set the language for Sela.": "\u9009\u62E9 Sela \u7684\u663E\u793A\u8BED\u8A00\u3002" });
Object.assign(translated.ko, { "Appearance & language": "\uD654\uBA74 \uBC0F \uC5B8\uC5B4", "Weather settings": "\uB0A0\uC528 \uC124\uC815", "Coordinates are sent to Open-Meteo for forecasts and saved on this device.": "\uB0A0\uC528 \uC608\uBCF4\uB97C \uC704\uD574 \uC88C\uD45C\uAC00 Open-Meteo\uB85C \uC804\uC1A1\uB418\uACE0 \uC774 \uAE30\uAE30\uC5D0 \uC800\uC7A5\uB429\uB2C8\uB2E4.", "Show the whole month": "\uD55C \uB2EC \uC804\uCCB4 \uBCF4\uAE30", "Show this week": "\uC774\uBC88 \uC8FC \uBCF4\uAE30", "Clear": "\uB9D1\uC74C", "Cloudy": "\uD750\uB9BC", "Fog": "\uC548\uAC1C", "Rain": "\uBE44", "Snow": "\uB208", "Showers": "\uC18C\uB098\uAE30", "Thunderstorm": "\uB1CC\uC6B0", "Set the language for Sela.": "Sela\uC758 \uC5B8\uC5B4\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694." });
export function translate(en, id, locale) {
  const base = localeBase(locale);
  if (base === "id") return id;
  if (base === "en") return en;
  return translated[base]?.[en] || en;
}
