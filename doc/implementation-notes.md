# Implementation Notes - The Ramp

## Architecture Overview

The Ramp is a SceneryStack reimplementation of PhET's Java simulation of the
same name (`simulations-java/simulations/the-ramp`). It models forces on an
inclined plane with full ramp physics, record/playback, energy/work charts, and
screen-specific control sets.

The sim has two screens, mirroring the original Java modules:

- **Introduction** (`src/intro/`) — the Java `SimpleRampModule`
- **More Features** (`src/more-features/`) — the Java `RampModule` (advanced)

### High-Level Architecture

The implementation separates pure physics from reactive state and view concerns:

- **Physics engine** (`src/common/model/RampPhysicsEngine.ts`) — pure functions, no imports
- **Axon façade** (`src/common/model/RampModel.ts`) — Properties mirroring engine state
- **Time-series model** (`src/common/model/TimeSeriesModel.ts`) — record/playback buffers
- **Options-driven views** (`src/common/view/RampScreenView.ts`) — shared layout; per-screen
  feature flags in `RampScreenViewFeatures` select controls, plots, FBD, tape, etc.

Each screen wires a thin model subclass (`IntroModel` / `MoreFeaturesModel`) and
view subclass (`IntroScreenView` / `MoreFeaturesScreenView`) into a `Screen`
wrapper. Shared UI lives under `src/common/view/`.

Development history and phased plans are documented in `doc/plan/`.

## Model Components

`RampModel` owns user inputs, physics state mirrors, collision events, vector
visibility, and the time-series recorder. `IntroModel` and `MoreFeaturesModel`
extend it without adding behavior (screen identity only).

`VectorVisibilityModel` holds BooleanProperties for force-vector and coordinate-frame
visibility; `model.reset()` restores defaults.

## View Components

### RampScreenView

The base `ScreenView` composes:

- `RampSceneNode` — world (sky, ramp, block, force vectors, readouts)
- `RampControlPanel` — right column; content driven by `RampScreenViewFeatures`
- `EnergyWorkBarChartsNode` — collapsible energy and work bar charts
- `RampPlotsNode` — collapsible energy, work, and parallel-force time plots
- `GoPauseClearPanel` (Intro) or `RecordPlaybackControlBar` (More Features)
- Optional `FreeBodyDiagramNode`, `MeasuringTapeNode`, `ZeroPointPeLineNode`

`RampScreenView.reset()` restores accordion expansion, tape/zero-point visibility,
and measuring-tape positions in addition to calling `model.reset()`.

### Color Scheme

`RampColors.ts` defines `ProfileColorProperty` instances for default and
projector profiles, scoped to the `the-ramp` namespace (`RampNamespace.ts`).

## Verification (phase 10)

Automated gates (run via `npm run verify`):

| Check | Result |
|---|---|
| `npm run check` | tsc on `src/` + `scripts/` |
| `npm run lint` | biome, 60 files |
| `npm run physics-check` | 21 scenarios, all PASS (static hold, break-away 459/460 N, frictionless slide, 600-step soak, ramp-top/ground collisions, surface handoff, clearHeat, snapshot determinism) |
| `npm run build` | tsc + vite; PWA manifest + service worker in `dist/` |

Production smoke (`npm run preview`): index and `manifest.webmanifest` serve 200; hashed assets under `dist/assets/` (images, wav).

Manual browser checklist: `doc/plan/10-verification.md` section 2 (physics, vectors, controls, energy, record/playback, screens, locale, projector, resize).

## Outstanding Work

- PhET-iO instrumentation (tandems are mostly `OPT_OUT` today)
- Dispose functions for long-lived listeners (not yet required for sim lifetime)
