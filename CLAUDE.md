# CLAUDE.md — The Ramp

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

A SceneryStack reimplementation of PhET's Java simulation **The Ramp** (forces on
an inclined plane). A local `JAVA/` copy may exist but is gitignored).

Two-screen sim, mirroring the Java modules:

- **Introduction** (`src/intro/`) — Java `SimpleRampModule`
- **More Features** (`src/more-features/`) — Java `RampModule` (advanced)

Status: full ramp physics, record/playback, charts, and options-driven views for
both screens. Run `npm run verify` for the automated gate. See
`doc/implementation-notes.md` for architecture.

## Key files

| File | Purpose |
|---|---|
| `src/RampColors.ts` | All `ProfileColorProperty` instances |
| `src/RampNamespace.ts` | `the-ramp` namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/view/RampKeyboardHelpContent.ts` | Keyboard-help dialog content (shared by all screens) |
| `src/common/view/RampScreenSummaryContent.ts` | Accessible screen summary with live current-details (shared by all screens) |
| `src/intro/IntroScreen.ts` | Introduction screen wrapper |
| `src/intro/model/IntroModel.ts` | Introduction state and logic |
| `src/intro/view/IntroScreenView.ts` | Introduction visual nodes and layout |
| `src/more-features/MoreFeaturesScreen.ts` | More Features screen wrapper |
| `src/more-features/model/MoreFeaturesModel.ts` | More Features state and logic |
| `src/more-features/view/MoreFeaturesScreenView.ts` | More Features visual nodes and layout |
| `scripts/generate-icons.ts` | PNG icons from `public/icons/icon.svg` |

## Documented deviations (CONVENTIONS.md §2)

- **Constants are nested, not at `src/` root:** shared layout/panel values live in
  `src/common/RampConstants.ts` and physics values in `src/common/model/RampPhysicsConstants.ts`,
  next to their consumers. There is deliberately no root `RampConstants.ts`.
- **`src/assets/`** holds bundled images/audio plus the `images.ts` manifest (extra root folder).

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`RampScreenView` registers `RampScreenSummaryContent` (live current-details derived from the
model) and sets an explicit `pdomOrder`; the draggable `BlockNode` is keyboard-operable via a
`KeyboardListener` (arrow keys push the object). A11y strings live under the `a11y` key in each
locale JSON, exposed via `StringManager.getA11yStrings()`.

## Compliance carve-outs

- **Nested constants:** `src/common/model/RampPhysicsConstants.ts` and related layout constants co-located with the ramp model.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | Test environment + `setupFiles` when present; `execArgv: ["--expose-gc"]` with memory-leak suite |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports (when required) |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

- Put unit tests only under root `tests/` (never co-locate or use `__tests__/`).
- Run `npm test`. CI runs the suite when a `test` script is present.
- Expand `memory-leak.test.ts` for components that add/remove nodes or link Properties at runtime (see OpticsLab).

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
