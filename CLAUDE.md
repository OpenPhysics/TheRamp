# CLAUDE.md — The Ramp

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack reimplementation of PhET's Java *The Ramp* (forces on an inclined plane). Two screens mirroring the Java modules:

- **Introduction** (`src/intro/`) — Java `SimpleRampModule`
- **More Features** (`src/more-features/`) — Java `RampModule` (charts, record/playback, FBD, measuring tape)

Upstream Java ground truth: `../Baseline/TheRamp/java` (OpenPhysics/Baseline). Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| Area | Location |
|---|---|
| Screens | `src/intro/IntroScreen.ts`, `src/more-features/MoreFeaturesScreen.ts` |
| Shared model | `src/common/model/RampModel.ts`, `RampPhysicsEngine.ts` (pure physics), `RampPhysicsConstants.ts`, `TimeSeriesModel.ts`, `RampEnergyModel.ts`, `RampForcesModel.ts` |
| Screen models | `src/intro/model/IntroModel.ts`, `src/more-features/model/MoreFeaturesModel.ts` |
| Shared view | `src/common/view/RampScreenView.ts`, `RampScreenSummaryContent.ts`, `RampKeyboardHelpContent.ts` |
| Screen views | `src/intro/view/IntroScreenView.ts`, `src/more-features/view/MoreFeaturesScreenView.ts` |
| Layout constants | `src/TheRampConstants.ts` |
| Colors / strings | `src/TheRampColors.ts`, `TheRampNamespace.ts`, `src/i18n/StringManager.ts` |
| Icons | `scripts/generate-icons.ts` |

## Model

`RampPhysicsEngine` is a **zero-dependency pure module** (runs under Node for `scripts/physics-check.ts`). The screen models wrap it with Properties for ramp angle, friction, applied force, record/playback, and energy bookkeeping.

| State / Property | Meaning |
|---|---|
| `surface` | `"ground"` \| `"ramp"` — current segment |
| `positionInSurface` / `velocity` | arc-length position and speed along current surface |
| `rampAngleProperty` | incline angle (radians) |
| `staticFriction` / `kineticFriction` | μₛ / μₖ |
| `appliedForceProperty` | user push/pull parallel to surface |
| `thermalEnergy` | friction heat accumulator ("Cool Ramp" resets without moving block) |

### Stepping & numerics

- Block moves on a composite **ground + ramp** surface; global position spans 0–21 m.
- Static friction holds until net parallel force exceeds μₛN; kinetic friction opposes motion at μₖN.
- Work–energy bookkeeping tracks applied, gravity, and friction work; total energy conserved when thermal is included.
- More Features adds time-series record/playback and chart sampling via `TimeSeriesModel`.

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`RampScreenView` registers `RampScreenSummaryContent` (live current-details derived from the
model) and sets an explicit `pdomOrder` via a wrapper `Node`; the draggable block is
keyboard-operable via a `KeyboardListener` (arrow keys). A11y strings live under the `a11y` key in
each locale JSON, via `StringManager.getA11yStrings()`.

## Compliance carve-outs

- **Root constants:** `src/TheRampConstants.ts`; domain-specific `src/common/model/RampPhysicsConstants.ts` stays nested.
- **`src/assets/`** holds bundled images/audio plus the `images.ts` manifest (extra root folder).
- **Domain clock:** `TimeSeriesModel` owns record/playback scrubbing instead of composing fleet-standard `TimeModel` (`src/common/TimeModel.ts` is present for shared reference only).


### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. LightPropagation keeps a higher `three` pin — do not force 0.125 there. |
| `brace-expansion` | `~5.0.9` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895). |

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment, `setupFiles`, `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

Actual specs:

- `tests/common/model/RampPhysicsEngine.test.ts`
- `tests/memory-leak.test.ts`

Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
npm run verify   # check + lint + physics-check + build
```

`npm run release` intentionally skips `npm test` in some sims — append `&& npm test` before the version bump so a release cannot ship a failing suite.

## Development notes

- After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
