# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, offline slide deck (77 slides, Spanish) that walks through building the "Personal Management" project (Node.js/Express/MySQL API + vanilla-JS frontend with Atomic Design). It is **not** the project itself: the deck only displays code from it. It runs identically from `file://` (double-click `index.html`), a local server, GitHub Pages or Vercel; there is no bundler, build step, linter or test suite. All UI text and code comments are in Spanish — match that.

## Commands

```bash
npm start                               # zero-dependency static server (tools/serve.js) at http://localhost:3000
node tools/build-code-files.js          # regenerate js/code-files.js from the real project files
node tools/build-code-files.js --check  # validate ranges/focus/file paths only, write nothing
```

`package.json` only wraps these scripts (`start`, `build:code`, `check:code`); it has no dependencies. Verification is manual, in a browser.

**Deployment:** the site is the repo root served as-is. GitHub Pages deploys via `.github/workflows/pages.yml` (publishes only `index.html css js fonts vendor`); Vercel via `vercel.json` (no framework, no build). Keep every asset path relative (no leading `/`) so subpath hosting like `user.github.io/repo/` works, and keep deep links hash-based (`#paso-26-2`) so no rewrite rules are needed. If you add a runtime file/folder, add it to the `cp` line in the Pages workflow.

**The build tool does not work in this checkout as-is.** It resolves the source project as two directories above the deck (`RAIZ_PROYECTO = path.resolve(DIR_DECK, '..', '..')`), expecting `persona-api/` and `parametrization/` there. The deck was originally at `<project>/interactive_presentation/diapositivas_instruccion/`; here those folders don't exist, so `--check` aborts with "slides.js referencia archivos que no existen". Don't "fix" this by editing `js/code-files.js` by hand — either point `RAIZ_PROYECTO` at a copy of the real project or move the deck back inside it. The existing `js/code-files.js` is still valid for viewing.

## Architecture

**Content/rendering split.** `js/slides.js` is pure data (`window.PHASES`, `PIPELINE`, `ARCHITECTURE`, `SLIDES`); `js/app.js` builds the DOM from it; `js/scene.js` draws motion only. Scripts are classic IIFEs sharing `window` globals (no ES modules — they're blocked on `file://`). Load order in `index.html` matters: `three → highlight → code-files → slides → scene → app`.

**Code is never typed into slides.** A slide's `visual: { type: 'editor', tabs: [{ file, lang, range:[a,b], focus:[[c,d]] }] }` is only a pointer. `tools/build-code-files.js` regex-scans `slides.js` for every `file: '...'`, reads those files from the real project, validates `range`/`focus` against line counts (focus must lie inside range), and emits `js/code-files.js` (`window.CODE_FILES = {path: text}`; generated, never edit). Consequences when editing `slides.js`:
- Keep the `file: '...'` literal single-quoted and `range`/`focus` within ~600 chars of it — the validator parses by regex, not by evaluating JS.
- After changing the underlying project files or any `file`/`range`/`focus`, rerun the build tool.

**Slide schema** (see `construirTexto` / `construirVisual` in `js/app.js`): `id` (also the URL hash, e.g. `#paso-26-2`), `step`, `part:{n,of,label}`, `phase` (must match a `PHASES` id), `layer`, `title`, `file`, `lead[]` (HTML strings), optional blocks (`list`, `ordered`, `table`, `checklist`, `packages`, `endpoints`, `commands`, `exercises`, `output`), `visual.type` ∈ `editor | terminal | output | explorer | architecture | collection | tester | celebrate`, `flow`, `bubble`, `mood`. The cover uses `kind: 'cover'`. Slide order = array order = index order; the README's phase/slide-count table must be kept in sync when slides are added or removed.

**`flow` / pipeline link.** `flow: { lit: [ids], mode }` lights nodes of the top "request journey" strip; ids must exist in `PIPELINE.main`/`side`. `mode` ∈ `idle | request | error | full | boot` drives the animated packet in `scene.js` (`guionDeModo`). `mood` ∈ `wave | talk | think | surprised | celebrate` sets the mascot Bit's expression.

**Scene engine (`js/scene.js`).** Two three.js canvases (`#scene-back` dot field/graph, `#scene-front` Bit/packets/confetti) using an orthographic camera in CSS pixels, so `getBoundingClientRect()` coordinates map directly onto DOM elements. All text stays in the DOM. Exposes `window.Scene` (`init`, `setSlide`, `talk`, `poke`, `burst`, `send`), called from `ir()` in `app.js` on every slide change. Colors are read from CSS custom properties, so theming lives in `css/styles.css` tokens (light/dark via `data-theme` + `prefers-color-scheme`).

**Graceful degradation.** If `THREE` is missing or WebGL init fails, `app.js` adds `no-webgl` to `<html>`: the pipeline is drawn in CSS and Bit becomes the inline SVG in `index.html`. Any change to the scene must keep that fallback and `prefers-reduced-motion` working.

**`tester` / `collection` visuals** are an in-browser Postman-style API probe (`Tester`, `Collection` in `app.js`) that animates a request through the pipeline via `Scene.send`.

## Constraints

- No network at runtime: no CDNs, fonts and libs are vendored (`fonts/`, `vendor/`; three.js r158 global build, highlight.js 11.9). Don't modify vendored files — the three.js deprecation `console.warn` is expected.
- Source of truth for slide order/content is `../../step_by_step.md` (outside this directory, not present here); the README documents the 52-step ↔ 77-slide mapping.
