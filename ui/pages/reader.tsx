import React from "react";
import { Button } from "../components/ui/button.tsx";
import { NativeSelect } from "../components/ui/native-select.tsx";
export function ReaderHead({ legacy = false }: { legacy?: boolean }) {
  return (
    <>
      <meta name={"apple-mobile-web-app-capable"} content={"yes"} />
      <meta name={"apple-mobile-web-app-title"} content={"Sela Books"} />
      <link rel={"apple-touch-icon"} href={"../site/icon-192.png"} />
      <link
        id={"mobile-manifest"}
        rel={"manifest"}
        href={legacy ? "../app/manifest.webmanifest" : "manifest.webmanifest"}
      />
      <meta charSet={"utf-8"} />
      <meta
        name={"viewport"}
        content={"width=device-width,initial-scale=1,viewport-fit=cover"}
      />
      <meta name={"color-scheme"} content={"light dark"} />
      <title>{"Sela Books — Your personal library"}</title>
      <meta
        name={"description"}
        content={
          "A personal home for books, comics and documents. Read on desktop, tablet or phone with Sela Books."
        }
      />
      <link
        rel={"canonical"}
        href={"https://bobbyfch.github.io/sela/app/"}
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
      <h1>{"Sela Books · Basic"}</h1>
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
    <div id={"mobile-app"} className={"app-redesign tw:min-h-[100svh] tw:bg-sela-canvas tw:text-sela-ink tw:font-sans"} hidden={true}>
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
    <header className={"topbar tw:sticky tw:top-0 tw:z-30 tw:mx-auto tw:flex tw:w-full tw:max-w-[1440px] tw:items-center tw:justify-between tw:gap-3 tw:px-4 tw:py-3 tw:md:px-8"}>
      <a className={"brand tw:flex tw:min-w-0 tw:shrink-0 tw:items-center tw:gap-2.5 tw:font-semibold tw:tracking-tight"} href={"../app/"}>
        <img className="brand-logo" src="../logo.svg" alt="" width="36" height="36" />
        {"Sela Books "}
        <small>{"{{SELA_LABEL}}"}</small>
      </a>
      <div className={"top-actions tw:flex tw:min-w-0 tw:flex-wrap tw:items-center tw:justify-end tw:gap-1 tw:sm:gap-2"}>
        <Button
          type={"button"}
          variant={"ghost"}
          size={"icon"}
          id={"check-update"}
          className={"icon tw:shrink-0"}
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
        </Button>
        <Button
          type={"button"}
          variant={"ghost"}
          size={"icon"}
          id={"theme"}
          className={"icon tw:shrink-0"}
          aria-label={"Appearance: system"}
          title={"Appearance: system"}
        ></Button>
        <label className={"language-picker tw:relative tw:inline-flex tw:h-11 tw:w-44 tw:min-w-0 tw:shrink-0 tw:cursor-pointer tw:items-center tw:gap-2 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:text-xs tw:font-medium tw:text-sela-ink tw:shadow-sm tw:transition tw:focus-within:ring-2 tw:focus-within:ring-sela-accent/50 tw:md:w-48"}>
          <img id={"language-flag"} className={"language-flag tw:pointer-events-none tw:h-[15px] tw:w-5 tw:shrink-0 tw:rounded-[3px] tw:object-cover"} src={"../site/flag-en.svg"} alt={""} aria-hidden={true} />
          <span id={"language-current"} className={"tw:min-w-0 tw:flex-1 tw:truncate"}>English</span>
          <svg className={"tw:size-4 tw:shrink-0"} viewBox={"0 0 24 24"} aria-hidden={true}><path d={"m6 9 6 6 6-6"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}></path></svg>
        <NativeSelect id={"language"} className={"language-select tw:absolute tw:inset-0 tw:h-full tw:w-full tw:cursor-pointer tw:opacity-0"} aria-label={"Language"} title={"Language"}>
          <option value={"en-US"}>English</option>
          <option value={"id-ID"}>Bahasa Indonesia</option>
          <option value={"ja-JP"}>日本語</option>
        </NativeSelect>
        </label>
        <Button
          type={"button"}
          variant={"ghost"}
          size={"icon"}
          id={"add-books"}
          className={"icon add tw:shrink-0"}
          title={"Add books"}
          aria-label={"Add books"}
        >
          <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
            <path d={"M12 4v16M4 12h16"}></path>
          </svg>
          <span className={"sr"} data-i18n={"add"}>
            {"Add books"}
          </span>
        </Button>
        <input
          tabIndex={-1}
          id={"books"}
          type={"file"}
          multiple={true}
          className={"sr"}
          aria-label={"Choose book files"}
        />
      </div>
    </header>
  );
}
function RoomIntro() {
  return (
    <section className={"room-intro home-room-responsive tw:relative tw:isolate tw:grid tw:min-w-0 tw:items-center tw:gap-5 tw:rounded-[28px] tw:border tw:border-sela-line tw:bg-sela-surface tw:p-5 tw:shadow-sm tw:sm:p-7 tw:lg:p-8"}>
      <div className={"home-welcome tw:relative tw:z-[2] tw:min-w-0"}>
        <p className={"eyebrow tw:mb-2 tw:text-[10px] tw:font-bold tw:tracking-[.2em] tw:text-sela-accent"} data-i18n={"eyebrow"}>
          {"A LITTLE ROOM OF YOUR OWN"}
        </p>
        <h1 className={"tw:mb-3 tw:max-w-[12ch] tw:text-4xl tw:font-bold tw:leading-[1.02] tw:tracking-[-.055em] tw:text-sela-ink tw:sm:text-5xl tw:lg:text-6xl"} data-i18n={"title"}>{"Your little world of stories."}</h1>
        <p className={"tw:mb-0 tw:max-w-[38ch] tw:text-sm tw:leading-6 tw:text-sela-muted tw:sm:text-base tw:sm:leading-7"} data-i18n={"intro"}>
          {"Your books, new discoveries, and a little time for yourself."}
        </p>
        <div className={"tw:mt-4 tw:flex tw:min-w-0 tw:flex-col tw:items-start tw:gap-1.5 tw:sm:mt-5"}>
          <Button type={"button"} variant={"outline"} id={"install-mobile-app"} className={"tw:h-auto tw:min-h-11 tw:w-fit tw:max-w-full tw:items-center tw:gap-2 tw:rounded-full tw:border-sela-line tw:bg-sela-surface/90 tw:px-4 tw:text-sm tw:font-semibold tw:text-sela-accent tw:shadow-sm tw:transition-colors tw:hover:bg-sela-surface"}>
            {"＋ Install / Tambah ke layar utama"}
          </Button>
          <p id={"mobile-offline-status"} className={"tw:m-0 tw:min-h-5 tw:max-w-[56ch] tw:text-xs tw:leading-5 tw:text-sela-muted"} role={"status"}></p>
        </div>
      </div>
      <div className={"ritual tw:grid tw:min-w-0 tw:items-stretch tw:gap-3"}>
        <div className={"clock"}>
          <time id={"clock"}>{"--:--"}</time>
          <span id={"date"}></span>
        </div>
        <Button
          type={"button"}
          variant={"ghost"}
          className={"cup tw:h-auto tw:min-h-0 tw:border-transparent tw:bg-transparent tw:p-0 tw:shadow-none tw:hover:bg-transparent"}
          id={"coffee"}
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
        </Button>
      </div>
    </section>
  );
}
function Library() {
  return (
    <section className={"library tw:space-y-5"} id={"drop-zone"} aria-labelledby={"shelf-title"}>
      <div className={"shelf-heading tw:flex tw:flex-col tw:items-start tw:gap-3 tw:md:flex-row tw:md:items-center tw:md:justify-between"}>
        <h2 id={"shelf-title"} data-i18n={"shelf"}>
          {"On your shelf"}
        </h2>
        <div className={"shelf-controls tw:flex tw:w-full tw:min-w-0 tw:flex-wrap tw:items-center tw:gap-2 tw:md:w-auto"}>
          <label className={"search tw:min-w-0 tw:flex-1 tw:md:flex-none"}>
            <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
              <circle cx={"10"} cy={"10"} r={"6"}></circle>
              <path d={"m15 15 5 5"}></path>
            </svg>
            <input
              id={"search"}
              className={"tw:min-w-0"}
              type={"search"}
              aria-label={"Find a book"}
              placeholder={"Find a book"}
            />
          </label>
          <NativeSelect className={"tw:max-w-full"} id={"sort"} aria-label={"Sort books"}>
            <option value={"saved"}>{"Newest"}</option>
            <option value={"opened"}>{"Last read"}</option>
            <option value={"name"}>{"Title"}</option>
          </NativeSelect>
          <NativeSelect className={"tw:max-w-full"} id={"format-filter"} aria-label={"Filter format"}>
            <option value={"all"}>{"All formats"}</option>
            <option>{"pdf"}</option>
            <option>{"epub"}</option>
            <option>{"cbz"}</option>
            <option>{"txt"}</option>
            <option>{"md"}</option>
            <option>{"html"}</option>
            <option>{"fb2"}</option>
          </NativeSelect>
          <NativeSelect className={"tw:max-w-full"} id={"read-filter"} aria-label={"Filter reading status"}>
            <option value={"all"}>{"All books"}</option>
            <option value={"unread"}>{"Unread"}</option>
            <option value={"opened"}>{"Started"}</option>
            <option value={"favorite"}>{"Favorites"}</option>
          </NativeSelect>
          <Button type={"button"} variant={"ghost"} size={"icon"} className={"tw:shrink-0"} id={"shelf-view"} aria-label={"Switch shelf view"}>
            {"▥"}
          </Button>
        </div>
      </div>
      <div id={"shelf"} className={"shelf tw:grid tw:grid-cols-2 tw:gap-x-5 tw:gap-y-8 tw:sm:grid-cols-3 tw:lg:grid-cols-4 tw:2xl:grid-cols-5"} aria-live={"polite"}></div>
      <div id={"empty"} className={"empty tw:mx-auto tw:max-w-xl tw:p-8 tw:text-center"} hidden={true}>
        <img src={"../logo.svg"} alt={""} width={"68"} height={"68"} />
        <h3 data-i18n={"empty"}>{"Make room for your first story."}</h3>
        <p data-i18n={"drop"}>
          {"Drop books here, or use the + button. Files stay on this browser."}
        </p>
        <Button type={"button"} variant={"outline"} id={"sample"} data-i18n={"sample"} className={"tw:h-auto tw:min-h-10 tw:max-w-full tw:whitespace-normal"}>
          {"Meet Bobby in Yang Tidak Ikut Pulang"}
        </Button>
      </div>
    </section>
  );
}
function Main() {
  return (
    <main className={"app-main tw:mx-auto tw:w-full tw:max-w-[1440px] tw:px-4 tw:pb-8 tw:md:px-8 tw:md:pb-12"}>
      <RoomIntro />
      {"\n"}
      <Library />
      <p id={"status"} role={"status"} aria-live={"polite"}></p>
      <Button type={"button"} variant={"ghost"} id={"undo"} hidden={true} data-i18n={"undo"}>
        {"Undo removal"}
      </Button>
      {"\n"}
      <details className={"library-info tw:mt-8 tw:border-t tw:border-sela-line tw:pt-5 tw:text-sm tw:text-sela-muted"}>
        <summary data-i18n={"about"}>{"Privacy, updates & compatibility"}</summary>
        <p data-i18n={"privacy"}>
          {
            "Books are stored locally in IndexedDB. No account, upload, or tracking. Clearing browser data removes the shelf: keep your original files and export reading notes."
          }
        </p>
        <p data-i18n={"newtab"}>
          {
        "Install Sela Books from your browser on desktop, tablet or phone. You can also bookmark this page or set it as your browser home page."
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
function Footer() {
  return (
    <footer className={"app-footer"}>
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
          href={"https://bobbyfch.github.io/"}
          target={"_blank"}
          rel={"noopener"}
        >
          {"Bobby Fajar Christian"}
        </a>
      </span>
      <nav className="app-footer-social" aria-label={"Bobby Fajar Christian links"}>
        <a href={"https://github.com/bobbyfch"} target={"_blank"} rel={"noopener noreferrer"}>{"GitHub"}</a>
        <a href={"https://www.instagram.com/bobbyfch/"} target={"_blank"} rel={"noopener noreferrer"}>{"Instagram"}</a>
        <a href={"https://www.threads.com/@bobby.fch"} target={"_blank"} rel={"noopener noreferrer"}>{"Threads"}</a>
        <a href={"https://id.linkedin.com/in/bobbyfajarc"} target={"_blank"} rel={"noopener noreferrer"}>{"LinkedIn"}</a>
      </nav>
    </footer>
  );
}
function BottomBar() {
  return <nav className="bottom-bar tw:z-40 tw:flex tw:items-center tw:justify-around" aria-label="Bookshelf navigation" />;
}
