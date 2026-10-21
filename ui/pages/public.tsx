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
    <svg className="stack-logo-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

function StackLogos() {
  return (
    <ul className="stack-list" aria-label="Supported web stacks">
      {supportedStack.map(({ label, icon }) => (
        <li className="stack-item" key={label}>
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
      <meta name={"theme-color"} content={"#f1eee6"} />
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
      <link rel={"apple-touch-icon"} href={"site/apple-touch-icon.png"} />
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
    <header className={"nav public-nav"}>
      <a className={"brand public-brand"} href={"/"}>
        <img
          src={"logo.svg"}
          alt={"Sela Books symbol"}
          width={"36"}
          height={"36"}
          className={"public-mark"}
        />
        <span className={"public-brand-name"}>{"Sela Books"}</span>
        <span className={"public-version"}>{"{{SELA_LABEL}}"}</span>
      </a>
      <nav className="public-links" aria-label="Main navigation">
        <a href="#products"><span data-en="Choose your reader" data-id="Pilih reader">Choose your reader</span></a>
        <a href="#samples-title"><span data-en="Try a book" data-id="Coba buku">Try a book</span></a>
        <a href="#install-viewer"><span data-en="For developers" data-id="Untuk developer">For developers</span></a>
      </nav>
      <details className="public-mobile-menu">
        <summary data-en="Menu" data-id="Menu">Menu</summary>
        <nav aria-label="Main navigation">
          <a href="#products"><span data-en="Choose your reader" data-id="Pilih reader">Choose your reader</span></a>
          <a href="#samples-title"><span data-en="Try a book" data-id="Coba buku">Try a book</span></a>
          <a href="#install-viewer"><span data-en="For developers" data-id="Untuk developer">For developers</span></a>
        </nav>
      </details>
      <div className={"nav-actions public-nav-actions"}>
        <div className={"theme-switch public-theme-switch"} role={"group"} aria-label={"Appearance"}>
          <Button
            variant={"ghost"}
            size={"icon"}
            type={"button"}
            data-theme-choice={"light"}
            aria-label={"Light theme"}
            title={"Light"}
            aria-pressed={"false"}
            className={"public-theme-choice"}
          >
            <i className={"ph-fill ph-sun"} aria-hidden={true}></i>
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            type={"button"}
            data-theme-choice={"dark"}
            aria-label={"Dark theme"}
            title={"Dark"}
            aria-pressed={"false"}
            className={"public-theme-choice"}
          >
            <i className={"ph-fill ph-moon-stars"} aria-hidden={true}></i>
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            type={"button"}
            data-theme-choice={"auto"}
            aria-label={"System theme"}
            title={"System"}
            aria-pressed={"false"}
            className={"public-theme-choice"}
          >
            <i className={"ph-fill ph-desktop-tower"} aria-hidden={true}></i>
          </Button>
        </div>
        <NativeSelect id={"theme"} hidden={true} aria-label={"Appearance"}>
          <option value={"auto"}>{"System"}</option>
          <option value={"light"}>{"Light"}</option>
          <option value={"dark"}>{"Dark"}</option>
        </NativeSelect>
        <label className="language-picker">
        <img id={"language-flag"} className={"language-flag"} src={"site/flag-en.svg"} alt={""} aria-hidden={true} />
        <NativeSelect id={"language"} className={"public-language-select"} aria-label={"Language"}>
          <option value={"en-US"}>{"English"}</option>
          <option value={"id-ID"}>{"Bahasa Indonesia"}</option>
          <option value={"ja-JP"}>{"日本語"}</option>
        </NativeSelect>
        </label>
        <a
          className={"public-github"}
          href={"https://github.com/bobbyfch/sela"}
          aria-label={"Sela on GitHub"}
        >
          <i className={"ph-fill ph-github-logo"} aria-hidden={true}></i>
        </a>
        <a className="public-nav-cta" href="app/">
          <span data-en="Open library" data-id="Buka perpustakaan">Open library</span>
          <i className="ph-fill ph-arrow-up-right" aria-hidden="true"></i>
        </a>
      </div>
    </header>
  );
}
function PublicContent() {
  return (
    <main className="public-main" id="main">
      <Hero />
      <Products />
      <SampleGallery />
      <p className="product-status" id={"product-status"} role={"status"} aria-live={"polite"}></p>
      <section id={"install-viewer"} className={"developer-playground public-builder"} aria-labelledby="setup-heading">
        <header className="builder-heading">
          <div className="builder-heading-copy">
            <p className="eyebrow">{"A SIMPLE WORKFLOW · FOR YOUR SITE"}</p>
            <h2 id="setup-heading" data-en="Shape your reading experience" data-id="Atur pengalaman membacamu">{"Shape your reading experience"}</h2>
            <p data-en="Choose a file, set the way it opens, and copy a working setup." data-id="Pilih berkas, tentukan cara membukanya, lalu salin konfigurasi yang siap dipakai.">Choose a file, set the way it opens, and copy a working setup.</p>
          </div>
          <a className="builder-docs-link" href="https://github.com/bobbyfch/sela/blob/main/docs/install.md" target="_blank" rel="noopener noreferrer" data-i18n="docs">Installation and integration guide ↗</a>
        </header>
        <div className="builder-grid">
          <Demo />
        <form className={"playground"} id={"playground"}>
          <ol className="builder-steps" aria-label="Setup steps">
            <li><span>1</span><span data-en="Choose a sample or your own file." data-id="Pilih contoh atau file milikmu.">Choose a sample or your own file.</span></li>
            <li><span>2</span><span data-en="Pick how you want to read." data-id="Pilih cara membaca.">Pick how you want to read.</span></li>
            <li><span>3</span><span data-en="Open it. Copy the setup if you want it on your site." data-id="Buka. Salin konfigurasinya jika ingin dipakai di situsmu.">Open it. Copy the setup if you want it on your site.</span></li>
          </ol>
          <div className={"playground-heading"}>
            <div>
              <p className={"eyebrow"} data-i18n={"playEyebrow"}>
                {"MAKE IT YOURS"}
              </p>
              <h3  data-i18n={"playTitle"}>{"Live configuration."}</h3>
            </div>
            <Button
              variant={"default"}
              type={"submit"}
              className={"launch-reader"}
              data-i18n={"launch"}
            >
              {"Open reader ↗"}
            </Button>
          </div>
          <div className={"play-controls"}>
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
          <details className="advanced-settings">
            <summary><span data-en="More reading settings" data-id="Pengaturan baca lainnya">More reading settings</span><i className="ph-fill ph-caret-down" aria-hidden="true"></i></summary>
            <div className="advanced-settings-grid">
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
          <div className={"play-toggles"}>
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
          <p className={"play-note"} data-i18n={"playNote"}>
            {
              "Ctrl + wheel or trackpad pinch zooms; normal scrolling stays natural. Press ? inside the reader for shortcuts. EPUB uses chapter-based text reading."
            }
          </p>
          <div className="config-heading"><h4 data-en="Your website setup" data-id="Konfigurasi untuk situsmu">Your website setup</h4><div className="config-actions"><label className="cdn-version-control"><span className="visually-hidden" data-i18n="cdnLabel">CDN version</span><select id="cdn-version"><option value="pinned" data-i18n="cdnPinned">{"Pinned release · {{SELA_VERSION}}"}</option><option value="latest" data-i18n="cdnLatest">Latest · no version</option></select></label><Button type="button" variant="outline" id="copy-config" className="copy-config-button" data-en="Copy setup" data-id="Salin konfigurasi">Copy setup</Button></div></div>
          <code className="config-code" id={"config-code"} aria-label="Sela configuration code"></code>
          <p className="policy-note" data-i18n="cdnNote">Pinned is recommended for production. The unversioned URL follows the latest GitHub files and may change without notice; <a href="https://www.jsdelivr.com/?docs=gh" target="_blank" rel="noopener noreferrer">jsDelivr advises against it in production.</a></p>
          <p className="own-file-note" data-en="For your own file, upload it to a URL your website can access and replace the sample URL in this snippet." data-id="Untuk file sendiri, unggah ke alamat yang bisa diakses situsmu lalu ganti URL contoh di potongan kode ini.">For your own file, upload it to a URL your website can access and replace the sample URL in this snippet.</p>
          <p className={"format-note"} data-i18n={"formatNote"}>
            {
              "PDF, EPUB, comics and text have optional reading tools: contents, search, narration and notes. FB2 is text-only; DjVu uses an external GPL-2.0 decoder."
            }
          </p>
          <p id={"status"} role={"status"} aria-live={"polite"}></p>
          <div
            id={"embedded-reader"}
            className={"embedded-reader"}
            hidden={true}
          ></div>
        </form>
        </div>
        <Install />
      </section>
    </main>
  );
}
function PublicFooter() {
  return (
    <footer className="cozy-footer">
      <p className="footer-invitation" data-en="A quieter place for the books you keep." data-id="Ruang tenang untuk buku-buku yang kamu simpan.">A quieter place for the books you keep.</p>
      <small  data-i18n={"regionNote"}>
        {
          "First-visit language uses country.is IP country lookup; saved choice wins. No document is sent. Add ?geo=off to disable."
        }
      </small>
      <span >
        {"Sela · MIT · "}
        <a href={"https://bobbyfch.github.io/"}>{"Bobby Fajar Christian"}</a>
      </span>
      <Nav />
      <a

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
        <div className="public-site">
          <a className="public-skip-link" href="#main" data-en="Skip to content" data-id="Lewati ke konten">Skip to content</a>
          <PublicNavigation />
          <PublicContent />
      <details className="reader-debug" hidden><summary>Reader diagnostics</summary><pre id="reader-debug" aria-label="Reader debug output">Open a document to inspect its lifecycle. Document text, URLs, headers and error messages are excluded.</pre></details>
          <PublicFooter />
        </div>
          <CompatibilityEntry />
          <DemoEntry />
          <MotionEntry />
          <PlatformEntry />
          <ProductsEntry />
          <LanguageEntry />
        </>;
}


function Hero() {
  return (
    <section className={"hero"}>
      <div className={"hero-copy"}>
        <p className={"eyebrow"} data-en="A LIBRARY THAT FEELS LIKE YOURS" data-id="PERPUSTAKAAN YANG TERASA MILIKMU">
          {"A LIBRARY THAT FEELS LIKE YOURS"}
        </p>
        <h1 data-en="A little more room to read." data-id="Lebih banyak ruang untuk membaca.">
          {"A little more room to read."}
        </h1>
        <p className={"intro"} data-en="A private shelf for books, comics and documents. Read at your pace, keep your place, and return to your library wherever you are." data-id="Rak pribadi untuk buku, komik, dan dokumen. Baca dengan ritmemu, simpan halaman terakhir, lalu kembali ke perpustakaanmu kapan saja.">
          {"A private shelf for books, comics and documents. Read at your pace, keep your place, and return to your library wherever you are."}
        </p>
        <ul className={"pills"} aria-label="Reader highlights">
          <li><i className="ph-fill ph-book-open-text" aria-hidden={true}></i><span>PDF · EPUB · Comics</span></li>
          <li>
            <i className="ph-fill ph-hard-drives" aria-hidden={true}></i>
            <span data-en={"Local-first"} data-id={"Berkas lokal"}>Local-first</span>
          </li>
          <li>
            <i className="ph-fill ph-user-minus" aria-hidden={true}></i>
            <span data-en={"No account"} data-id={"Tanpa akun"}>No account</span>
          </li>
        </ul>
        <div className={"install-actions"}>
          <a className={"install-button"} href={"app/"}>
            <i className="ph-fill ph-books" aria-hidden={true}></i>
            <span data-en={"Open your library"} data-id={"Buka perpustakaan"}>
              {"Open your library"}
            </span>
          </a>
          <a className={"install-button secondary"} href={"#install-viewer"}>
            <i className="ph-fill ph-code" aria-hidden={true}></i>
            <span data-en={"Build for your website"} data-id={"Pasang di website"}>
              {"Build for your website"}
            </span>
          </a>
        </div>
        <div className="hero-quick-links">
          <a className={"hero-link"} href={"#samples-title"} data-en={"Read a sample ↓"} data-id={"Baca contoh ↓"}>Read a sample ↓</a>
          <a className={"hero-link"} href={"#install-mobile"} data-en={"Install on a device →"} data-id={"Pasang di perangkat →"}>Install on a device →</a>
        </div>
      </div>
      <figure className="paper-still-life" aria-label="Open book on linen">
        <img src="site/art/selabooks-paper-still-life.webp" width="1536" height="1024" fetchPriority="high" alt="An open book on textured linen in soft window light" />
        <figcaption><span data-en="A little quiet, kept close." data-id="Jeda yang tenang, selalu dekat.">A little quiet, kept close.</span><i className="ph-fill ph-arrow-down-right" aria-hidden="true"></i></figcaption>
      </figure>
    </section>
  );
}
function SampleGallery() {
  return (
    <section className={"sample-gallery public-section"} aria-labelledby={"samples-title"}>
      <div className={"section-heading"}>
        <div>
          <p
            className={"eyebrow"}
            data-en={"THE READING DESK"}
            data-id={"MEJA BACA"}
          >
            {"THE READING DESK"}
          </p>
          <h2

            id={"samples-title"}
            data-en={"Open a book. Try your own."}
            data-id={"Buka buku. Coba berkasmu."}
          >
            {"Open a book. Try your own."}
          </h2>
        </div>
        <span
          data-en={"Everything stays in your browser."}
          data-id={"Berkas tetap di browsermu."}
        >
          {"Everything stays in your browser."}
        </span>
      </div>
      <div className={"book-trial-grid"}>
        <div className={"trial-entry"}>
          <Button
            variant={"ghost"}
            className={"trial-book"}
            data-story-open={""}
            aria-label={"Read Yang Tidak Ikut Pulang"}
          >
            <span className={"trial-cover"}>
              <img

                src={"example/story/cover.jpg"}
                width={"400"}
                height={"600"}
                loading={"lazy"}
                alt={"Yang Tidak Ikut Pulang sample cover"}
              />
            </span>
            <strong >{"Yang Tidak Ikut Pulang"}</strong>
            <span
              data-en={"Original sample · Read"}
              data-id={"Bacaan contoh · Buka"}
            >
              {"Original sample · Read"}
            </span>
          </Button>
          <small className={"trial-author"}>{"Bobby Fajar Christian · 2026"}</small>
          <details className={"trial-info"}>
            <summary  data-en={"Book information"} data-id={"Informasi buku"}>
              {"Book information"}
            </summary>
            <p
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
            <small >
              {"50 pages · Indonesian · Sela sample edition · CC BY 4.0"}
            </small>
          </details>
        </div>
        <label className={"trial-upload"} id={"drop-zone"} htmlFor={"pdf-file"}>
          <input
            id={"pdf-file"}
            className={"file-input"}
            type={"file"}
            accept={
              "application/pdf,application/epub+zip,.pdf,.epub,.cbz,.djvu,.djv,.txt,.md,.html,.htm,.fb2,.docx,.odt"
            }
          />
          <i className="ph-fill ph-upload-simple" aria-hidden={true}></i>
          <strong  data-en={"Try your document"} data-id={"Coba dokumenmu"}>
            {"Try your document"}
          </strong>
          <span >{"PDF · EPUB · CBZ · TXT"}</span>
          <small
            data-en={"Choose a file. No upload."}
            data-id={"Pilih berkas. Tanpa unggahan."}
          >
            {"Choose a file. No upload."}
          </small>
        </label>
        <a
          className={"original-document"}
          href={"example/yang-tidak-ikut-pulang.pdf"}
          data-en={"Original PDF ↗"}
          data-id={"PDF asli ↗"}
        >
          {"Original PDF ↗"}
        </a>
        <div className={"file-selection"} hidden={true}>
          <span id={"file-name"}></span>
          <Button variant={"ghost"} type={"button"} id={"clear-file"} data-i18n={"clear"}>
            {"Clear"}
          </Button>
        </div>
      </div>
    </section>
  );
}
function Demo() {
  return (
    <section className={"demo public-demo"} aria-labelledby={"demo-heading"}>
      <div className={"section-heading"}>
        <div>
          <p className={"eyebrow"} data-i18n={"demoEyebrow"}>
            {"FIND YOUR READING RHYTHM"}
          </p>
          <h2 id={"demo-heading"} data-i18n={"demoHeading"}>
            {"Four ways to read."}
          </h2>
        </div>
        <span className={"version-note"} data-i18n={"lazy"}>
          {"PDF engine loads only when you read."}
        </span>
      </div>
      {"\n"}
      <div className={"cards"}>
        {"\n"}
        <Button variant={"outline"} className={"mode-card"} data-mode={"book"}>
          <span className={"card-art"}>
            <i className="ph-fill ph-book-open-text" aria-hidden={true}></i>
          </span>
          <span className={"card-number"}>{"01 / BOOK"}</span>
          <strong  data-i18n={"bookTitle"}>{"Turn the page."}</strong>
          <span  data-i18n={"bookText"}>
            {"Paper folds, gentle shadows and a familiar two-page spread."}
          </span>
          <b  data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
        <Button variant={"outline"} className={"mode-card"} data-mode={"webtoon"}>
          <span className={"card-art scroll-art"}>
            <i className="ph-fill ph-scroll" aria-hidden={true}></i>
          </span>
          <span className={"card-number"}>{"02 / WEBTOON"}</span>
          <strong  data-i18n={"webtoonTitle"}>{"Follow the story."}</strong>
          <span  data-i18n={"webtoonText"}>
            {"Vertical reading with nearby pages rendered as you scroll."}
          </span>
          <b  data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
        <Button variant={"outline"} className={"mode-card"} data-mode={"single"}>
          <span className={"card-art single-art"}>
            <i className="ph-fill ph-file-text" aria-hidden={true}></i>
          </span>
          <span className={"card-number"}>{"03 / SINGLE"}</span>
          <strong  data-i18n={"singleTitle"}>{"Just this page."}</strong>
          <span  data-i18n={"singleText"}>
            {"One page, less distraction. A natural fit for small screens."}
          </span>
          <b  data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
        <Button variant={"outline"} className={"mode-card"} data-mode={"manga"}>
          <span className={"card-art manga-art"}>
            <i className="ph-fill ph-book-open" aria-hidden={true}></i>
          </span>
          <span className={"card-number"}>{"04 / MANGA · RTL"}</span>
          <strong  data-i18n={"mangaTitle"}>{"Read from the right."}</strong>
          <span  data-i18n={"mangaText"}>
            {
              "Right-to-left page turns and arrow keys. Keep original page order."
            }
          </span>
          <b  data-i18n={"read"}>{"Start reading ↗"}</b>
        </Button>
        {"\n"}
      </div>
      {"\n"}
      <noscript>
        <p>
          {"JavaScript is disabled. "}
          <a href={"example/yang-tidak-ikut-pulang.pdf"}>
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
      className={"installation-guide public-paths public-section"}
      aria-label={"Sela Books and Viewer"}
    >
      {"\n"}
      <article className="product-card product-card-library" id={"install-mobile"}>
        <div className={"product-heading"}>
          <span className={"route-icon"}>
            <i className="ph-fill ph-books" aria-hidden={true}></i>
          </span>
          <div>
            <small  data-en={"YOUR LIBRARY"} data-id={"PERPUSTAKAANMU"}>{"YOUR LIBRARY"}</small>
            <h2 >{"Sela Books"}</h2>
          </div>
        </div>
        <p >
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
        <div className={"product-chips"}>
          <span >{"Desktop"}</span>
          <span >{"Tablet"}</span>
          <span >{"Mobile"}</span>
        </div>
        <div className={"product-actions"}>
          <a id={"get-bookshelf"} className={"install-button"} href={"app/"}>
            <i className="ph-fill ph-arrow-square-out" aria-hidden={true}></i>
            <span data-en={"Open web app"} data-id={"Buka web app"}>
              {"Open web app"}
            </span>
          </a>
          <a href={"#install-mobile-steps"}>
            <span data-en={"Install guide ↗"} data-id={"Cara pasang ↗"}>
              {"Install guide ↗"}
            </span>
          </a>
        </div>
        <details className={"product-help"}>
          <summary >
            <span
              data-en={"Install on your device"}
              data-id={"Pasang di perangkatmu"}
            >
              {"Install on your device"}
            </span>
          </summary>
          <ol id={"install-mobile-steps"} className={"install-steps"}>
            <li ><span >1</span><span data-en={"Open Sela Books, then tap Install Sela when the app offers it."} data-id={"Buka Sela Books, lalu ketuk Pasang Sela saat tombolnya tersedia."}>{"Open Sela Books, then tap Install Sela when the app offers it."}</span></li>
            <li ><span >2</span><span data-en={"Chrome, Edge, Opera and Samsung Internet show their own install prompt when this browser supports it."} data-id={"Chrome, Edge, Opera, dan Samsung Internet menampilkan prompt pemasangan bawaan jika browser mendukungnya."}>{"Chrome, Edge, Opera and Samsung Internet show their own install prompt when this browser supports it."}</span></li>
            <li ><span >3</span><span data-en={"On iPhone or iPad, open the Share menu in Safari and choose Add to Home Screen. On macOS Safari, choose File → Add to Dock."} data-id={"Di iPhone atau iPad, buka menu Bagikan di Safari lalu pilih Tambahkan ke Layar Utama. Di Safari macOS, pilih File → Tambahkan ke Dock."}>{"On iPhone or iPad, open the Share menu in Safari and choose Add to Home Screen. On macOS Safari, choose File → Add to Dock."}</span></li>
            <li ><span >4</span><span data-en={"Firefox offers a home-screen shortcut on Android. On desktop, use its Web Apps option where available or bookmark Sela."} data-id={"Firefox menyediakan pintasan layar utama di Android. Di desktop, gunakan Web Apps bila tersedia atau bookmark Sela."}>{"Firefox offers a home-screen shortcut on Android. On desktop, use its Web Apps option where available or bookmark Sela."}</span></li>
          </ol>
          <aside role="note"><i className="ph-fill ph-info" aria-hidden={true}></i><p className="install-footnote" data-en={"Sela checks whether this browser has already installed the app and hides the install action when it confirms. Options vary by browser and operating system."} data-id={"Sela memeriksa apakah aplikasi sudah terpasang dan menyembunyikan tombol setelah browser mengonfirmasinya. Pilihan berbeda menurut browser dan sistem operasi."}>{"Sela checks whether this browser has already installed the app and hides the install action when it confirms. Options vary by browser and operating system."}</p></aside>
        </details>
      </article>
      <article className="product-card product-card-viewer">
        <div className={"product-heading"}>
          <span className={"route-icon"}>
            <i className="ph-fill ph-code" aria-hidden={true}></i>
          </span>
          <div>
            <small  data-en={"FOR YOUR WEBSITE"} data-id={"UNTUK WEBSITE-MU"}>{"FOR YOUR WEBSITE"}</small>
            <h2 >{"Sela Viewer"}</h2>
          </div>
        </div>
        <p >
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
        <div className={"product-chips"}>
          <span >{"CDN"}</span>
          <span >{"ESM"}</span>
          <span >{"TypeScript"}</span>
        </div>
        <div className={"product-actions"}>
          <a className={"install-button secondary"} href={"#install-viewer"}>
            <i className="ph-fill ph-code" aria-hidden={true}></i>
            <span data-en={"Use CDN"} data-id={"Gunakan CDN"}>
              {"Use CDN"}
            </span>
          </a>
          <Button
            variant={"ghost"}
            type={"button"}
            className={"product-demo"}
            data-story-open={""}
            data-app-demo={""}
          >
            <i className="ph-fill ph-play-circle" aria-hidden={true}></i>
            <span data-en={"Try app controls"} data-id={"Coba kontrol app"}>
              {"Try app controls"}
            </span>
          </Button>
          <a href={"#install-viewer"}>
            <span
              data-en={"Integration guide ↗"}
              data-id={"Panduan integrasi ↗"}
            >
              {"Integration guide ↗"}
            </span>
          </a>
        </div>
        <div className={"product-help"}>
          <h3  data-en="Works with your stack" data-id="Cocok dengan stack kamu">{"Works with your stack"}</h3>
          <p  data-en={"Use the same Viewer from plain HTML, CI3, Laravel, React, Vue, Svelte, Astro and other hosts. Bootstrap and Tailwind are optional."} data-id={"Gunakan Viewer yang sama dari HTML, CI3, Laravel, React, Vue, Svelte, Astro, dan host lainnya. Bootstrap dan Tailwind bersifat opsional."}>{"Use the same Viewer from plain HTML, CI3, Laravel, React, Vue, Svelte, Astro and other hosts. Bootstrap and Tailwind are optional."}</p>
          <StackLogos />
        </div>
      </article>
    </section>
  );
}
function Install() {
  return (
    <aside className="install-note" role="note">
      <p  data-en="Works with plain HTML, React, Vue, Laravel, CodeIgniter and other stacks. Your site needs a document URL that visitors can access." data-id="Bisa dipakai di HTML biasa, React, Vue, Laravel, CodeIgniter, dan stack lain. Situsmu perlu URL dokumen yang dapat diakses pengunjung.">Works with plain HTML, React, Vue, Laravel, CodeIgniter and other stacks. Your site needs a document URL that visitors can access.</p>
      <a href="https://github.com/bobbyfch/sela/blob/main/docs/install.md" target="_blank" rel="noopener noreferrer" data-i18n="docs">Installation and integration guide ↗</a>
    </aside>
  );
}
function Notes() {
  return (
    <section className={"notes public-section"}>
      <div >
        <article >
          <i className="ph-fill ph-sparkle" aria-hidden={true}></i>
          <h3  data-i18n={"filtersTitle"}>{"A softer reading space"}</h3>
          <p  data-i18n={"filtersText"}>
            {
              "Twelve page presets, a document brightness slider and dimmed controls. Separate tabs for contents, search, appearance, narration, notes and selectable text."
            }
          </p>
        </article>
        <article >
          <i className="ph-fill ph-device-mobile" aria-hidden={true}></i>
          <h3  data-i18n={"compatTitle"}>{"A graceful way back"}</h3>
          <p  data-i18n={"compatText"}>
            {
              "Modern browsers get the full viewer. Older browsers get the original PDF via the compatibility entry. Windows, macOS, Linux, Android and iOS follow browser capabilities."
            }
          </p>
        </article>
        <article >
          <i className="ph-fill ph-heart" aria-hidden={true}></i>
          <h3  data-i18n={"openTitle"}>{"Open source, clear origins"}</h3>
          <p  data-i18n={"openText"}>
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
    <nav aria-label={"Project links"}>
      <a href={"https://github.com/bobbyfch/sela"}>{"Sela on GitHub"}</a>
    </nav>
  );
}
