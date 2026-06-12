# Phase 03 — Axon model layer, time-series model, audio

Goal: wrap the pure engine in reactive Properties, add the record/playback model, the
vector-visibility view-model, and collision audio. After this phase the screens step real
physics (still showing placeholder visuals).

## 1. `src/common/model/TimeSeriesModel.ts` (new)

Port of the Java `timeseries` package collapsed into one class. It does **not** import
`RampModel` (avoids a cycle); it talks to the physics through a client interface.

```ts
import { BooleanProperty, Emitter, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import type { RampPhysicsState } from "./RampPhysicsEngine.js";
import { MAX_RECORDING_TIME } from "./RampPhysicsConstants.js";

export type TimeSeriesMode = "record" | "playback";

/** What TimeSeriesModel needs from the physics owner (implemented by RampModel). */
export interface TimeSeriesClient {
  advancePhysics(dt: number): void;
  getStateSnapshot(): RampPhysicsState;
  setStateSnapshot(state: RampPhysicsState): void;
  setupForcesOnly(): void;
}
```

Members (exact names):

| Member | Type / initial | Notes |
|---|---|---|
| `modeProperty` | `StringUnionProperty<TimeSeriesMode>`, `"record"`, `validValues: ["record", "playback"]` | |
| `isPlayingProperty` | `BooleanProperty(false)` | Sim starts paused; Intro shows "Go!" |
| `playbackSpeedProperty` | `NumberProperty(1)` | slow motion = 0.5 |
| `recordTimeProperty` | `NumberProperty(0)` | seconds recorded so far |
| `playbackTimeProperty` | `NumberProperty(0)` | current playback cursor |
| `dataPointAddedEmitter` | `Emitter<[number, RampPhysicsState]>` (parameters: `[{ valueType: "number" }, { valueType: Object }]`) | fired per recorded step |
| `clearedEmitter` | `Emitter` | plots wipe on this |
| `private readonly states: Array<{ time: number; state: RampPhysicsState }>` | `[]` | snapshots are immutable, so storing references is safe |
| `private readonly client: TimeSeriesClient` | ctor arg | |

Methods (behavior is normative):

- `step(dt: number): void` — called by `RampModel.step` with already-clamped dt.
  - If `!isPlayingProperty.value`: call `client.setupForcesOnly()` (keeps arrows/FBD live
    while paused) and return.
  - Record mode: if `recordTimeProperty.value >= MAX_RECORDING_TIME`, set
    `isPlayingProperty` false and return. Otherwise `client.advancePhysics(dt)`;
    `recordTimeProperty.value += dt`; push `{ time: recordTime, state: client.getStateSnapshot() }`;
    emit `dataPointAddedEmitter(recordTime, snapshot)`.
  - Playback mode: `playbackTimeProperty.value = Math.min(playbackTime + dt * playbackSpeed, recordTime)`;
    `applyPlaybackState()`; if `playbackTime >= recordTime`, set `isPlayingProperty` false.
- `private applyPlaybackState(): void` — binary-search `states` for the **last** entry with
  `time <= playbackTimeProperty.value` (nearest-previous, like Java `ObjectTimeSeries`);
  if found, `client.setStateSnapshot(entry.state)`. Empty buffer ⇒ no-op.
- `setPlaybackTime(t: number): void` — clamp t to `[0, recordTimeProperty.value]`; set
  `modeProperty = "playback"`, `isPlayingProperty = false`, `playbackTimeProperty = t`,
  `applyPlaybackState()`. (Used by the plot cursor drag.)
- `record(): void` — if mode is `"playback"`: drop all entries with
  `time > playbackTimeProperty.value` and set `recordTimeProperty = playbackTimeProperty`
  (recording resumes from the scrub point). Then `modeProperty = "record"`,
  `isPlayingProperty = true`.
- `playback(): void` — if `playbackTimeProperty.value >= recordTimeProperty.value`, rewind
  to 0 first. `modeProperty = "playback"`, `isPlayingProperty = true`.
- `rewind(): void` — `playbackTimeProperty = 0`; `modeProperty = "playback"`;
  `isPlayingProperty = false`; `applyPlaybackState()`.
