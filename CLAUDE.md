# CLAUDE.md — The Ramp

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

A SceneryStack reimplementation of PhET's Java simulation **The Ramp** (forces on
an inclined plane). The reference Java source is at
`~/svn/trunk/simulations-java/simulations/the-ramp/`.

Two-screen sim, mirroring the Java modules:

- **Introduction** (`src/intro/`) — Java `SimpleRampModule`
- **More Features** (`src/more-features/`) — Java `RampModule` (advanced)

Status: full ramp physics, record/playback, charts, and options-driven views for
both screens. Run `npm run verify` for the phase-10 automated gate. See
`doc/implementation-notes.md` and `doc/plan/` for architecture.

## Key files

| File | Purpose |
|---|---|
| `src/RampColors.ts` | All `ProfileColorProperty` instances |
| `src/RampNamespace.ts` | `the-ramp` namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/view/RampKeyboardHelpContent.ts` | Keyboard-help dialog content (shared by all screens) |
| `src/intro/IntroScreen.ts` | Introduction screen wrapper |
| `src/intro/model/IntroModel.ts` | Introduction state and logic |
| `src/intro/view/IntroScreenView.ts` | Introduction visual nodes and layout |
| `src/more-features/MoreFeaturesScreen.ts` | More Features screen wrapper |
| `src/more-features/model/MoreFeaturesModel.ts` | More Features state and logic |
| `src/more-features/view/MoreFeaturesScreenView.ts` | More Features visual nodes and layout |
| `scripts/generate-icons.ts` | PNG icons from `public/icons/icon.svg` |

## Adding a screen

1. Duplicate a screen folder (e.g. `src/intro/`) and rename the model/view/screen classes
2. Add a string key under `screens` in every `src/i18n/strings_*.json`
3. Expose it from `StringManager.getScreenNames()`
4. Register the screen in the `screens` array in `src/main.ts`

## Strings, colors, icon

- **Strings** — add the key to all `src/i18n/strings_*.json` (en, fr, es), expose via `StringManager`
- **Colors** — edit `RampColors.ts` (`default` + `projector` profiles per property)
- **Icon** — edit `public/icons/icon.svg`, run `npm run icons`; match theme color in `index.html` / `vite.config.ts` (still the placeholder template artwork)

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
