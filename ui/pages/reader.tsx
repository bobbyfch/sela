import React from "react";
export function ReaderHead() {
  return (
    <>
      <meta name={"apple-mobile-web-app-capable"} content={"yes"} />
      <meta name={"apple-mobile-web-app-title"} content={"Sela Reader"} />
      <link rel={"apple-touch-icon"} href={"../site/icon-192.png"} />
      <link
        id={"mobile-manifest"}
        rel={"manifest"}
        href={"manifest.webmanifest"}
      />
      <meta charSet={"utf-8"} />
      <meta
        name={"viewport"}
        content={"width=device-width,initial-scale=1,viewport-fit=cover"}
      />
      <meta name={"color-scheme"} content={"light dark"} />
      <title>{"Sela — Your personal reader"}</title>
      <meta
        name={"description"}
        content={
          "Your personal reading room for desktop, tablet and phone. Read PDF, EPUB, comics and text; install Sela Reader from your browser."
        }
      />
      <link
        rel={"canonical"}
        href={"https://bobbyfch.github.io/sela/mobile/"}
      />
      <link rel={"icon"} href={"../favicon.svg"} />
    </>
  );
}
function DeviceNotice() {
  return <section id={"device-notice"} role={"status"} hidden={true}></section>;
}
function LegacyReader() {
  return (
    <section id={"legacy-mobile"}>
      <h1>{"Sela Reader · Basic"}</h1>
      <p>
        {
          "Browser lama: halaman ringan, PDF asli. Full offline bookshelf needs a modern browser."
        }
      </p>
      <a href={"../example/yang-tidak-ikut-pulang.pdf"}>
        {"Yang Tidak Ikut Pulang · PDF"}
      </a>
      <a href={"../"}>{"Choose a Sela product / Pilih produk"}</a>
    </section>
  );
}
export function ReaderShell() {
  return (
    <div id={"mobile-app"} hidden={true}>
      <Topbar />
      {"\n"}
      <Main />
      {"\n"}
      <Footer />
      {"\n"}
      <BottomBar />
    </div>
  );
}
function PlatformEntry() {
  return <script src={"../site/platform.js"}></script>;
}
function CapabilityEntry() {
  return <script src={"gate.js"}></script>;
}
function ReaderEntry() {
  return <script type={"module"} src={"app.js"}></script>;
}
export function ReaderBody() {
 return <>
          <DeviceNotice />
          <LegacyReader />
          <div id="react-shell"><ReaderShell /></div>
          <PlatformEntry />
          <CapabilityEntry />
          <ReaderEntry />
          {"\n"}
        </>;
}

