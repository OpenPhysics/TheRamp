# CLAUDE.md — The Ramp

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack reimplementation of PhET's Java *The Ramp* (forces on an inclined plane). Two screens mirroring the Java modules:

- **Introduction** (`src/intro/`) — Java `SimpleRampModule`
- **More Features** (`src/more-features/`) — Java `RampModule` (charts, record/playback, FBD, measuring tape)

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

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

## Development notes

- After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