- `ensureRecordMode(): void` — if mode is `"playback"`, call `record()`; in all cases set
  `isPlayingProperty.value = true` (interacting with the physics always (re)starts
  recording, matching Java's `module.record()`). Called by view interactions that move the
  block (block drag, FBD drag, position slider, applied-force control, object selection) —
  NOT by the angle slider, so the ramp can be adjusted while paused.
- `clear(): void` — `isPlayingProperty = false`; `modeProperty = "record"`;
  `recordTimeProperty = 0`; `playbackTimeProperty = 0`; `states.length = 0`;
  `clearedEmitter.emit()`.
- `reset(): void` — `clear()` + `playbackSpeedProperty.reset()`.

## 2. `src/common/model/RampModel.ts` (new)

The axon façade. Implements the same `TModel` shape the scaffold stubs use
(`reset()`, `step(dt)`), and implements `TimeSeriesClient`.

### Properties (exact names, constructed in this order)

Inputs (user-writable):

| Property | Type, initial, range |
|---|---|
| `rampAngleProperty` | `NumberProperty(INITIAL_RAMP_ANGLE, { range: ANGLE_RANGE })` |
| `appliedForceProperty` | `NumberProperty(0, { range: APPLIED_FORCE_RANGE })` |
| `selectedObjectProperty` | `Property<RampObjectDescription>(RAMP_OBJECTS[0])` — `RAMP_OBJECTS[0]` is typed `RampObjectDescription \| undefined` under `noUncheckedIndexedAccess`; destructure once: `const [defaultObject] = RAMP_OBJECTS; if (!defaultObject) { throw new Error("RAMP_OBJECTS empty"); }` |
| `massProperty` | `NumberProperty(defaultObject.mass)` (no range — objects go below MASS_RANGE) |
| `staticFrictionProperty` | `NumberProperty(defaultObject.staticFriction)` |
| `kineticFrictionProperty` | `NumberProperty(defaultObject.kineticFriction)` |
| `frictionlessProperty` | `BooleanProperty(false)` |
| `zeroPointYProperty` | `NumberProperty(0)` |
| `globalPositionProperty` | `NumberProperty(INITIAL_POSITION_IN_SURFACE + GROUND_LENGTH, { range: POSITION_RANGE })` (= 16) |
| `soundEnabledProperty` | `BooleanProperty(true)` |

State mirrors + outputs (written only by the model; views read/link):

- `surfaceProperty: StringUnionProperty<SurfaceId>` (`"ramp"`, validValues both)
- `positionInSurfaceProperty`, `velocityProperty`, `accelerationProperty` — `NumberProperty(…)`
- Forces: `appliedParallelProperty, gravityParallelProperty, frictionParallelProperty,
  wallParallelProperty, netParallelProperty, normalPerpendicularProperty`
- Energy/work: `kineticEnergyProperty, potentialEnergyProperty, thermalEnergyProperty,
  totalEnergyProperty, appliedWorkProperty, gravityWorkProperty, frictiveWorkProperty,
  totalWorkProperty`

Derived:

- `blockLocationProperty: DerivedProperty<Vector2>` from
  `[surfaceProperty, positionInSurfaceProperty, rampAngleProperty]` →
  `new Vector2(loc.x, loc.y)` using engine `getBlockLocation` on a synthetic state
  (or compute inline with the same math).
- `speedProperty: DerivedProperty<number>` = `Math.abs(velocity)`.
- `rampHeightProperty: DerivedProperty<number>` = `RAMP_LENGTH * Math.sin(rampAngle)`.

Emitters: `collisionEmitter: Emitter<[CollisionInfo]>` (`parameters: [{ valueType: Object }]`),
`stepCompleteEmitter: Emitter`.

Other members: `public readonly timeSeriesModel = new TimeSeriesModel(this)`;
`private lastEndState: RampPhysicsState = createInitialState()`;
`private isWritingState = false` (re-entrancy guard);
`private savedStaticFriction / savedKineticFriction: number` (for the frictionless toggle).

### Behavior (normative)

- `step(dt: number): void` — `this.timeSeriesModel.step(Math.min(dt, MAX_DT))`.
- `advancePhysics(dt: number): void` —
  ```ts
  const current = this.buildCurrentState();
  const result = stepPhysics(current, this.lastEndState, dt);
  this.lastEndState = result.state;
  this.writeStateToProperties(result.state);
  if (result.collision !== null) {
    this.collisionEmitter.emit(result.collision);
  }
  this.stepCompleteEmitter.emit();
  ```
- `private buildCurrentState(): RampPhysicsState` — spread `this.lastEndState` (keeps the
  work/thermal bookkeeping and force fields) overlaid with every input read from
  Properties: `surface`, `positionInSurface`, `velocity` (from the mirrors — the position
  slider may have moved them), `mass`, `staticFriction`, `kineticFriction`, `rampAngle`,
  `appliedForce`, `zeroPointY`.
- `private writeStateToProperties(state: RampPhysicsState): void` — set
  `isWritingState = true` in a try/finally; write all mirrors and outputs:
  surface, positionInSurface, velocity, acceleration,
  `globalPositionProperty = getGlobalPosition(state)`, the six force properties, then
  `kineticEnergyProperty = getKineticEnergy(state)`, `potentialEnergyProperty`,
  `thermalEnergyProperty = state.thermalEnergy`, `totalEnergyProperty = getTotalEnergy(state)`,
  `appliedWorkProperty = state.appliedWork`, `gravityWorkProperty`, `frictiveWorkProperty`,
  `totalWorkProperty = getTotalWork(state)`.
- `setupForcesOnly(): void` — `const s = setupForces(this.buildCurrentState());` then write
  ONLY the force properties + acceleration + KE/PE/totalEnergy from `s` (NOT the works/thermal
  — those catch up via the rampLift term on the next recorded step, matching Java).
- `getStateSnapshot()` — `return this.lastEndState;`
- `setStateSnapshot(state)` — `this.lastEndState = state;` then `writeStateToProperties(state)`
  and ALSO (inside the same guard) write the input properties from the snapshot:
  `rampAngleProperty = state.rampAngle`, `appliedForceProperty = state.appliedForce`,
  `massProperty = state.mass`, `staticFrictionProperty`, `kineticFrictionProperty`,
  `zeroPointYProperty` (playback restores the whole world).
- `clearHeat(): void` — `this.lastEndState = clearHeat(this.buildCurrentState());`
  `writeStateToProperties(this.lastEndState)`.

Input listeners (all `lazyLink`, all no-op when `this.isWritingState`):

- `rampAngleProperty`, `appliedForceProperty`, `massProperty`, `staticFrictionProperty`,
  `kineticFrictionProperty`, `zeroPointYProperty` → `this.setupForcesOnly()`.
- `globalPositionProperty` → `const placed = withGlobalPosition(this.buildCurrentState(), value);`
  write `surfaceProperty`/`positionInSurfaceProperty` from `placed` (guarded), then
  `setupForcesOnly()`.
- `selectedObjectProperty` → set `massProperty = obj.mass`; if `frictionlessProperty.value`,
  update `savedStaticFriction/savedKineticFriction = obj.*`; else set both friction
  Properties from the object.
- `frictionlessProperty` → on true: save both friction values to `saved*`, set both
  Properties to 0; on false: restore both from `saved*`. Then `setupForcesOnly()`.

- `reset(): void` — order matters: `timeSeriesModel.reset()` first; then reset every input
  Property (`.reset()`), `frictionlessProperty.reset()`, `soundEnabledProperty.reset()`;
  then `this.lastEndState = createInitialState(); this.writeStateToProperties(this.lastEndState);`
  Finally `this.setupForcesOnly()`.

### Screen models

Replace the bodies of `src/intro/model/IntroModel.ts` and
`src/more-features/model/MoreFeaturesModel.ts` with trivial subclasses:

```ts
import { RampModel } from "../../common/model/RampModel.js";

export class IntroModel extends RampModel {}
```

(Keep the file-header comments; delete the stub Property examples. The existing
`IntroScreen.ts`/`MoreFeaturesScreen.ts` factories keep compiling unchanged.)

## 3. `src/common/model/VectorVisibilityModel.ts` (new)

Plain class of BooleanProperties (one instance per screen model is NOT needed — one per
screen **view** is wrong too; create it inside `RampModel` so reset is centralized:
add `public readonly vectorVisibility = new VectorVisibilityModel();` to `RampModel` and
call `this.vectorVisibility.reset()` in `RampModel.reset()`).

| Property | initial |
|---|---|
| `appliedVisibleProperty, gravityVisibleProperty, normalVisibleProperty, frictionVisibleProperty, wallVisibleProperty, totalVisibleProperty` | all `true` |
| `entireVectorsProperty` | `true` |
| `parallelComponentsProperty, perpendicularComponentsProperty, xComponentsProperty, yComponentsProperty` | all `false` |
| `fbdVisibleProperty` | `true` (only the More Features view constructs the FBD) |

Plus `reset(): void` resetting all.

## 4. Audio

### `src/common/audio/loadSoundClip.ts` (new) — full content

```ts
/**
 * loadSoundClip.ts
 *
 * Loads a bundled audio asset URL into a tambo SoundClip. Mirrors the loading
 * pattern of tambo's own generated sound modules: WrappedAudioBuffer +
 * decodeAudioData, with an asyncLoader lock so the sim waits for decoding.
 */
import { asyncLoader } from "scenerystack/phet-core";
import { phetAudioContext, SoundClip, soundManager, WrappedAudioBuffer } from "scenerystack/tambo";

export function loadSoundClip(url: string): SoundClip {
  const wrappedAudioBuffer = new WrappedAudioBuffer();
  const unlock = asyncLoader.createLock(url);
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => phetAudioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      wrappedAudioBuffer.audioBufferProperty.set(audioBuffer);
      unlock();
    })
    .catch(() => {
      unlock(); // sim must still launch if audio fails to decode
    });
  const soundClip = new SoundClip(wrappedAudioBuffer);
  soundManager.addSoundGenerator(soundClip);
  return soundClip;
}
```

(Verified API: `WrappedAudioBuffer` has a no-arg constructor and
`audioBufferProperty: TinyProperty<AudioBuffer | null>`; `SoundClip(wrappedAudioBuffer, options?)`;
`soundManager.addSoundGenerator(generator)`. `Sim` initializes `soundManager` itself.)

### `src/common/audio/CollisionSoundPlayer.ts` (new)

```ts
import type { ReadOnlyProperty } from "scenerystack/axon";
import type { Emitter } from "scenerystack/axon";
import { RampAudio } from "../../assets/audio.js";
import type { CollisionInfo } from "../model/RampPhysicsEngine.js";
import { loadSoundClip } from "./loadSoundClip.js";

/** Plays tiered impact sounds on wall collisions (Java CollisionHandler). */
export class CollisionSoundPlayer {
  public constructor(collisionEmitter: Emitter<[CollisionInfo]>, enabledProperty: ReadOnlyProperty<boolean>) {
    const smash0 = loadSoundClip(RampAudio.smash0);
    const smash1 = loadSoundClip(RampAudio.smash1);
    const smash2 = loadSoundClip(RampAudio.smash2);
    collisionEmitter.addListener((collision) => {
      if (!enabledProperty.value) {
        return;
      }
      const momentum = Math.abs(collision.momentumChange);
      if (momentum < 50) {
        // soft touch: silent
      } else if (momentum < 2000) {
        smash0.play();
      } else if (momentum < 4000) {
        smash1.play();
      } else {
        smash2.play();
      }
    });
  }
}
```

Construct one `CollisionSoundPlayer(model.collisionEmitter, model.soundEnabledProperty)`
inside `RampModel`'s constructor? **No** — audio touches tambo/browser; keep the model
engine-clean. Construct it in `RampScreenView` (phase 04) instead. The `slapooh` clip is
used by the Cool Ramp button in phase 07.

## Acceptance criteria

1. `npm run check && npm run lint && npm run build && npm run physics-check` all pass.
2. `npm run dev`: both screens boot. Nothing visible changes yet, but pressing nothing
   breaks: model constructors run, `step` is invoked each frame (sim starts paused —
   `isPlayingProperty` is false, so only `setupForcesOnly` runs).
3. Temporary verification (then delete): in `scripts/` (NOT src), extend
   `physics-check.ts` is already proof of the engine; for the model layer, set
   `model.timeSeriesModel.isPlayingProperty.value = true` from the browser console is not
   possible — instead temporarily add `this.timeSeriesModel.isPlayingProperty.value = true;`
   at the end of the `RampModel` constructor, run `npm run dev`, confirm via the
   (phase-04) placeholder that no exceptions occur for 30+ s of stepping, then remove it.
   It is acceptable to defer this smoke test to phase 04 when the block is visible.