function Topbar() {
  return (
    <header className={"topbar"}>
      <a className={"brand"} href={"./"}>
        <img className="brand-logo" src="../logo.svg" alt="" width="36" height="36" />
        {"Sela Reader "}
        <small>{"{{SELA_LABEL}}"}</small>
      </a>
      <div className={"top-actions"}>
        <button
          id={"check-update"}
          className={"icon"}
          aria-label={"Check for updates"}
          title={"Check for updates"}
        >
          <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
            <path
              d={
                "M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"
              }
            ></path>
          </svg>
        </button>
        <button
          id={"theme"}
          className={"icon"}
          aria-label={"Appearance: system"}
          title={"Appearance: system"}
        ></button>
        <select id={"language"} className={"icon language-select"} aria-label={"Language"} title={"Language"}>
          <option value={"en-US"}>🇺🇸 English (US)</option>
          <option value={"en-GB"}>🇬🇧 English (UK)</option>
          <option value={"id-ID"}>🇮🇩 Bahasa Indonesia</option>
          <option value={"ja-JP"}>🇯🇵 日本語</option>
          <option value={"es-ES"}>🇪🇸 Español</option>
          <option value={"fr-FR"}>🇫🇷 Français</option>
          <option value={"de-DE"}>🇩🇪 Deutsch</option>
          <option value={"pt-BR"}>🇧🇷 Português</option>
          <option value={"zh-CN"}>🇨🇳 简体中文</option>
          <option value={"ko-KR"}>🇰🇷 한국어</option>
        </select>
        <button
          type={"button"}
          id={"add-books"}
          className={"icon add"}
          title={"Add books"}
          aria-label={"Add books"}
        >
          <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
            <path d={"M12 4v16M4 12h16"}></path>
          </svg>
          <span className={"sr"} data-i18n={"add"}>
            {"Add books"}
          </span>
        </button>
        <input
          tabIndex={-1}
          id={"books"}
          type={"file"}
          multiple={true}
          className={"sr"}
        />
      </div>
    </header>
  );
}
function RoomIntro() {
  return (
    <section className={"room-intro"}>
      <button id={"install-mobile-app"}>
        {"＋ Install / Tambah ke layar utama"}
      </button>
      <p id={"mobile-offline-status"} role={"status"}></p>
      <div>
        <p className={"eyebrow"} data-i18n={"eyebrow"}>
          {"A LITTLE ROOM OF YOUR OWN"}
        </p>
        <h1 data-i18n={"title"}>{"Somewhere to return to."}</h1>
        <p data-i18n={"intro"}>
          {"Your books, a warm cup, and time that belongs to you."}
        </p>
      </div>
      <div className={"ritual"}>
        <div className={"clock"}>
          <time id={"clock"}>{"--:--"}</time>
          <span id={"date"}></span>
        </div>
        <button
          id={"coffee"}
          className={"cup"}
          aria-label={"Pour a little coffee"}
          title={"Pour a little coffee"}
        >
          <span className={"steam"} aria-hidden={"true"}>
            {"∿ ∿ ∿"}
          </span>
          <svg viewBox={"0 0 64 64"} aria-hidden={"true"}>
            <path
              d={"M12 24h32v18c0 15-32 15-32 0Zm32 3h7c13 0 13 17-7 17M7 58h43"}
            ></path>
          </svg>
        </button>
      </div>
    </section>
  );
}
function Library() {
  return (
    <section className={"library"} id={"drop-zone"} aria-labelledby={"shelf-title"}>
      <div className={"shelf-heading"}>
        <h2 id={"shelf-title"} data-i18n={"shelf"}>
          {"On your shelf"}
        </h2>
        <div className={"shelf-controls"}>
          <label className={"search"}>
            <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
              <circle cx={"10"} cy={"10"} r={"6"}></circle>
              <path d={"m15 15 5 5"}></path>
            </svg>
            <input
              id={"search"}
              type={"search"}
              aria-label={"Find a book"}
              placeholder={"Find a book"}
            />
          </label>
          <select id={"sort"} aria-label={"Sort books"}>
            <option value={"saved"}>{"Newest"}</option>
            <option value={"opened"}>{"Last read"}</option>
            <option value={"name"}>{"Title"}</option>
          </select>
          <select id={"format-filter"} aria-label={"Filter format"}>
            <option value={"all"}>{"All formats"}</option>
            <option>{"pdf"}</option>
            <option>{"epub"}</option>
            <option>{"cbz"}</option>
            <option>{"txt"}</option>
            <option>{"md"}</option>
            <option>{"html"}</option>
            <option>{"fb2"}</option>
          </select>
          <select id={"read-filter"} aria-label={"Filter reading status"}>
            <option value={"all"}>{"All books"}</option>
            <option value={"unread"}>{"Unread"}</option>
            <option value={"opened"}>{"Started"}</option>
            <option value={"favorite"}>{"Favorites"}</option>
          </select>
          <button id={"shelf-view"} aria-label={"Switch shelf view"}>
            {"▥"}
          </button>
        </div>
      </div>
      <div id={"shelf"} className={"shelf"} aria-live={"polite"}></div>
      <div id={"empty"} className={"empty"} hidden={true}>
        <img src={"../logo.svg"} alt={""} width={"68"} height={"68"} />
        <h3 data-i18n={"empty"}>{"Make room for your first story."}</h3>
        <p data-i18n={"drop"}>
          {"Drop books here, or use the + button. Files stay on this browser."}
        </p>
        <button id={"sample"} data-i18n={"sample"}>
          {"Meet Bobby in Yang Tidak Ikut Pulang"}
        </button>
      </div>
    </section>
  );
}
function Main() {
  return (
    <main>
      <RoomIntro />
      {"\n"}
      <Library />
      <p id={"status"} role={"status"} aria-live={"polite"}></p>
      <button id={"undo"} hidden={true} data-i18n={"undo"}>
        {"Undo removal"}
      </button>
      {"\n"}
      <details className={"library-info"}>
        <summary data-i18n={"about"}>{"Privacy, updates & compatibility"}</summary>
        <p data-i18n={"privacy"}>
          {
            "Books are stored locally in IndexedDB. No account, upload, or tracking. Clearing browser data removes the shelf: keep your original files and export reading notes."
          }
        </p>
        <p data-i18n={"newtab"}>
          {
            "Install Sela Reader from your browser on desktop, tablet or phone. You can also bookmark this page or set it as your browser home page."
          }
        </p>
        <p data-i18n={"formats"}>
          {
            "PDF, EPUB, CBZ and text. Narration uses available browser/OS voices. Documents with text can be searched; scanned PDFs need OCR. Reader adapts to desktop, tablet and phone."
          }
        </p>
        <p id={"update-status"} role={"status"}></p>
        <a
          id={"update-link"}
          href={"https://github.com/bobbyfch/sela/releases"}
          target={"_blank"}
          rel={"noopener"}
          hidden={true}
        >
          {"Download release ↗"}
        </a>
        <label id={"update-setting"} hidden={true}>
          <input id={"auto-update"} type={"checkbox"} defaultChecked={true} />{" "}
          <span data-i18n={"autoUpdate"}>
            {"Check GitHub releases once a day (notification only)"}
          </span>
        </label>
      </details>
    </main>
  );
}
function Nav() {
  return (
    <nav aria-label={"Author links"}>
      <a
        href={"[private social link removed]"}
        target={"_blank"}
        rel={"noopener"}
      >
        {"Instagram"}
      </a>
      <a
        href={"[private social link removed]"}
        target={"_blank"}
        rel={"noopener"}
      >
        {"LinkedIn"}
      </a>
      <a
        href={"https://github.com/bobbyfch"}
        target={"_blank"}
        rel={"noopener"}
      >
        {"GitHub"}
      </a>
    </nav>
  );
}
function Footer() {
  return (
    <footer>
      <a
        href={"https://github.com/bobbyfch/sela"}
        target={"_blank"}
        rel={"noopener"}
      >
        {"Sela · open source"}
      </a>
      <span>
        {"Made with care by "}
        <a
          href={"https://bobbyfajarc.github.io/"}
          target={"_blank"}
          rel={"noopener"}
        >
          {"Bobby Fajar Christian"}
        </a>
      </span>
      <Nav />
    </footer>
  );
}
function BottomBar() {
  return <nav className="bottom-bar" aria-label="Bookshelf navigation" />;
}
