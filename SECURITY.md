# Security policy

## Supported versions

Security fixes go to the latest release on `main`. Sela is in beta, so older tags are not patched.

## Report a vulnerability

Do not open a public issue for a security problem.

Use GitHub's private reporting: open the [Security tab](https://github.com/bobbyfch/sela/security/advisories/new) of this repository and choose **Report a vulnerability**. Include:

- what is affected (app, Viewer, a pack, a build file)
- steps to reproduce, with a small non-sensitive document if one is needed
- the impact you expect
- browser and OS versions

You will get an answer within a reasonable time. Please allow a fix before you disclose publicly.

## Scope

In scope: the app, the Viewer, the build output on GitHub Pages, the reading-pack catalogue and its checksum checks, and import and parsing code.

Out of scope: vulnerabilities in a browser, in third-party sites that Discover links to, or in the optional external DjVu decoder. Report those upstream.

## What Sela already does

See [Security, attribution and distribution](docs/security.md) for how books are stored, how documents are sanitised, and which hosts the app may contact.
