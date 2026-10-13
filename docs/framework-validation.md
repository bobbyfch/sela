# Framework integration checks

Sela's viewer keeps host integrations independent from the Reader app shell. The examples and smoke checks exercise the public SDK through framework-native lifecycle points and the framework-independent browser bundle.

Run the checks from the repository root after a clean build:

```sh
npm run build
npm run test:frameworks
```

The optional matrix covers React/Next.js, Vue/Nuxt, Svelte, Angular, Astro, plain HTML/ES modules, and PHP-hosted CodeIgniter and Laravel pages. Framework fixtures, downloaded host dependencies, and test results are created under .build/; they are disposable development materials and are not included in the Reader or SDK package.

The PHP host matrix uses php from PATH by default. Set SELA_PHP and, when testing an older PHP runtime, SELA_PHP_LEGACY to select executables. Playwright uses its installed Chromium by default; PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH can select alternate compatible binaries.

The checks validate the specific fixtures and SDK entry points in the repository. They do not certify every framework release, authentication setup, content-security policy, CDN configuration, hosting provider, or physical device. Check [browser compatibility](compatibility.md) for the supported browser boundary and [development](development.md) for the build and test workflow.
