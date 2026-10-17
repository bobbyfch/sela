import React from "react";
import { Button } from "../components/ui/button.tsx";
import { NativeSelect } from "../components/ui/native-select.tsx";
import {
  siAstro,
  siBootstrap,
  siCodeigniter,
  siHtml5,
  siLaravel,
  siReact,
  siTailwindcss,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";

const supportedStack: ReadonlyArray<{ label: string; icon: SimpleIcon }> = [
  { label: "HTML", icon: siHtml5 },
  { label: "CodeIgniter", icon: siCodeigniter },
  { label: "Laravel", icon: siLaravel },
  { label: "Bootstrap", icon: siBootstrap },
  { label: "React", icon: siReact },
  { label: "Vue", icon: siVuedotjs },
  { label: "Astro", icon: siAstro },
  { label: "Tailwind CSS", icon: siTailwindcss },
];

function BrandMark({ icon }: { icon: SimpleIcon }) {
  return (
    <svg viewBox="0 0 24 24" className="tw:size-5 tw:shrink-0" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

function StackLogos() {
  return (
    <ul className="tw:mt-4 tw:flex tw:flex-wrap tw:gap-2 tw:p-0" aria-label="Supported web stacks">
      {supportedStack.map(({ label, icon }) => (
        <li key={label} className="tw:inline-flex tw:min-h-10 tw:items-center tw:gap-2 tw:rounded-xl tw:border tw:border-sela-line/80 tw:bg-sela-canvas/80 tw:px-3 tw:text-xs tw:font-semibold tw:text-sela-ink tw:transition-all tw:duration-200 tw:hover:-translate-y-0.5 tw:hover:border-sela-accent/50 tw:hover:bg-sela-surface tw:hover:shadow-sm">
          <BrandMark icon={icon} />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
export function PublicHead() {
  return (
    <>
      {"\n"}
      <meta charSet={"utf-8"} />
      <meta name={"viewport"} content={"width=device-width,initial-scale=1"} />
      <meta name={"color-scheme"} content={"light dark"} />
      {"\n"}
      <title>{"Sela Books — Your personal library"}</title>
      {"\n"}
      <meta
        name={"description"}
        content={
          "Your personal reading room for books, comics and documents on desktop, tablet and phone. Install from your browser, keep an offline shelf, or embed the lightweight Viewer CDN."
        }
      />
      {"\n"}
      <meta name={"robots"} content={"index,follow,max-image-preview:large"} />
      <meta name={"theme-color"} content={"#ffffff"} />
      {"\n"}
      <link rel={"canonical"} href={"https://bobbyfch.github.io/sela/"} />
      {"\n"}
      <meta property={"og:type"} content={"website"} />
      <meta property={"og:site_name"} content={"Sela Books"} />
      <meta property={"og:title"} content={"Sela Books — Your personal library"} />
      <meta
        property={"og:description"}
        content={
          "Your private library. PDF, EPUB, comics and text, with offline reading on desktop, tablet and phone."
        }
      />
      <meta property={"og:url"} content={"https://bobbyfch.github.io/sela/"} />
      <meta
        property={"og:image"}
        content={"https://bobbyfch.github.io/sela/site/social-sela.png"}
      />
      <meta
        property={"og:image:alt"}
        content={"Sela Books app running on desktop and phone"}
      />
      <meta property={"og:image:width"} content={"1200"} />
      <meta property={"og:image:height"} content={"630"} />
      <meta property={"og:locale"} content={"en_US"} />
      <meta property={"og:locale:alternate"} content={"id_ID"} />
      {"\n"}
      <meta name={"twitter:card"} content={"summary_large_image"} />
      <meta name={"twitter:title"} content={"Sela Books — Your personal library"} />
      <meta
        name={"twitter:description"}
        content={
          "Install the reading web app on your device, or embed the lightweight viewer in your website."
        }
      />
      <meta
        name={"twitter:image"}
        content={"https://bobbyfch.github.io/sela/site/social-sela.png"}
      />
      {"\n"}
      <link rel={"apple-touch-icon"} href={"site/icon-192.png"} />
      <link rel={"icon"} href={"favicon.svg"} type={"image/svg+xml"} />
      <link rel={"alternate icon"} href={"favicon.png"} />
      {"\n"}
      <script type={"application/ld+json"}>
        {
          '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Sela Books","applicationCategory":"LifestyleApplication","operatingSystem":"Any OS with a supported web browser","softwareVersion":"{{SELA_VERSION}}","url":"https://bobbyfch.github.io/sela/","downloadUrl":"https://github.com/bobbyfch/sela/releases","codeRepository":"https://github.com/bobbyfch/sela","license":"https://opensource.org/license/mit","description":"Open-source universal reader for PDF, reflowable EPUB and CBZ, with optional DjVu. Book, single, seamless webtoon and manga modes. Format adapters load on demand.","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Person","name":"Bobby Fajar Christian"}}'
        }
      </script>
      {"\n"}
    </>
  );
}
function PublicNavigation() {
  return (
    <header className={"nav tw:sticky tw:top-0 tw:z-50 tw:mx-auto tw:flex tw:w-full tw:max-w-[1440px] tw:flex-wrap tw:items-center tw:justify-between tw:gap-x-5 tw:gap-y-2 tw:border-b tw:border-sela-line/80 tw:bg-sela-canvas/90 tw:px-4 tw:py-3 tw:backdrop-blur-2xl tw:sm:px-6 tw:lg:px-10"}>
      <a className={"brand tw:flex tw:min-w-0 tw:shrink-0 tw:items-center tw:gap-3 tw:font-semibold tw:tracking-tight tw:text-sela-ink tw:no-underline"} href={"#"}>
        <img
          src={"logo.svg"}
          alt={"Sela Books symbol"}
          width={"36"}
          height={"36"}
          className={"tw:size-10 tw:rounded-[14px] tw:shadow-md tw:shadow-sela-violet/15"}
        />
        <span className={"tw:text-lg tw:font-semibold tw:tracking-[-.04em] tw:sm:text-xl"}>{"Sela Books"}</span>
        <span className={"tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:px-2.5 tw:py-1 tw:text-[10px] tw:font-semibold tw:tracking-wide tw:text-sela-muted tw:max-[430px]:hidden"}>{"{{SELA_LABEL}}"}</span>
      </a>
      <div className={"nav-actions tw:flex tw:min-w-0 tw:max-w-full tw:flex-wrap tw:items-center tw:justify-end tw:gap-2 tw:sm:gap-2.5"}>
        <div className={"theme-switch tw:flex tw:shrink-0 tw:items-center tw:gap-0.5 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface/90 tw:p-1 tw:shadow-sm"} role={"group"} aria-label={"Appearance"}>
          <Button
            variant={"ghost"}
            size={"icon"}
            type={"button"}
            data-theme-choice={"light"}
            aria-label={"Light theme"}
            title={"Light"}
            aria-pressed={"false"}
            className={"tw:grid tw:size-11 tw:place-items-center tw:rounded-xl tw:text-sela-muted tw:transition-colors tw:hover:bg-sela-canvas tw:hover:text-sela-ink tw:aria-pressed:bg-sela-accent tw:aria-pressed:text-white"}
          >
            <i className={"ph-fill ph-sun tw:text-[19px]"} aria-hidden={true}></i>
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            type={"button"}
            data-theme-choice={"dark"}
            aria-label={"Dark theme"}
            title={"Dark"}
            aria-pressed={"false"}
            className={"tw:grid tw:size-11 tw:place-items-center tw:rounded-xl tw:text-sela-muted tw:transition-colors tw:hover:bg-sela-canvas tw:hover:text-sela-ink tw:aria-pressed:bg-sela-accent tw:aria-pressed:text-white"}
          >
            <i className={"ph-fill ph-moon-stars tw:text-[19px]"} aria-hidden={true}></i>
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            type={"button"}
            data-theme-choice={"auto"}
            aria-label={"System theme"}
            title={"System"}
            aria-pressed={"false"}
            className={"tw:grid tw:size-11 tw:place-items-center tw:rounded-xl tw:text-sela-muted tw:transition-colors tw:hover:bg-sela-canvas tw:hover:text-sela-ink tw:aria-pressed:bg-sela-accent tw:aria-pressed:text-white"}
          >
            <i className={"ph-fill ph-desktop-tower tw:text-[19px]"} aria-hidden={true}></i>
          </Button>
        </div>
        <NativeSelect id={"theme"} hidden={true} aria-label={"Appearance"}>
          <option value={"auto"}>{"System"}</option>
          <option value={"light"}>{"Light"}</option>
          <option value={"dark"}>{"Dark"}</option>
        </NativeSelect>
        <div className={"tw:flex tw:min-w-0 tw:items-center tw:gap-1.5 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-surface tw:px-2 tw:shadow-sm"}>
        <img id={"language-flag"} className={"language-flag tw:h-[15px] tw:w-5 tw:shrink-0 tw:rounded-[3px] tw:object-cover"} src={"site/flag-en.svg"} alt={""} aria-hidden={true} />
        <NativeSelect id={"language"} className={"public-language-select tw:h-11 tw:min-w-0 tw:max-w-[min(38vw,190px)] tw:cursor-pointer tw:border-0 tw:bg-transparent tw:py-1 tw:pr-1 tw:text-xs tw:font-medium tw:text-sela-ink tw:outline-none"} aria-label={"Language"}>
          <option value={"en-US"}>{"English"}</option>
          <option value={"id-ID"}>{"Bahasa Indonesia"}</option>
          <option value={"ja-JP"}>{"日本語"}</option>
        </NativeSelect>
        </div>
        <a
          className={"tw:grid tw:size-10 tw:shrink-0 tw:place-items-center tw:rounded-xl tw:text-sela-ink tw:transition-colors tw:hover:bg-sela-surface tw:hover:text-sela-accent tw:max-[430px]:hidden"}
          href={"https://github.com/bobbyfch/sela"}
          aria-label={"Sela on GitHub"}
        >
          <i className={"ph-fill ph-github-logo tw:text-[22px]"} aria-hidden={true}></i>
        </a>
      </div>
    </header>
  );
}
function PublicContent() {
  return (
    <main className={"tw:mx-auto tw:w-full tw:max-w-[1440px] tw:px-4 tw:sm:px-6 tw:lg:px-10 tw:2xl:px-12"}>
      {"\n"}
      <Hero />
      {"\n"}
      <Products />
      <p className="tw:mx-auto tw:my-3 tw:max-w-6xl tw:text-sm tw:font-medium tw:text-sela-accent" id={"product-status"} role={"status"} aria-live={"polite"}></p>
      <section id={"install-viewer"} className={"developer-playground tw:my-12 tw:scroll-mt-24 tw:overflow-hidden tw:rounded-[1.75rem] tw:border tw:border-sela-line/80 tw:bg-sela-surface/90 tw:shadow-sm tw:backdrop-blur-xl"} aria-labelledby="setup-heading">
        <header className="tw:flex tw:flex-wrap tw:items-center tw:gap-4 tw:border-b tw:border-sela-line/80 tw:px-5 tw:py-5 tw:sm:px-7 tw:sm:py-6">
          <span className="tw:grid tw:size-12 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-violet/10 tw:text-sela-accent"><i className="ph-fill ph-sliders-horizontal tw:text-2xl" aria-hidden="true"></i></span>
          <div className="tw:min-w-0 tw:flex-1">
            <p className="tw:mb-1 tw:text-[10px] tw:font-bold tw:tracking-[.18em] tw:text-sela-accent">{"TRY IT · MAKE IT YOURS"}</p>
            <h2 id="setup-heading" className="tw:m-0 tw:text-xl tw:font-semibold tw:tracking-tight tw:text-sela-ink tw:sm:text-2xl" data-en="Try the reader and get your setup" data-id="Coba reader dan siapkan konfigurasinya">{"Try the reader and get your setup"}</h2>
          </div>
          <p className="tw:m-0 tw:max-w-sm tw:text-sm tw:leading-6 tw:text-sela-muted" data-en="Choose a sample, pick a reading style, then copy the ready-to-use snippet." data-id="Pilih contoh, tentukan cara membaca, lalu salin konfigurasi yang siap dipakai.">{"Choose a sample, pick a reading style, then copy the ready-to-use snippet."}</p>
        </header>
        <div className="tw:grid tw:items-stretch tw:gap-4 tw:p-4 tw:sm:gap-5 tw:sm:p-6 tw:xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] tw:xl:gap-6 tw:lg:p-7">
        <div className="tw:min-w-0 tw:rounded-2xl tw:border tw:border-sela-line/80 tw:bg-sela-surface/80 tw:px-4 tw:sm:px-5">
        <Demo />
        </div>
        <form className={"playground tw:min-w-0 tw:rounded-2xl tw:border tw:border-sela-line/80 tw:bg-sela-surface/80 tw:p-4 tw:sm:p-5"} id={"playground"}>
          <ol className="tw:mb-6 tw:grid tw:grid-cols-1 tw:gap-2 tw:pl-0 tw:sm:grid-cols-3">
            <li className="tw:flex tw:items-center tw:gap-3 tw:rounded-xl tw:bg-sela-canvas tw:p-3 tw:text-xs tw:leading-5 tw:text-sela-muted"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-violet/10 tw:font-bold tw:text-sela-accent">1</span><span data-en="Choose a sample or your own file." data-id="Pilih contoh atau file milikmu.">Choose a sample or your own file.</span></li>
            <li className="tw:flex tw:items-center tw:gap-3 tw:rounded-xl tw:bg-sela-canvas tw:p-3 tw:text-xs tw:leading-5 tw:text-sela-muted"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-sky/15 tw:font-bold tw:text-sela-sky">2</span><span data-en="Pick how you want to read." data-id="Pilih cara membaca.">Pick how you want to read.</span></li>
            <li className="tw:flex tw:items-center tw:gap-3 tw:rounded-xl tw:bg-sela-canvas tw:p-3 tw:text-xs tw:leading-5 tw:text-sela-muted"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-pink/15 tw:font-bold tw:text-sela-pink">3</span><span data-en="Open it. Copy the setup if you want it on your site." data-id="Buka. Salin konfigurasinya jika ingin dipakai di situsmu.">Open it. Copy the setup if you want it on your site.</span></li>
          </ol>
          <div className={"playground-heading tw:mb-5 tw:flex tw:flex-wrap tw:items-end tw:justify-between tw:gap-4"}>
            <div>
              <p className={"eyebrow tw:mb-2 tw:text-[10px] tw:font-bold tw:tracking-[.2em] tw:text-sela-accent"} data-i18n={"playEyebrow"}>
                {"MAKE IT YOURS"}
              </p>
              <h3 className="tw:m-0 tw:text-xl tw:font-semibold tw:tracking-tight" data-i18n={"playTitle"}>{"Live configuration."}</h3>
            </div>
            <Button
              variant={"default"}
              type={"submit"}
              className={"launch-reader tw:h-auto tw:min-h-11 tw:inline-flex tw:items-center tw:justify-center tw:rounded-xl tw:bg-sela-accent tw:px-4 tw:text-sm tw:font-semibold tw:text-white tw:transition-colors tw:hover:bg-sela-violet"}
              data-i18n={"launch"}
            >
              {"Open reader ↗"}
            </Button>
          </div>
          <div className={"play-controls tw:grid tw:grid-cols-1 tw:gap-4 tw:sm:grid-cols-2 tw:lg:grid-cols-3 [&_label]:grid [&_label]:gap-2 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-sela-muted [&_select]:h-11 [&_select]:min-w-0 [&_select]:rounded-xl [&_select]:border [&_select]:border-sela-line [&_select]:bg-sela-canvas [&_select]:px-3 [&_select]:text-sm [&_select]:font-medium [&_select]:text-sela-ink [&_input[type=range]]:w-full [&_input[type=range]]:accent-sela-accent"}>
            <label>
              <span data-i18n={"documentLabel"}>{"Document"}</span>
              <NativeSelect id={"sample"}>
                <option value={"pdf"}>{"Yang Tidak Ikut Pulang · PDF"}</option>
                <option value={"epub"}>
                  {"Yang Tidak Ikut Pulang · EPUB"}
                </option>
                <option value={"cbz"}>{"Illustration gallery · CBZ"}</option>
                <option value={"djvu"}>{"Green valley · DjVu"}</option>
                <option value={"txt"}>{"A quiet interval · TXT"}</option>
                <option value={"md"}>{"A quiet interval · Markdown"}</option>
                <option value={"html"}>{"A quiet interval · HTML"}</option>
                <option value={"fb2"}>{"A quiet interval · FB2"}</option>
              </NativeSelect>
            </label>
            <label>
              <span data-i18n={"modeLabel"}>{"Reading mode"}</span>
              <NativeSelect id={"demo-mode"}>
                <option value={"book"}>{"Book"}</option>
                <option value={"single"}>{"Single"}</option>
                <option value={"scroll"}>{"Scroll"}</option>
                <option value={"webtoon"}>{"Webtoon"}</option>
                <option value={"manga"}>{"Manga RTL"}</option>
              </NativeSelect>
            </label>
            <label>
              <span data-i18n={"presentationLabel"}>{"Presentation"}</span>
              <NativeSelect id={"demo-presentation"}>
                <option value={"overlay"}>{"Overlay"}</option>
                <option value={"inline"}>{"Embedded"}</option>
              </NativeSelect>
            </label>
          </div>
          <details className="tw:mt-4 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-canvas">
            <summary className="tw:flex tw:min-h-11 tw:cursor-pointer tw:list-none tw:items-center tw:justify-between tw:gap-3 tw:px-4 tw:text-sm tw:font-semibold tw:text-sela-ink [&::-webkit-details-marker]:hidden"><span data-en="More reading settings" data-id="Pengaturan baca lainnya">More reading settings</span><i className="ph-fill ph-caret-down tw:text-sela-muted" aria-hidden="true"></i></summary>
            <div className="tw:grid tw:grid-cols-1 tw:gap-4 tw:border-t tw:border-sela-line tw:p-4 tw:sm:grid-cols-2 tw:lg:grid-cols-3 [&_label]:grid [&_label]:gap-2 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-sela-muted [&_select]:h-11 [&_select]:min-w-0 [&_select]:rounded-xl [&_select]:border [&_select]:border-sela-line [&_select]:bg-sela-surface [&_select]:px-3 [&_select]:text-sm [&_select]:font-medium [&_select]:text-sela-ink [&_input[type=range]]:w-full [&_input[type=range]]:accent-sela-accent">
            <label>
              <span data-i18n={"filterLabel"}>{"Reading filter"}</span>
              <NativeSelect id={"demo-filter"}>
                <option value={"none"}>{"Original"}</option>
                <option value={"grayscale"}>{"Black & white"}</option>
                <option value={"sepia"}>{"Sepia"}</option>
                <option value={"contrast"}>{"High contrast"}</option>
                <option value={"warm"}>{"Warm"}</option>
                <option value={"cool"}>{"Cool"}</option>
                <option value={"night"}>{"Night page"}</option>
                <option value={"invert"}>{"Invert colors"}</option>
                <option value={"paper"}>{"Paper"}</option>
                <option value={"soft"}>{"Soft contrast"}</option>
                <option value={"saturated"}>{"Vivid"}</option>
                <option value={"lowblue"}>{"Amber"}</option>
              </NativeSelect>
            </label>
            <label>
              <span data-i18n={"gapLabel"}>{"Vertical page gap"}</span>
              <NativeSelect id={"demo-gap"}>
                <option value={"0"}>{"0 px · seamless"}</option>
                <option value={"16"}>{"16 px"}</option>
                <option value={"32"}>{"32 px"}</option>
              </NativeSelect>
            </label>
            <label>
              <span data-i18n={"motionLabel"}>{"Turn duration"}</span>
              <NativeSelect id={"demo-duration"}>
                <option value={"560"}>{"560 ms"}</option>
                <option value={"320"}>{"320 ms"}</option>
                <option value={"800"}>{"800 ms"}</option>
                <option value={"0"}>{"0 · no animation"}</option>
              </NativeSelect>
            </label>
            <label>
              <span data-i18n={"zoomLabel"}>{"Zoom / text size"}</span>
              <input
                id={"demo-zoom"}
                type={"range"}
                min={"1"}
                max={"3"}
                step={"0.1"}
                defaultValue={"1"}
              />
            </label>
          </div>
          <div className={"play-toggles tw:flex tw:flex-wrap tw:gap-3 tw:px-4 tw:pb-4 [&_label]:inline-flex [&_label]:min-h-11 [&_label]:items-center [&_label]:gap-2 [&_label]:rounded-xl [&_label]:border [&_label]:border-sela-line [&_label]:bg-sela-surface [&_label]:px-3 [&_label]:text-xs [&_label]:text-sela-muted [&_input]:accent-sela-accent"}>
            <label>
              <input id={"demo-paper"} type={"checkbox"} defaultChecked={true} />
              <span data-i18n={"paperLabel"}>{"Paper texture"}</span>
            </label>
            <label>
              <input id={"demo-wheel"} type={"checkbox"} />
              <span data-i18n={"wheelLabel"}>{"Plain mouse wheel zoom"}</span>
            </label>
            <label>
              <input id={"demo-sound"} type={"checkbox"} />
              <span data-i18n={"soundLabel"}>{"Page sound"}</span>
            </label>
          </div>
          </details>
          <p className={"play-note tw:mt-5 tw:text-xs tw:leading-6 tw:text-sela-muted"} data-i18n={"playNote"}>
            {
              "Ctrl + wheel or trackpad pinch zooms; normal scrolling stays natural. Press ? inside the reader for shortcuts. EPUB uses chapter-based text reading."
            }
          </p>
          <div className="tw:mb-2 tw:mt-6 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3"><h4 className="tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink" data-en="Your website setup" data-id="Konfigurasi untuk situsmu">Your website setup</h4><Button type="button" variant="outline" id="copy-config" className="tw:min-h-10 tw:rounded-xl tw:px-3 tw:text-xs tw:font-semibold" data-en="Copy setup" data-id="Salin konfigurasi">Copy setup</Button></div>
          <code className="tw:block tw:overflow-x-auto tw:rounded-xl tw:bg-[#20212b] tw:px-4 tw:py-3 tw:font-mono tw:text-xs tw:leading-6 tw:text-[#edeaff]" id={"config-code"} aria-label="Sela configuration code"></code>
          <p className="tw:mt-2 tw:text-xs tw:leading-5 tw:text-sela-muted" data-en="For your own file, upload it to a URL your website can access and replace the sample URL in this snippet." data-id="Untuk file sendiri, unggah ke alamat yang bisa diakses situsmu lalu ganti URL contoh di potongan kode ini.">For your own file, upload it to a URL your website can access and replace the sample URL in this snippet.</p>
          <p className={"format-note tw:mt-4 tw:text-xs tw:leading-6 tw:text-sela-muted"} data-i18n={"formatNote"}>
            {
              "PDF, EPUB, comics and text have optional reading tools: contents, search, narration and notes. FB2 is text-only; DjVu uses an external GPL-2.0 decoder."
            }
          </p>
          <p className="tw:mt-3 tw:text-sm tw:font-medium tw:text-sela-accent" id={"status"} role={"status"} aria-live={"polite"}></p>
          <div
            id={"embedded-reader"}
            className={"embedded-reader tw:mt-6 tw:h-[min(75vh,760px)] tw:min-h-[420px] tw:overflow-hidden tw:rounded-2xl tw:border tw:border-sela-line"}
            hidden={true}
          ></div>
        </form>
        </div>
        <Install />
      </section>
      <SampleGallery />
      {"\n"}
      <ReadingCorner />
      {"\n"}
      <Notes />
      {"\n"}
    </main>
  );
}
function PublicFooter() {
  return (
    <footer className="cozy-footer tw:mx-auto tw:mt-16 tw:flex tw:w-full tw:max-w-[1440px] tw:flex-wrap tw:items-center tw:gap-x-5 tw:gap-y-3 tw:border-t tw:border-sela-line tw:px-4 tw:py-8 tw:text-sela-muted tw:sm:px-6 tw:lg:px-10">
      <img className="footer-mascot tw:order-1 tw:w-20 tw:shrink-0 tw:drop-shadow-md tw:sm:w-24" src="site/illustrations/book-cart.webp" width="900" height="675" loading="lazy" alt="" aria-hidden="true" />
      <p className="footer-invitation tw:order-2 tw:my-0 tw:min-w-[220px] tw:flex-1 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink tw:sm:text-lg" data-en="A little corner for your next chapter." data-id="Sudut kecil untuk bab berikutnya.">A little corner for your next chapter.</p>
      <small className="tw:order-4 tw:w-full tw:max-w-3xl tw:text-xs tw:leading-6" data-i18n={"regionNote"}>
        {
          "First-visit language uses country.is IP country lookup; saved choice wins. No document is sent. Add ?geo=off to disable."
        }
      </small>
      <span className="tw:order-3 tw:text-xs tw:font-medium">
        {"Sela · MIT · "}
        <a href={"https://bobbyfch.github.io/"}>{"Bobby Fajar Christian"}</a>
      </span>
      <Nav />
      <a
        className="tw:order-3 tw:ml-auto tw:text-xs tw:font-semibold tw:text-sela-ink tw:underline-offset-4 hover:tw:underline"
        href={
          "https://github.com/bobbyfch/sela/blob/main/THIRD_PARTY_NOTICES.md"
        }
      >
        {"Third-party notices ↗"}
      </a>
    </footer>
  );
}
function CompatibilityEntry() {
  return <script src={"dist/js/sela.compat.js?v={{SELA_VERSION}}"}></script>;
}
function DemoEntry() {
  return <script type={"module"} src={"site/demo.js?v={{SELA_VERSION}}"}></script>;
}
function MotionEntry() {
  return <script src={"site/motion.js?v={{SELA_VERSION}}"} defer={true}></script>;
}
function PlatformEntry() {
  return <script src={"site/platform.js?v={{SELA_VERSION}}"}></script>;
}
function ProductsEntry() {
  return <script src={"site/products.js?v={{SELA_VERSION}}"}></script>;
}
function LanguageEntry() {
  return <script type={"module"} src={"site/product-language.js?v={{SELA_VERSION}}"}></script>;
}
export function PublicBody() {
 return <>
          {"\n"}
          <PublicNavigation />
          {"\n"}
          <PublicContent />
      <details className="reader-debug tw:hidden"><summary>Reader diagnostics</summary><pre id="reader-debug" aria-label="Reader debug output">Open a document to inspect its lifecycle. Document text, URLs, headers and error messages are excluded.</pre></details>
          <PublicFooter />
          {"\n"}
          <CompatibilityEntry />
          <DemoEntry />
          <MotionEntry />
          <PlatformEntry />
          <ProductsEntry />
          <LanguageEntry />
          {"\n\n"}
        </>;
}


function Hero() {
  return (
    <section className={"hero tw:grid tw:grid-cols-1 tw:items-center tw:gap-8 tw:py-8 tw:sm:py-9 tw:min-[901px]:grid-cols-[1fr_1.05fr] tw:min-[901px]:gap-12 tw:min-[901px]:py-12 tw:xl:gap-16"}>
      <div className={"tw:min-w-0"}>
        <p className={"eyebrow tw:mb-4 tw:text-[11px] tw:font-bold tw:tracking-[.2em] tw:text-sela-accent"} data-i18n={"eyebrow"}>
          {"YOUR PERSONAL READING ROOM"}
        </p>
        <h1 className={"tw:mb-5 tw:max-w-[11ch] tw:text-[clamp(3.25rem,7vw,6.25rem)] tw:font-semibold tw:leading-[.96] tw:tracking-[-.075em] tw:text-sela-ink"} data-i18n={"headline"}>
          {"Your books."}
          <br />
          {"Within reach."}
        </h1>
        <p className={"intro tw:mb-0 tw:max-w-[38rem] tw:text-base tw:leading-7 tw:text-sela-muted tw:sm:text-lg tw:sm:leading-8"} data-i18n={"intro"}>
          {
            "Read books, comics and documents on your own terms. Keep your shelf offline, and pick up where you left off."
          }
        </p>
        <div className={"pills tw:mt-6 tw:flex tw:flex-wrap tw:items-center tw:gap-2"}>
          <span className="tw:inline-flex tw:min-h-9 tw:items-center tw:gap-1.5 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:text-xs tw:font-medium tw:text-sela-ink"><i className="ph-fill ph-files tw:text-sm tw:text-sela-violet" aria-hidden={true}></i>{"PDF · EPUB · Comics"}</span>
          <span className="tw:inline-flex tw:min-h-9 tw:items-center tw:gap-1.5 tw:rounded-full tw:border tw:border-sela-sky/25 tw:bg-sela-sky/10 tw:px-3 tw:text-xs tw:font-medium tw:text-sela-ink" data-en={"Local-first"} data-id={"Berkas lokal"}>
            <i className="ph-fill ph-hard-drives tw:text-sm tw:text-sela-sky" aria-hidden={true}></i>
            {"Local-first"}
          </span>
          <span className="tw:inline-flex tw:min-h-9 tw:items-center tw:gap-1.5 tw:rounded-full tw:border tw:border-sela-pink/25 tw:bg-sela-pink/10 tw:px-3 tw:text-xs tw:font-medium tw:text-sela-ink" data-en={"No account"} data-id={"Tanpa akun"}>
            <i className="ph-fill ph-user-minus tw:text-sm tw:text-sela-pink" aria-hidden={true}></i>
            {"No account"}
          </span>
        </div>
        <div className={"install-actions tw:mt-7 tw:flex tw:flex-wrap tw:items-center tw:gap-3"}>
          <a className={"install-button tw:inline-flex tw:min-h-12 tw:items-center tw:justify-center tw:gap-2.5 tw:rounded-2xl tw:bg-sela-accent tw:px-5 tw:py-3 tw:text-sm tw:font-semibold tw:text-white tw:shadow-lg tw:shadow-sela-violet/20 tw:transition tw:hover:-translate-y-0.5 tw:hover:shadow-xl"} href={"app/"}>
            <i className="ph-fill ph-device-mobile tw:text-xl" aria-hidden={true}></i>
            <span data-en={"Open web app"} data-id={"Buka web app"}>
              {"Open web app"}
            </span>
          </a>
          <a className={"install-button secondary tw:inline-flex tw:min-h-12 tw:items-center tw:justify-center tw:gap-2.5 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface tw:px-5 tw:py-3 tw:text-sm tw:font-semibold tw:text-sela-ink tw:transition-colors tw:hover:border-sela-accent tw:hover:text-sela-accent"} href={"#install-viewer"}>
            <i className="ph-fill ph-code tw:text-xl" aria-hidden={true}></i>
            <span data-en={"Use Viewer CDN"} data-id={"Gunakan Viewer CDN"}>
              {"Use Viewer CDN"}
            </span>
          </a>
        </div>
        <a
          className={"hero-link tw:mt-3 tw:inline-flex tw:min-h-11 tw:items-center tw:text-sm tw:font-semibold tw:text-sela-muted tw:underline-offset-4 hover:tw:text-sela-accent hover:tw:underline"}
          href={"#install-mobile"}
          data-en={"How to install the app →"}
          data-id={"Cara memasang app →"}
        >
          {"How to install the app →"}
        </a>
      </div>
      <figure className="reader-illustration device-scene cozy-device-scene tw:relative tw:mx-auto tw:min-w-0 tw:w-full tw:max-w-3xl tw:px-1 tw:pb-12 tw:pt-4 tw:sm:px-3 tw:sm:pb-14 tw:sm:pt-7" aria-label="Sela Books on laptop and phone">
        <div className="device-laptop tw:relative tw:z-10 tw:ml-0 tw:w-[88%] tw:overflow-hidden tw:rounded-[1.4rem] tw:border-[7px] tw:border-[#252633] tw:bg-[#252633] tw:p-1.5 tw:shadow-2xl tw:shadow-[#33344a]/20 tw:sm:border-[9px] tw:sm:p-2">
          <div className="device-camera tw:absolute tw:left-1/2 tw:top-0 tw:z-10 tw:h-1 tw:w-10 tw:-translate-x-1/2 tw:rounded-b-full tw:bg-[#151620]"/>
          <img className="tw:block tw:aspect-[16/10] tw:w-full tw:rounded-lg tw:object-cover tw:object-top" src="site/screenshots/app-desktop.webp" width="1440" height="900" fetchPriority="high" alt="Sela Books desktop bookshelf"/>
          <div className="device-base tw:absolute tw:-bottom-1 tw:left-[18%] tw:right-[18%] tw:h-1.5 tw:rounded-b-full tw:bg-[#252633]"/>
        </div>
        <div className="device-phone tw:absolute tw:bottom-10 tw:right-1 tw:z-20 tw:w-[24%] tw:overflow-hidden tw:rounded-[1.4rem] tw:border-[5px] tw:border-[#252633] tw:bg-[#252633] tw:p-1 tw:shadow-xl tw:shadow-[#33344a]/25 tw:sm:bottom-12 tw:sm:right-3 tw:sm:w-[22%]">
          <div className="device-island tw:absolute tw:left-1/2 tw:top-1.5 tw:z-10 tw:h-2 tw:w-10 tw:-translate-x-1/2 tw:rounded-full tw:bg-[#252633]"/>
          <img className="tw:block tw:aspect-[393/852] tw:w-full tw:rounded-[1rem] tw:object-cover tw:object-top" src="site/screenshots/app-mobile.webp" width="393" height="852" loading="eager" alt="Sela Books mobile app"/>
        </div>
        <figcaption className="tw:absolute tw:bottom-3 tw:left-5 tw:text-xs tw:font-medium tw:text-sela-muted tw:sm:left-7" data-en={"Your library. Your space."} data-id={"Perpustakaanmu. Ruangmu."}>Your library. Your space.</figcaption>
      </figure>
    </section>
  );
}
function SampleGallery() {
  return (
    <section className={"sample-gallery tw:my-6 tw:border-t tw:border-sela-line tw:py-7 tw:sm:py-9"} aria-labelledby={"samples-title"}>
      <div className={"section-heading tw:flex tw:flex-col tw:items-start tw:gap-3 tw:md:flex-row tw:md:items-end tw:md:justify-between"}>
        <div>
          <p
            className={"eyebrow tw:mb-2 tw:text-[10px] tw:font-bold tw:tracking-[.2em] tw:text-sela-accent"}
            data-en={"THE READING DESK"}
            data-id={"MEJA BACA"}
          >
            {"THE READING DESK"}
          </p>
          <h2
            className={"tw:mb-0 tw:text-2xl tw:font-semibold tw:tracking-[-.04em] tw:text-sela-ink tw:sm:text-3xl"}
            id={"samples-title"}
            data-en={"Open a book. Try your own."}
            data-id={"Buka buku. Coba berkasmu."}
          >
            {"Open a book. Try your own."}
          </h2>
        </div>
        <span className="tw:text-sm tw:text-sela-muted"
          data-en={"Everything stays in your browser."}
          data-id={"Berkas tetap di browsermu."}
        >
          {"Everything stays in your browser."}
        </span>
      </div>
      <div className={"book-trial-grid tw:mx-auto tw:mt-6 tw:grid tw:min-w-0 tw:grid-cols-1 tw:items-start tw:gap-x-4 tw:gap-y-5 tw:sm:grid-cols-2 tw:sm:gap-x-6 tw:md:max-w-[900px] tw:md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] tw:md:items-center tw:md:gap-10"}>
        <div className={"trial-entry tw:min-w-0"}>
          <Button
            variant={"ghost"}
            className={"trial-book tw:group tw:h-auto tw:min-h-0 tw:w-full tw:min-w-0 tw:justify-start tw:whitespace-normal tw:flex-col tw:items-start tw:gap-2 tw:rounded-none tw:border-transparent tw:bg-transparent tw:p-0 tw:text-left tw:text-sela-ink tw:shadow-none tw:transition-transform tw:hover:-translate-y-1 tw:hover:bg-transparent"}
            data-story-open={""}
            aria-label={"Read Yang Tidak Ikut Pulang"}
          >
            <span className={"trial-cover tw:relative tw:block tw:aspect-[2/3] tw:w-full tw:max-w-[180px] tw:overflow-hidden tw:rounded-2xl tw:bg-sela-surface tw:shadow-lg tw:shadow-slate-900/10"}>
              <img
                className="tw:absolute tw:inset-0 tw:size-full tw:object-cover tw:transition-transform tw:duration-500 tw:group-hover:scale-105"
                src={"example/story/cover.jpg"}
                width={"400"}
                height={"600"}
                loading={"lazy"}
                alt={"Yang Tidak Ikut Pulang sample cover"}
              />
            </span>
            <strong className="tw:mt-1 tw:text-base tw:font-semibold tw:leading-snug tw:tracking-tight">{"Yang Tidak Ikut Pulang"}</strong>
            <span className="tw:text-xs tw:text-sela-muted"
              data-en={"Original sample · Read"}
              data-id={"Bacaan contoh · Buka"}
            >
              {"Original sample · Read"}
            </span>
          </Button>
          <small className={"trial-author tw:mt-1 tw:text-xs tw:text-sela-muted"}>{"Bobby Fajar Christian · 2026"}</small>
          <details className={"trial-info tw:mt-3 tw:text-xs tw:text-sela-muted"}>
            <summary className="tw:cursor-pointer tw:font-semibold tw:text-sela-accent" data-en={"Book information"} data-id={"Informasi buku"}>
              {"Book information"}
            </summary>
            <p className="tw:leading-6"
              data-en={
                "A return to an old house, a recording that should not exist, and the people left between memory and distance."
              }
              data-id={
                "Kembali ke rumah lama, rekaman yang seharusnya tidak ada, dan orang-orang di antara ingatan dan jarak."
              }
            >
              {
                "A return to an old house, a recording that should not exist, and the people left between memory and distance."
              }
            </p>
            <small className="tw:text-[10px] tw:leading-5">
              {"50 pages · Indonesian · Sela sample edition · CC BY 4.0"}
            </small>
          </details>
        </div>
        <label className={"trial-upload tw:relative tw:flex tw:min-h-56 tw:cursor-pointer tw:flex-col tw:items-center tw:justify-center tw:gap-2 tw:rounded-2xl tw:border-2 tw:border-dashed tw:border-sela-sky/45 tw:bg-sela-sky/5 tw:px-4 tw:py-6 tw:text-center tw:transition-colors tw:hover:border-sela-sky tw:hover:bg-sela-sky/10 tw:focus-within:ring-4 tw:focus-within:ring-sela-sky/15 tw:data-[dragging=true]:border-sela-accent tw:data-[dragging=true]:bg-sela-violet/10 tw:sm:min-h-64"} id={"drop-zone"} htmlFor={"pdf-file"}>
          <input
            id={"pdf-file"}
            className={"file-input tw:sr-only"}
            type={"file"}
            accept={
              "application/pdf,application/epub+zip,.pdf,.epub,.cbz,.djvu,.djv,.txt,.md,.html,.htm,.fb2,.docx,.odt"
            }
          />
          <i className="ph-fill ph-upload-simple tw:mb-2 tw:text-4xl tw:text-sela-sky" aria-hidden={true}></i>
          <strong className="tw:text-sm tw:font-semibold tw:text-sela-ink" data-en={"Try your document"} data-id={"Coba dokumenmu"}>
            {"Try your document"}
          </strong>
          <span className="tw:rounded-full tw:bg-sela-surface tw:px-2.5 tw:py-1 tw:text-[10px] tw:font-medium tw:text-sela-muted">{"PDF · EPUB · CBZ · TXT"}</span>
          <small className="tw:mt-1 tw:text-xs tw:text-sela-muted"
            data-en={"Choose a file. No upload."}
            data-id={"Pilih berkas. Tanpa unggahan."}
          >
            {"Choose a file. No upload."}
          </small>
        </label>
        <a
          className={"original-document tw:col-span-full tw:inline-flex tw:min-h-10 tw:w-fit tw:items-center tw:gap-2 tw:text-sm tw:font-semibold tw:text-sela-accent tw:underline-offset-4 hover:tw:underline"}
          href={"example/yang-tidak-ikut-pulang.pdf"}
          data-en={"Original PDF ↗"}
          data-id={"PDF asli ↗"}
        >
          {"Original PDF ↗"}
        </a>
        <div className={"file-selection tw:hidden tw:col-span-full tw:flex-wrap tw:items-center tw:justify-between tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface tw:px-4 tw:py-3 tw:text-sm"} hidden={true}>
          <span className="tw:min-w-0 tw:break-all tw:text-sela-ink" id={"file-name"}></span>
          <Button variant={"ghost"} className="tw:h-auto tw:min-h-10 tw:shrink-0 tw:rounded-xl tw:bg-sela-canvas tw:px-3 tw:font-semibold tw:text-sela-muted tw:hover:text-sela-accent" type={"button"} id={"clear-file"} data-i18n={"clear"}>
            {"Clear"}
          </Button>
        </div>
      </div>
    </section>
  );
}
function ReadingCorner() {
  return (
    <section className="reading-corner tw:relative tw:isolate tw:my-8 tw:min-h-[420px] tw:overflow-hidden tw:rounded-[26px] tw:bg-sela-canvas tw:shadow-sm tw:sm:my-10 tw:sm:min-h-[500px] tw:lg:min-h-[560px] tw:max-sm:grid tw:max-sm:grid-rows-[210px_auto] tw:max-sm:min-h-0" aria-labelledby="reading-corner-title">
      <img className="tw:absolute tw:inset-0 tw:h-full tw:w-full tw:object-cover tw:object-[66%_center] tw:sm:object-center tw:max-sm:relative tw:max-sm:inset-auto tw:max-sm:h-[210px] tw:max-sm:object-[68%_center]" src="site/illustrations/reading-corner-jakarta.webp" width="2172" height="724" loading="lazy" decoding="async" alt="An Indonesian child reading with two friendly magical companions above a Jakarta rooftop garden" />
      <div className="tw:absolute tw:inset-0 tw:bg-gradient-to-t tw:from-sela-canvas/95 tw:via-sela-canvas/42 tw:to-transparent tw:sm:bg-gradient-to-r tw:sm:from-sela-canvas/95 tw:sm:via-sela-canvas/65 tw:sm:to-sela-canvas/5 tw:max-sm:hidden" aria-hidden="true"></div>
      <div className="tw:relative tw:mx-auto tw:flex tw:min-h-[420px] tw:max-w-[1440px] tw:flex-col tw:items-start tw:justify-end tw:px-5 tw:pb-8 tw:pt-16 tw:sm:min-h-[500px] tw:sm:px-9 tw:sm:pb-12 tw:lg:min-h-[560px] tw:lg:px-12 tw:max-sm:min-h-0 tw:max-sm:justify-start tw:max-sm:px-5 tw:max-sm:py-5">
        <p className="tw:mb-3 tw:text-[10px] tw:font-bold tw:tracking-[.2em] tw:text-sela-pink" data-en="A LITTLE PAUSE" data-id="JEDA SEJENAK">A LITTLE PAUSE</p>
        <h2 id="reading-corner-title" className="tw:mb-3 tw:max-w-[14ch] tw:text-3xl tw:font-semibold tw:leading-[1.02] tw:tracking-[-.055em] tw:text-sela-ink tw:drop-shadow-sm tw:sm:text-4xl tw:lg:text-5xl" data-en="Make a little room for a story." data-id="Sisakan sedikit ruang untuk sebuah cerita.">Make a little room for a story.</h2>
        <p className="tw:mb-0 tw:max-w-[34rem] tw:text-sm tw:leading-7 tw:text-sela-ink/80 tw:sm:text-base" data-en="A calm shelf, a favorite page, and a small companion nearby. Sela keeps the reading simple so the moment can feel like yours." data-id="Rak yang tenang, halaman favorit, dan teman kecil di dekatmu. Sela menjaga kegiatan membaca tetap sederhana agar momennya terasa milikmu.">A calm shelf, a favorite page, and a small companion nearby. Sela keeps the reading simple so the moment can feel like yours.</p>
        <div className="tw:mt-5">
          <a className="tw:inline-flex tw:min-h-11 tw:w-fit tw:items-center tw:gap-2 tw:rounded-full tw:bg-sela-accent tw:px-5 tw:text-sm tw:font-semibold tw:text-white tw:shadow-lg tw:shadow-sela-accent/20 tw:transition tw:hover:-translate-y-0.5 tw:hover:shadow-xl" href="app/">
            <i className="ph-fill ph-books tw:text-lg" aria-hidden={true}></i>
            <span data-en="Visit your shelf" data-id="Lihat rakmu">Visit your shelf</span>
          </a>
        </div>
      </div>
    </section>
  );
}
function Demo() {
  return (
    <section className={"demo tw:border-t tw:border-sela-line tw:py-9 tw:sm:py-12"} aria-labelledby={"demo-heading"}>
      <div className={"section-heading tw:flex tw:flex-col tw:items-start tw:gap-3 tw:md:flex-row tw:md:items-end tw:md:justify-between"}>
        <div>
          <p className={"eyebrow tw:mb-2 tw:text-[10px] tw:font-bold tw:tracking-[.2em] tw:text-sela-accent"} data-i18n={"demoEyebrow"}>
            {"MAKE YOURSELF COMFORTABLE"}
          </p>
          <h2 className="tw:mb-0 tw:text-2xl tw:font-semibold tw:tracking-[-.04em] tw:text-sela-ink tw:sm:text-3xl" id={"demo-heading"} data-i18n={"demoHeading"}>
            {"Four ways to read."}
          </h2>
        </div>
        <span className={"version-note tw:text-sm tw:text-sela-muted"} data-i18n={"lazy"}>
          {"PDF engine loads only when you read."}
        </span>
      </div>
      {"\n"}
      <div className={"cards tw:grid tw:grid-cols-1 tw:gap-3 tw:min-[451px]:grid-cols-2 tw:lg:grid-cols-4 tw:lg:gap-4"}>
        {"\n"}
        <Button variant={"outline"} className={"mode-card tw:h-auto tw:min-h-[250px] tw:w-full tw:justify-start tw:whitespace-normal tw:flex-col tw:items-start tw:rounded-2xl tw:border-sela-line tw:bg-sela-surface tw:p-4 tw:text-left tw:text-sela-ink tw:shadow-sm tw:transition-all tw:hover:-translate-y-1 tw:hover:bg-sela-surface tw:hover:shadow-lg tw:focus-visible:ring-2 tw:focus-visible:ring-sela-accent tw:sm:p-5"} data-mode={"book"}>
          <span className={"card-art tw:mb-4 tw:grid tw:size-14 tw:place-items-center tw:rounded-2xl tw:bg-sela-violet/10 tw:text-sela-violet"}>
            <i className="ph-fill ph-book-open-text tw:text-3xl" aria-hidden={true}></i>
          </span>
          <span className={"card-number tw:text-[10px] tw:font-bold tw:tracking-[.16em] tw:text-sela-violet"}>{"01 / BOOK"}</span>
          <strong className="tw:mb-2 tw:mt-2 tw:text-lg tw:font-semibold tw:tracking-tight" data-i18n={"bookTitle"}>{"Turn the page."}</strong>
          <span className="tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"bookText"}>
            {"Paper folds, gentle shadows and a familiar two-page spread."}
          </span>
          <b className="tw:mt-auto tw:pt-4 tw:text-xs tw:font-semibold tw:text-sela-accent" data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
        <Button variant={"outline"} className={"mode-card tw:h-auto tw:min-h-[250px] tw:w-full tw:justify-start tw:whitespace-normal tw:flex-col tw:items-start tw:rounded-2xl tw:border-sela-line tw:bg-sela-surface tw:p-4 tw:text-left tw:text-sela-ink tw:shadow-sm tw:transition-all tw:hover:-translate-y-1 tw:hover:bg-sela-surface tw:hover:shadow-lg tw:focus-visible:ring-2 tw:focus-visible:ring-sela-accent tw:sm:p-5"} data-mode={"webtoon"}>
          <span className={"card-art scroll-art tw:mb-4 tw:grid tw:size-14 tw:place-items-center tw:rounded-2xl tw:bg-sela-sky/15 tw:text-sela-sky"}>
            <i className="ph-fill ph-scroll tw:text-3xl" aria-hidden={true}></i>
          </span>
          <span className={"card-number tw:text-[10px] tw:font-bold tw:tracking-[.16em] tw:text-sela-sky"}>{"02 / WEBTOON"}</span>
          <strong className="tw:mb-2 tw:mt-2 tw:text-lg tw:font-semibold tw:tracking-tight" data-i18n={"webtoonTitle"}>{"Follow the story."}</strong>
          <span className="tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"webtoonText"}>
            {"Vertical reading with nearby pages rendered as you scroll."}
          </span>
          <b className="tw:mt-auto tw:pt-4 tw:text-xs tw:font-semibold tw:text-sela-accent" data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
        <Button variant={"outline"} className={"mode-card tw:h-auto tw:min-h-[250px] tw:w-full tw:justify-start tw:whitespace-normal tw:flex-col tw:items-start tw:rounded-2xl tw:border-sela-line tw:bg-sela-surface tw:p-4 tw:text-left tw:text-sela-ink tw:shadow-sm tw:transition-all tw:hover:-translate-y-1 tw:hover:bg-sela-surface tw:hover:shadow-lg tw:focus-visible:ring-2 tw:focus-visible:ring-sela-accent tw:sm:p-5"} data-mode={"single"}>
          <span className={"card-art single-art tw:mb-4 tw:grid tw:size-14 tw:place-items-center tw:rounded-2xl tw:bg-sela-pink/15 tw:text-sela-pink"}>
            <i className="ph-fill ph-file-text tw:text-3xl" aria-hidden={true}></i>
          </span>
          <span className={"card-number tw:text-[10px] tw:font-bold tw:tracking-[.16em] tw:text-sela-pink"}>{"03 / SINGLE"}</span>
          <strong className="tw:mb-2 tw:mt-2 tw:text-lg tw:font-semibold tw:tracking-tight" data-i18n={"singleTitle"}>{"Just this page."}</strong>
          <span className="tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"singleText"}>
            {"One page, less distraction. A natural fit for small screens."}
          </span>
          <b className="tw:mt-auto tw:pt-4 tw:text-xs tw:font-semibold tw:text-sela-accent" data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
        <Button variant={"outline"} className={"mode-card tw:h-auto tw:min-h-[250px] tw:w-full tw:justify-start tw:whitespace-normal tw:flex-col tw:items-start tw:rounded-2xl tw:border-sela-line tw:bg-sela-surface tw:p-4 tw:text-left tw:text-sela-ink tw:shadow-sm tw:transition-all tw:hover:-translate-y-1 tw:hover:bg-sela-surface tw:hover:shadow-lg tw:focus-visible:ring-2 tw:focus-visible:ring-sela-accent tw:sm:p-5"} data-mode={"manga"}>
          <span className={"card-art manga-art tw:mb-4 tw:grid tw:size-14 tw:place-items-center tw:rounded-2xl tw:bg-sela-lemon/20 tw:text-[#aa7c19]"}>
            <i className="ph-fill ph-book-open tw:text-3xl" aria-hidden={true}></i>
          </span>
          <span className={"card-number tw:text-[10px] tw:font-bold tw:tracking-[.16em] tw:text-[#aa7c19]"}>{"04 / MANGA · RTL"}</span>
          <strong className="tw:mb-2 tw:mt-2 tw:text-lg tw:font-semibold tw:tracking-tight" data-i18n={"mangaTitle"}>{"Read from the right."}</strong>
          <span className="tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"mangaText"}>
            {
              "Right-to-left page turns and arrow keys. Keep original page order."
            }
          </span>
          <b className="tw:mt-auto tw:pt-4 tw:text-xs tw:font-semibold tw:text-sela-accent" data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
      </div>
      {"\n"}
      <noscript>
        <p>
          {"JavaScript is disabled. "}
          <a className="tw:font-semibold tw:text-sela-accent" href={"example/yang-tidak-ikut-pulang.pdf"}>
            {"Read or download Yang Tidak Ikut Pulang as a PDF."}
          </a>
        </p>
      </noscript>
    </section>
  );
}
function Products() {
  return (
    <section
      id={"products"}
      className={"installation-guide tw:my-10 tw:mx-auto tw:grid tw:w-full tw:max-w-6xl tw:grid-cols-1 tw:items-stretch tw:gap-4 tw:lg:grid-cols-2 tw:lg:gap-6"}
      aria-label={"Sela Books and Viewer"}
    >
      {"\n"}
      <article className="tw:flex tw:h-full tw:min-w-0 tw:flex-col tw:scroll-mt-24 tw:rounded-[1.75rem] tw:border tw:border-sela-line/80 tw:bg-sela-surface/90 tw:p-5 tw:shadow-sm tw:backdrop-blur-xl tw:sm:p-7" id={"install-mobile"}>
        <div className={"product-heading tw:flex tw:items-center tw:gap-3"}>
          <span className={"route-icon tw:grid tw:size-12 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-violet/10 tw:text-sela-violet"}>
            <i className="ph-fill ph-books tw:text-2xl" aria-hidden={true}></i>
          </span>
          <div>
            <small className="tw:text-[10px] tw:font-bold tw:tracking-[.17em] tw:text-sela-muted" data-en={"YOUR LIBRARY"} data-id={"PERPUSTAKAANMU"}>{"YOUR LIBRARY"}</small>
            <h2 className="tw:mb-0 tw:mt-1 tw:text-xl tw:font-semibold tw:tracking-tight">{"Sela Books"}</h2>
          </div>
        </div>
        <p className="tw:my-4 tw:max-w-[44rem] tw:text-sm tw:leading-7 tw:text-sela-muted">
          <span
            data-en={
              "A private shelf. An uninterrupted read. Books, progress and collections stay on your device."
            }
            data-id={
              "Rak pribadi. Membaca tanpa gangguan. Buku, progres dan koleksi tersimpan di perangkatmu."
            }
          >
            {
              "A private shelf. An uninterrupted read. Books, progress and collections stay on your device."
            }
          </span>
        </p>
        <div className={"product-chips tw:flex tw:flex-wrap tw:gap-2"}>
          <span className="tw:rounded-full tw:bg-sela-canvas tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-medium tw:text-sela-muted">{"Desktop"}</span>
          <span className="tw:rounded-full tw:bg-sela-canvas tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-medium tw:text-sela-muted">{"Tablet"}</span>
          <span className="tw:rounded-full tw:bg-sela-canvas tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-medium tw:text-sela-muted">{"Mobile"}</span>
        </div>
        <div className={"product-actions tw:mt-5 tw:flex tw:flex-wrap tw:items-center tw:gap-x-4 tw:gap-y-2"}>
          <a id={"get-bookshelf"} className={"install-button tw:inline-flex tw:min-h-11 tw:items-center tw:justify-center tw:gap-2 tw:rounded-xl tw:bg-sela-accent tw:px-4 tw:text-sm tw:font-semibold tw:text-white tw:transition-colors tw:hover:bg-sela-violet"} href={"app/"}>
            <i className="ph-fill ph-arrow-square-out tw:text-lg" aria-hidden={true}></i>
            <span data-en={"Open web app"} data-id={"Buka web app"}>
              {"Open web app"}
            </span>
          </a>
          <a className="tw:py-2 tw:text-sm tw:font-semibold tw:text-sela-accent tw:underline-offset-4 hover:tw:underline" href={"#install-mobile-steps"}>
            <span data-en={"Install guide ↗"} data-id={"Cara pasang ↗"}>
              {"Install guide ↗"}
            </span>
          </a>
        </div>
        <details className={"product-help tw:mt-5 tw:border-t tw:border-sela-line tw:pt-4"} open={true}>
          <summary className="tw:cursor-pointer tw:list-none tw:font-semibold tw:text-sela-ink tw:[&::-webkit-details-marker]:hidden">
            <span
              data-en={"Install on your device"}
              data-id={"Pasang di perangkatmu"}
            >
              {"Install on your device"}
            </span>
          </summary>
          <ol id={"install-mobile-steps"} className={"install-steps tw:mt-4 tw:grid tw:gap-2.5 tw:pl-0 tw:text-xs tw:leading-6 tw:text-sela-muted"}>
            <li className="tw:flex tw:items-start tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:p-3"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-violet/10 tw:text-[11px] tw:font-bold tw:text-sela-violet">1</span><span data-en={"Open Sela Books, then tap Install Sela when the app offers it."} data-id={"Buka Sela Books, lalu ketuk Pasang Sela saat tombolnya tersedia."}>{"Open Sela Books, then tap Install Sela when the app offers it."}</span></li>
            <li className="tw:flex tw:items-start tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:p-3"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-sky/15 tw:text-[11px] tw:font-bold tw:text-sela-sky">2</span><span data-en={"Chrome, Edge, Opera and Samsung Internet show their own install prompt when this browser supports it."} data-id={"Chrome, Edge, Opera, dan Samsung Internet menampilkan prompt pemasangan bawaan jika browser mendukungnya."}>{"Chrome, Edge, Opera and Samsung Internet show their own install prompt when this browser supports it."}</span></li>
            <li className="tw:flex tw:items-start tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:p-3"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-pink/15 tw:text-[11px] tw:font-bold tw:text-sela-pink">3</span><span data-en={"On iPhone or iPad, open the Share menu in Safari and choose Add to Home Screen. On macOS Safari, choose File → Add to Dock."} data-id={"Di iPhone atau iPad, buka menu Bagikan di Safari lalu pilih Tambahkan ke Layar Utama. Di Safari macOS, pilih File → Tambahkan ke Dock."}>{"On iPhone or iPad, open the Share menu in Safari and choose Add to Home Screen. On macOS Safari, choose File → Add to Dock."}</span></li>
            <li className="tw:flex tw:items-start tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:p-3"><span className="tw:grid tw:size-7 tw:shrink-0 tw:place-items-center tw:rounded-full tw:bg-sela-mint/20 tw:text-[11px] tw:font-bold tw:text-sela-ink">4</span><span data-en={"Firefox offers a home-screen shortcut on Android. On desktop, use its Web Apps option where available or bookmark Sela."} data-id={"Firefox menyediakan pintasan layar utama di Android. Di desktop, gunakan Web Apps bila tersedia atau bookmark Sela."}>{"Firefox offers a home-screen shortcut on Android. On desktop, use its Web Apps option where available or bookmark Sela."}</span></li>
          </ol>
          <aside className="tw:mt-3 tw:flex tw:items-start tw:gap-3 tw:rounded-2xl tw:border tw:border-sela-sky/25 tw:bg-sela-sky/10 tw:p-3" role="note"><i className="ph-fill ph-info tw:mt-0.5 tw:shrink-0 tw:text-lg tw:text-sela-sky" aria-hidden={true}></i><p className="install-footnote tw:m-0 tw:text-[11px] tw:leading-5 tw:text-sela-ink/80" data-en={"Sela checks whether this browser has already installed the app and hides the install action when it confirms. Options vary by browser and operating system."} data-id={"Sela memeriksa apakah aplikasi sudah terpasang dan menyembunyikan tombol setelah browser mengonfirmasinya. Pilihan berbeda menurut browser dan sistem operasi."}>{"Sela checks whether this browser has already installed the app and hides the install action when it confirms. Options vary by browser and operating system."}</p></aside>
        </details>
      </article>
      <article className="tw:flex tw:h-full tw:min-w-0 tw:flex-col tw:scroll-mt-24 tw:rounded-[1.75rem] tw:border tw:border-sela-line/80 tw:bg-sela-surface/90 tw:p-5 tw:shadow-sm tw:backdrop-blur-xl tw:sm:p-7">
        <div className={"product-heading tw:flex tw:items-center tw:gap-3"}>
          <span className={"route-icon tw:grid tw:size-12 tw:shrink-0 tw:place-items-center tw:rounded-2xl tw:bg-sela-sky/15 tw:text-sela-sky"}>
            <i className="ph-fill ph-code tw:text-2xl" aria-hidden={true}></i>
          </span>
          <div>
            <small className="tw:text-[10px] tw:font-bold tw:tracking-[.17em] tw:text-sela-muted" data-en={"FOR YOUR WEBSITE"} data-id={"UNTUK WEBSITE-MU"}>{"FOR YOUR WEBSITE"}</small>
            <h2 className="tw:mb-0 tw:mt-1 tw:text-xl tw:font-semibold tw:tracking-tight">{"Sela Viewer"}</h2>
          </div>
        </div>
        <p className="tw:my-4 tw:max-w-[44rem] tw:text-sm tw:leading-7 tw:text-sela-muted">
          <span
            data-en={
              "The same reading tools, on your website. One clean interface on every screen. Embed inline or open fullscreen."
            }
            data-id={
              "Alat baca yang sama, di websitemu. Satu tampilan ringkas untuk semua layar. Embed di halaman atau buka layar penuh."
            }
          >
            {
              "The same reading tools, on your website. One clean interface on every screen. Embed inline or open fullscreen."
            }
          </span>
        </p>
        <div className={"product-chips tw:flex tw:flex-wrap tw:gap-2"}>
          <span className="tw:rounded-full tw:bg-sela-canvas tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-medium tw:text-sela-muted">{"CDN"}</span>
          <span className="tw:rounded-full tw:bg-sela-canvas tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-medium tw:text-sela-muted">{"ESM"}</span>
          <span className="tw:rounded-full tw:bg-sela-canvas tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-medium tw:text-sela-muted">{"TypeScript"}</span>
        </div>
        <div className={"product-actions tw:mt-5 tw:flex tw:flex-wrap tw:items-center tw:gap-x-4 tw:gap-y-2"}>
          <a className={"install-button secondary tw:inline-flex tw:min-h-11 tw:items-center tw:justify-center tw:gap-2 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-canvas tw:px-4 tw:text-sm tw:font-semibold tw:text-sela-ink tw:transition-colors tw:hover:border-sela-accent tw:hover:text-sela-accent"} href={"#install-viewer"}>
            <i className="ph-fill ph-code tw:text-lg" aria-hidden={true}></i>
            <span data-en={"Use CDN"} data-id={"Gunakan CDN"}>
              {"Use CDN"}
            </span>
          </a>
          <Button
            variant={"ghost"}
            type={"button"}
            className={"product-demo tw:h-auto tw:min-h-11 tw:inline-flex tw:items-center tw:gap-2 tw:rounded-xl tw:px-1 tw:text-sm tw:font-semibold tw:text-sela-accent"}
            data-story-open={""}
            data-app-demo={""}
          >
            <i className="ph-fill ph-play-circle tw:text-lg" aria-hidden={true}></i>
            <span data-en={"Try app controls"} data-id={"Coba kontrol app"}>
              {"Try app controls"}
            </span>
          </Button>
          <a className="tw:py-2 tw:text-sm tw:font-semibold tw:text-sela-accent tw:underline-offset-4 hover:tw:underline" href={"#install-viewer"}>
            <span
              data-en={"Integration guide ↗"}
              data-id={"Panduan integrasi ↗"}
            >
              {"Integration guide ↗"}
            </span>
          </a>
        </div>
        <div className={"product-help tw:mt-auto tw:border-t tw:border-sela-line tw:pt-4"}>
          <h3 className="tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink" data-en="Works with your stack" data-id="Cocok dengan stack kamu">{"Works with your stack"}</h3>
          <p className="tw:mb-0 tw:mt-3 tw:text-xs tw:leading-6 tw:text-sela-muted" data-en={"Use the same Viewer from plain HTML, CI3, Laravel, React, Vue, Svelte, Astro and other hosts. Bootstrap and Tailwind are optional."} data-id={"Gunakan Viewer yang sama dari HTML, CI3, Laravel, React, Vue, Svelte, Astro, dan host lainnya. Bootstrap dan Tailwind bersifat opsional."}>{"Use the same Viewer from plain HTML, CI3, Laravel, React, Vue, Svelte, Astro and other hosts. Bootstrap and Tailwind are optional."}</p>
          <StackLogos />
        </div>
      </article>
    </section>
  );
}
function Install() {
  return (
    <aside className="tw:mx-4 tw:my-4 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3 tw:rounded-xl tw:border tw:border-sela-sky/25 tw:bg-sela-sky/10 tw:p-4 tw:sm:mx-7" role="note">
      <p className="tw:m-0 tw:min-w-0 tw:flex-1 tw:text-xs tw:leading-5 tw:text-sela-muted" data-en="Works with plain HTML, React, Vue, Laravel, CodeIgniter and other stacks. Your site needs a document URL that visitors can access." data-id="Bisa dipakai di HTML biasa, React, Vue, Laravel, CodeIgniter, dan stack lain. Situsmu perlu URL dokumen yang dapat diakses pengunjung.">Works with plain HTML, React, Vue, Laravel, CodeIgniter and other stacks. Your site needs a document URL that visitors can access.</p>
      <a className="tw:inline-flex tw:min-h-10 tw:shrink-0 tw:items-center tw:font-semibold tw:text-sela-accent tw:underline-offset-4 hover:tw:underline" href="https://github.com/bobbyfch/sela/blob/main/docs/install.md" target="_blank" rel="noopener noreferrer" data-i18n="docs">Installation and integration guide ↗</a>
    </aside>
  );
}
function Notes() {
  return (
    <section className={"notes tw:py-6 tw:sm:py-10"}>
      <div className={"tw:grid tw:grid-cols-1 tw:gap-5 tw:md:grid-cols-3 tw:md:gap-7"}>
        <article className="tw:border-t tw:border-sela-line tw:pt-4">
          <i className="ph-fill ph-sparkle tw:text-2xl tw:text-sela-violet" aria-hidden={true}></i>
          <h3 className="tw:mb-2 tw:mt-3 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink" data-i18n={"filtersTitle"}>{"A softer reading space"}</h3>
          <p className="tw:mb-0 tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"filtersText"}>
            {
              "Twelve page presets, a document brightness slider and dimmed controls. Separate tabs for contents, search, appearance, narration, notes and selectable text."
            }
          </p>
        </article>
        <article className="tw:border-t tw:border-sela-line tw:pt-4">
          <i className="ph-fill ph-device-mobile tw:text-2xl tw:text-sela-sky" aria-hidden={true}></i>
          <h3 className="tw:mb-2 tw:mt-3 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink" data-i18n={"compatTitle"}>{"A graceful way back"}</h3>
          <p className="tw:mb-0 tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"compatText"}>
            {
              "Modern browsers get the full viewer. Older browsers get the original PDF via the compatibility entry. Windows, macOS, Linux, Android and iOS follow browser capabilities."
            }
          </p>
        </article>
        <article className="tw:border-t tw:border-sela-line tw:pt-4">
          <i className="ph-fill ph-heart tw:text-2xl tw:text-sela-pink" aria-hidden={true}></i>
          <h3 className="tw:mb-2 tw:mt-3 tw:text-base tw:font-semibold tw:tracking-tight tw:text-sela-ink" data-i18n={"openTitle"}>{"Open source, clear origins"}</h3>
          <p className="tw:mb-0 tw:text-sm tw:leading-6 tw:text-sela-muted" data-i18n={"openText"}>
            {
              "MIT reader, PDFlipbook page engine and lazy Apache-2.0 PDF.js. No framework runtime. Keyboard controls, saved progress and bookmarks included."
            }
          </p>
        </article>
      </div>
    </section>
  );
}
function Nav() {
  return (
    <nav className="tw:order-3 tw:flex tw:items-center tw:gap-4 tw:text-xs tw:font-semibold tw:text-sela-ink" aria-label={"Project links"}>
      <a className="tw:underline-offset-4 hover:tw:text-sela-accent hover:tw:underline" href={"https://github.com/bobbyfch/sela"}>{"Sela on GitHub"}</a>
    </nav>
  );
}
