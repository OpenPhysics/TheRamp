# Implementation Notes - The Ramp

Developer-facing notes on the architecture. The physics itself is documented for educators in
[model.md](./model.md).

## Architecture Overview

The Ramp is a two-screen SceneryStack reimplementation of PhET's Java *The Ramp*. The code separates
into three layers:

```
src/common/model/
  ├─ RampPhysicsEngine.ts      pure physics — zero axon/scenery deps; runs under Node
  ├─ RampPhysicsConstants.ts   g, segment lengths, MAX_DT, overheat threshold (also zero-import)
  ├─ RampModel.ts              axon façade: Properties, input listeners, step/reset
  ├─ RampForcesModel.ts        grouped parallel/perpendicular force Properties
  ├─ RampEnergyModel.ts        KE, PE, thermal, work accumulators
  ├─ TimeSeriesModel.ts        record/playback buffers (More Features)
  ├─ VectorVisibilityModel.ts  FBD / component visibility toggles
  └─ RampObjectDescription.ts  preset objects (mass, μ_s, μ_k)

src/common/view/
  ├─ RampScreenView.ts         shared layout; RampScreenViewFeatures per screen
  ├─ RampSceneNode.ts          sky, ramp, block, force vectors, readouts
  ├─ RampControlPanel.ts       right column (feature-flagged controls)
  ├─ EnergyWorkBarChartsNode / RampPlotsNode / FreeBodyDiagramNode / …
  └─ RampKeyboardHelpContent.ts, RampScreenSummaryContent.ts

src/intro/                     Java SimpleRampModule
  ├─ IntroModel.ts             extends RampModel (identity only)
  ├─ IntroScreenView.ts        Intro feature flags
  └─ IntroScreen.ts

src/more-features/             Java RampModule
  ├─ MoreFeaturesModel.ts
  ├─ MoreFeaturesScreenView.ts
  └─ MoreFeaturesScreen.ts

src/preferences/               RampPreferencesModel, rampQueryParameters
src/common/audio/              CollisionSoundPlayer (optional impact sounds)
```

Data flows Model → View through AXON `Property` objects; `RampPhysicsEngine` never imports axon or
scenery.

## Key design decisions

- **Pure engine + reactive façade.** All integration, friction, boundaries, and energy bookkeeping
  live in `RampPhysicsEngine` as pure functions on `RampPhysicsState`. `RampModel` mirrors state into
  Properties and wires user inputs; `stepPhysics(current, previousEnd, dt)` needs the unaltered
  previous end state for the ramp-lift work term.
- **Two propagation paths, one physics.** `scripts/physics-check.ts` runs 21 scenarios against the
  engine directly (static hold, break-away at 459/460 N, frictionless slide, collisions, surface
  handoff, clearHeat, snapshot determinism). Keep engine and model in sync.
- **Force-only updates at rest.** Changing angle, applied force, mass, friction, or zero-point
  calls `setupForcesOnly()` without advancing time — matches Java static recomputation.
- **Options-driven views.** `RampScreenViewFeatures` selects Intro vs More Features panels (plots,
  record/playback, FBD, tape, zero-point line) without duplicating layout code.
- **Shared preferences.** `RampPreferencesModel` seeds initial angle, frictionless default, sound,
  and vector-component display on construction and Reset All.

## Model / view design

- `RampModel.advancePhysics(dt)` clamps dt to `MAX_DT` (0.2 s), calls `stepPhysics`, emits
  `collisionEmitter` for sound/visual feedback, and notifies `TimeSeriesModel`.
- `globalPositionProperty` maps the 1D slider to `{ surface, positionInSurface }` via
  `withGlobalPosition` / `getGlobalPosition`.
- `RampScreenView.reset()` restores accordion expansion, tape/zero-point visibility, and measuring-tape
  positions in addition to `model.reset()`.
- Colors: all `ProfileColorProperty` instances in `RampColors.ts` (`the-ramp` namespace).

## Disposal conventions

Most nodes live for the screen lifetime and are never disposed. Dynamic teardown is not required
today because the graph is static after construction. If record/playback or overlay nodes gain
runtime add/remove, register listener cleanup on `disposeEmitter` following the fleet pattern
(see OpticsLab / QubitSketch `GatePalettePanel`).

## Testing

`npm test` (vitest, Node ≥ 22 — see `.nvmrc`):

- `tests/common/model/RampPhysicsEngine.test.ts` — engine invariants and edge cases
- `tests/memory-leak.test.ts` — WeakRef/GC regression on plain `RampPhysicsState` objects
- `scripts/physics-check.ts` — 21-scenario gate via `npm run physics-check` (part of `npm run verify`)

## Multi-screen simulations

Two screens share `RampModel` and `RampScreenView` with thin screen wrappers. Screen-specific
behavior is limited to feature flags and screen icons; see `doc/multi-screen.md` in the fleet template
if adding a third screen.
