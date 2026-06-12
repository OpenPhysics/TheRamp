# Phase 02 — Pure physics engine + automated checks

Goal: the complete ramp physics as a dependency-free module, plus a Node-run check script
that proves it correct before any UI exists. **This doc contains complete reference code —
transcribe it (it is the spec), adjusting only formatting to satisfy Biome.**

The engine is a faithful port of `RampPhysicalModel.java` + `Block.java` + `Surface.java` +
`Ramp.java` + `Ground.java`, with the deviations listed in 00-overview "PORT NOTES".

## Conventions

- Standard math coordinates: y up, angles CCW from +x. The ramp is hinged at the origin;
  the ground runs from (−6, 0) to (0, 0).
- 1D motion coordinate: `positionInSurface` = meters along the current surface from its
  start (ground start = left wall; ramp start = hinge). Positive velocity = rightward/up-ramp.
- Ground surface angle is always 0; ramp angle is `rampAngle`.
- States are **immutable**: every function returns a fresh object via spread. Never mutate
  a `RampPhysicsState` in place (record/playback stores these objects directly).

## 1. `src/common/model/RampPhysicsEngine.ts` (new) — full reference implementation

```ts
/**
 * RampPhysicsEngine.ts
 *
 * Pure, dependency-free physics for The Ramp. Port of the Java
 * RampPhysicalModel/Block/Surface trio.
 *
 * ZERO imports other than RampPhysicsConstants (also zero-import) — this module
 * must run under Node for scripts/physics-check.ts.
 *
 * All functions are pure: they take a RampPhysicsState and return a new one.
 */
import {
  GRAVITY,
  GROUND_LENGTH,
  GROUND_ORIGIN_X,
  INITIAL_POSITION_IN_SURFACE,
  INITIAL_RAMP_ANGLE,
  RAMP_LENGTH,
} from "./RampPhysicsConstants.js";

export type SurfaceId = "ground" | "ramp";

export interface RampPhysicsState {
  // --- configuration / inputs (written by the model layer between steps) ---
  readonly surface: SurfaceId;
  readonly positionInSurface: number; // m along current surface
  readonly velocity: number; // m/s, + = up-ramp/right
  readonly acceleration: number; // m/s^2 (last computed)
  readonly mass: number; // kg
  readonly staticFriction: number; // mu_s
  readonly kineticFriction: number; // mu_k
  readonly rampAngle: number; // radians
  readonly appliedForce: number; // N, parallel to current surface
  readonly zeroPointY: number; // m, PE reference height
  // --- accumulated work/energy bookkeeping ---
  readonly appliedWork: number; // J
  readonly gravityWork: number; // J
  readonly frictiveWork: number; // J
  readonly thermalEnergy: number; // J
  // --- force decomposition (outputs of setupForces; parallel components) ---
  readonly appliedParallel: number;
  readonly gravityParallel: number;
  readonly frictionParallel: number;
  readonly wallParallel: number;
  readonly netParallel: number;
  readonly normalPerpendicular: number;
}

export interface CollisionInfo {
  /** Signed momentum change m*(vAfter - vBefore); vAfter is 0, so = -m*vBefore. kg*m/s */
  readonly momentumChange: number;
  readonly dt: number;
}

export interface StepResult {
  readonly state: RampPhysicsState;
  readonly collision: CollisionInfo | null;
}

/** Acceleration magnitudes below this are treated as zero (Java: 1e-7). */
const ACCELERATION_EPSILON = 1e-7;

function surfaceAngle(state: RampPhysicsState): number {
  return state.surface === "ramp" ? state.rampAngle : 0;
}

function surfaceLength(state: RampPhysicsState): number {
  return state.surface === "ramp" ? RAMP_LENGTH : GROUND_LENGTH;
}

/** Position of the block in 2D world coordinates (m). */
export function getBlockLocation(state: RampPhysicsState): { x: number; y: number } {
  if (state.surface === "ground") {
    return { x: GROUND_ORIGIN_X + state.positionInSurface, y: 0 };
  }
  return {
    x: state.positionInSurface * Math.cos(state.rampAngle),
    y: state.positionInSurface * Math.sin(state.rampAngle),
  };
}

/** 1D arc-length position over ground+ramp, in [0, 21]. */
export function getGlobalPosition(state: RampPhysicsState): number {
  return state.surface === "ground" ? state.positionInSurface : state.positionInSurface + GROUND_LENGTH;
}

/** Inverse of getGlobalPosition: places the block (used by the position slider). */
export function withGlobalPosition(state: RampPhysicsState, globalPosition: number): RampPhysicsState {
  if (globalPosition <= GROUND_LENGTH) {
    return { ...state, surface: "ground", positionInSurface: globalPosition };
  }
  return { ...state, surface: "ramp", positionInSurface: globalPosition - GROUND_LENGTH };
}

export function getKineticEnergy(state: RampPhysicsState): number {
  return 0.5 * state.mass * state.velocity * state.velocity;
}

export function getPotentialEnergy(state: RampPhysicsState): number {
  return state.mass * GRAVITY * (getBlockLocation(state).y - state.zeroPointY);
}

export function getTotalEnergy(state: RampPhysicsState): number {
  return getKineticEnergy(state) + getPotentialEnergy(state) + state.thermalEnergy;
}

export function getTotalWork(state: RampPhysicsState): number {
  return state.appliedWork + state.gravityWork + state.frictiveWork;
}

/**
 * Friction force (parallel), exact port of Block.getFrictionForce.
 * otherParallelForces = applied + gravity parallel components.
 */
function frictionForce(state: RampPhysicsState, otherParallelForces: number): number {
  const normal = state.mass * GRAVITY * Math.cos(surfaceAngle(state));
  if (state.velocity !== 0) {
    const sign = state.velocity >= 0 ? -1 : 1;
    return sign * state.kineticFriction * normal;
  }
  const u = Math.max(state.kineticFriction, state.staticFriction);
  const maxStaticFriction = u * normal;
  if (Math.abs(maxStaticFriction) > Math.abs(otherParallelForces)) {
    return -otherParallelForces; // static friction holds the block
  }
  const sign = otherParallelForces >= 0 ? -1 : 1;
  return sign * u * normal; // breaks free
}

/** Wall force: cancels net force pushing into a wall the block is touching. */
function wallForce(state: RampPhysicsState, netWithoutWall: number): number {
  if (state.surface === "ramp" && state.positionInSurface === RAMP_LENGTH && netWithoutWall > 0) {
    return -netWithoutWall;
  }
  if (state.surface === "ground" && state.positionInSurface === 0 && netWithoutWall < 0) {
    return -netWithoutWall;
  }
  return 0;
}

/**
 * Recomputes all force components and the acceleration for the current state.
 * Port of RampPhysicalModel.setupForces.
 */
export function setupForces(state: RampPhysicsState): RampPhysicsState {
  const theta = surfaceAngle(state);
  const gravityParallel = -state.mass * GRAVITY * Math.sin(theta);
  const appliedParallel = state.appliedForce;
  const frictionParallel = frictionForce(state, appliedParallel + gravityParallel);
  const netWithoutWall = appliedParallel + gravityParallel + frictionParallel;
  const wallParallel = wallForce(state, netWithoutWall);
  const netParallel = netWithoutWall + wallParallel;
  return {
    ...state,
    appliedParallel,
    gravityParallel,
    frictionParallel,
    wallParallel,
    netParallel,
    normalPerpendicular: state.mass * GRAVITY * Math.cos(theta),
    acceleration: netParallel / state.mass,
  };
}

interface BoundaryResult {
  readonly state: RampPhysicsState;
  readonly collided: boolean;
  readonly velocityBeforeStop: number;
}

/** Surface handoff and wall collisions. Port of Ramp/Ground.applyBoundaryConditions. */
function applyBoundaryConditions(state: RampPhysicsState): BoundaryResult {
  const pos = state.positionInSurface;
  if (state.surface === "ramp") {
    if (pos < 0) {
      // slid off the bottom of the ramp onto the ground
      const overshoot = Math.min(-pos, GROUND_LENGTH);
      return {
        state: { ...state, surface: "ground", positionInSurface: GROUND_LENGTH - overshoot },
        collided: false,
        velocityBeforeStop: 0,
      };
    }
    if (pos > RAMP_LENGTH) {
      // hit the wall at the top of the ramp
      return {
        state: { ...state, positionInSurface: RAMP_LENGTH, velocity: 0 },
        collided: true,
        velocityBeforeStop: state.velocity,
      };
    }
  } else {
    if (pos < 0) {
      // hit the wall at the left end of the ground
      return {
        state: { ...state, positionInSurface: 0, velocity: 0 },
        collided: true,
        velocityBeforeStop: state.velocity,
      };
    }
    if (pos > GROUND_LENGTH) {
      // moved up onto the ramp
      const overshoot = Math.min(pos - GROUND_LENGTH, RAMP_LENGTH);
      return {
        state: { ...state, surface: "ramp", positionInSurface: overshoot },
        collided: false,
        velocityBeforeStop: 0,
      };
    }
  }
  return { state, collided: false, velocityBeforeStop: 0 };
}

/** gravityWork/appliedWork baseline so the invariants hold at rest. Port of initWorks. */
export function initWorks(state: RampPhysicsState): RampPhysicsState {
  const pe = getPotentialEnergy(state);
  return { ...state, gravityWork: -pe, appliedWork: pe + getKineticEnergy(state) };
}

/** Cool Ramp: drop thermal energy, rebaseline works. Port of clearHeat. */
export function clearHeat(state: RampPhysicsState): RampPhysicsState {
  return initWorks({ ...state, thermalEnergy: 0, frictiveWork: 0 });
}

/**
 * One Euler step. Port of RampPhysicalModel.newStepCode + Block.stepInTime.
 *
 * @param current - last step's end state with this frame's inputs already written
 *   (appliedForce, rampAngle, mass, frictions, zeroPointY, position if user-set)
 * @param previousEnd - last step's end state UNALTERED (needed for the "ramp lift"
 *   term: raising the ramp under a resting block does work on it)
 * @param dt - seconds (caller clamps to MAX_DT)
 */
export function stepPhysics(current: RampPhysicsState, previousEnd: RampPhysicsState, dt: number): StepResult {
  // 1. forces and acceleration
  let s = setupForces(current);
  const keBeforeStep = getKineticEnergy(s);

  // 2. integrate with velocity sign-change capture (static-friction catch)
  const a = Math.abs(s.acceleration) < ACCELERATION_EPSILON ? 0 : s.acceleration;
  const v0 = s.velocity;
  let v = v0 + a * dt;
  if ((v0 > 0 && v < 0) || (v0 < 0 && v > 0)) {
    v = 0;
  }
  s = { ...s, velocity: v, positionInSurface: s.positionInSurface + v * dt };

  // 3. boundary conditions (surface handoff or wall collision)
  const boundary = applyBoundaryConditions(s);
  s = boundary.state;
  const collision: CollisionInfo | null = boundary.collided
    ? { momentumChange: -s.mass * boundary.velocityBeforeStop, dt }
    : null;

  // 4. energy/work bookkeeping (PORT NOTE 1: thermal first, so the invariant
  //    totalEnergy === appliedWork holds on every step including collisions)
  const ke = getKineticEnergy(s);
  const pe = getPotentialEnergy(s);
  const frictionless = s.staticFriction === 0 && s.kineticFriction === 0;
  if (frictionless) {
    let thermalEnergy = current.thermalEnergy;
    if (collision !== null) {
      thermalEnergy += keBeforeStep; // all KE lost in the wall impact becomes heat
    }
    s = {
      ...s,
      thermalEnergy,
      appliedWork: ke + pe + thermalEnergy,
      gravityWork: -pe,
      frictiveWork: -thermalEnergy,
    };
  } else {
    const blockDX = getGlobalPosition(s) - getGlobalPosition(current);
    const rampLift = getPotentialEnergy(current) - getPotentialEnergy(previousEnd);
    const appliedWork = current.appliedWork + s.appliedParallel * blockDX + rampLift;
    const thermalEnergy = appliedWork - ke - pe;
    s = { ...s, appliedWork, gravityWork: -pe, frictiveWork: -thermalEnergy, thermalEnergy };
  }

  // 5. recompute display forces at the final position; during a collision step,
  //    display the impulsive wall force (Java CollisionHandler: wallForce = dp/dt).
  //    Display-only — netParallel is NOT adjusted (matches Java, which only
  //    overrode the wall-force vector).
  s = setupForces(s);
  if (collision !== null) {
    s = { ...s, wallParallel: collision.momentumChange / dt };
  }

  return { state: s, collision };
}

/** Reset-time state: File Cabinet at rest, 10 m up a 10-degree ramp. */
export function createInitialState(): RampPhysicsState {
  const base: RampPhysicsState = {
    surface: "ramp",
    positionInSurface: INITIAL_POSITION_IN_SURFACE,
    velocity: 0,
    acceleration: 0,
    mass: 100, // File Cabinet
    staticFriction: 0.3,
    kineticFriction: 0.3,
    rampAngle: INITIAL_RAMP_ANGLE,
    appliedForce: 0,
    zeroPointY: 0,
    appliedWork: 0,
    gravityWork: 0,
    frictiveWork: 0,
    thermalEnergy: 0,
    appliedParallel: 0,
    gravityParallel: 0,
    frictionParallel: 0,
    wallParallel: 0,
    netParallel: 0,
    normalPerpendicular: 0,
  };
  return initWorks(setupForces(base));
}
```

## 2. `src/common/model/RampObjectDescription.ts` (new) — full content

```ts
/**
 * RampObjectDescription.ts
 *
 * The five selectable objects, with Java's exact values (RampModule.java).
 * ZERO imports — images are referenced by key and resolved in src/assets/images.ts;
 * names are referenced by key and resolved via StringManager.getObjectStrings().
 */
export interface RampObjectDescription {
  readonly nameKey: "fileCabinet" | "refrigerator" | "piano" | "crate" | "sleepyDog";
  readonly imageKey: "cabinet" | "fridge" | "piano" | "crate" | "ollie";
  readonly mass: number; // kg
  readonly staticFriction: number;
  readonly kineticFriction: number;
  readonly viewScale: number; // image scale factor in the world view
  readonly yOffset: number; // px the image is shifted down to sit on the surface
}

export const RAMP_OBJECTS: readonly RampObjectDescription[] = [
  { nameKey: "fileCabinet", imageKey: "cabinet", mass: 100, staticFriction: 0.3, kineticFriction: 0.3, viewScale: 0.4, yOffset: 0 },
  { nameKey: "refrigerator", imageKey: "fridge", mass: 175, staticFriction: 0.5, kineticFriction: 0.5, viewScale: 0.4, yOffset: 0 },
  { nameKey: "piano", imageKey: "piano", mass: 225, staticFriction: 0.4, kineticFriction: 0.4, viewScale: 0.6, yOffset: 20 },
  { nameKey: "crate", imageKey: "crate", mass: 300, staticFriction: 0.7, kineticFriction: 0.7, viewScale: 0.3, yOffset: 0 },
  { nameKey: "sleepyDog", imageKey: "ollie", mass: 15, staticFriction: 0.1, kineticFriction: 0.1, viewScale: 0.3, yOffset: 5 },
];
```

## 3. `scripts/physics-check.ts` (new) + npm script

Add to `package.json` scripts: `"physics-check": "tsx scripts/physics-check.ts"`.

The script imports the engine (`import { … } from "../src/common/model/RampPhysicsEngine.js";`
— tsx resolves the .js specifier to the .ts source) and runs the scenarios below. Structure:
a tiny `check(name, condition, detail?)` helper that logs `PASS name` / `FAIL name (detail)`
and tracks failures; `process.exit(1)` at the end if any failed. `console.log` is allowed in
`scripts/` (Biome override). A step driver:

```ts
interface RunResult {
  state: RampPhysicsState;
  collisions: CollisionInfo[];
  trace: RampPhysicsState[]; // end state of each step
}

function run(
  initial: RampPhysicsState,
  steps: number,
  dt: number,
  appliedForceAt: (stepIndex: number) => number,
): RunResult {
  let previousEnd = initial;
  const collisions: CollisionInfo[] = [];
  const trace: RampPhysicsState[] = [];
  for (let i = 0; i < steps; i++) {
    const current = { ...previousEnd, appliedForce: appliedForceAt(i) };
    const result = stepPhysics(current, previousEnd, dt);
    if (result.collision !== null) {
      collisions.push(result.collision);
    }
    previousEnd = result.state;
    trace.push(result.state);
  }
  return { state: previousEnd, collisions, trace };
}
```

Helpers for tolerance: `approx(a, b, eps = 1e-9)`.

### Scenarios (implement all; expected values are exact)

1. **Static hold** — `createInitialState()`, 300 steps, dt = 1/60, applied = 0.
   Assert every step (use the trace): `velocity === 0`, `positionInSurface === 10`,
   `netParallel === 0`, and `frictionParallel === -gravityParallel`
   (≈ +170.1752 N: gravityParallel = −100·9.8·sin 10° ≈ −170.1752).

2. **Break-away threshold** — breakaway force = μ·N + mg·sinθ
   = 0.3·(100·9.8·cos 10°) + 100·9.8·sin 10° ≈ 289.5335 + 170.1752 = 459.7087 N.
   (a) applied = 459 for 60 steps (dt 1/60): block never moves (velocity 0 throughout).
   (b) applied = 460 for 60 steps: final velocity > 0 and position > 10.

3. **Frictionless slide** — initial state with `staticFriction: 0, kineticFriction: 0,`
   `rampAngle: 30 * Math.PI / 180`, re-`setupForces` + `initWorks` applied; 100 steps,
   dt = 0.01, applied = 0. Assert final `velocity ≈ -4.9` (= −g·sin30°·1 s, eps 1e-9),
   `thermalEnergy === 0`, and at every step `|getTotalEnergy(s) - s.appliedWork| < 1e-9`.

4. **Invariant soak (friction)** — `createInitialState()`, 600 steps, dt = 1/60,
   applied(i) = `500 * Math.sin(i / 20)`. Every step assert:
   `|getTotalEnergy(s) - s.appliedWork| < 1e-6`, `|getKineticEnergy(s) - getTotalWork(s)| < 1e-6`,
   `Number.isFinite` on all numeric fields, and `0 <= getGlobalPosition(s) <= 21`.

5. **Wall collision (ramp top)** — frictionless state (μ=0/0, angle 10°), velocity +12,
   positionInSurface 12; run 120 steps dt = 1/60, applied = 0. Assert: exactly one or more
   collisions occurred; at the step of first collision the state has
   `positionInSurface === 15` and `velocity === 0`; first collision `momentumChange < 0`
   with `|momentumChange| ≈ 100·vBefore` (use the recorded value: `|dp| > 1000`);
   thermal energy increased by the KE just before impact (`thermalEnergy > 5000` after);
   and afterwards gravity pulls the block back down (final velocity < 0).

6. **Wall collision (ground left end)** — frictionless, surface "ground",
   positionInSurface 3, velocity −5, angle anything; run 120 steps dt = 1/60.
   Assert a collision occurs with end `positionInSurface === 0`, `velocity === 0`.

7. **Surface handoff continuity** — frictionless, ramp, positionInSurface 0.05,
   velocity −2: one step dt = 1/60 ⇒ surface becomes "ground" and
   `|getGlobalPosition(after) - (getGlobalPosition(before) + after.velocity * dt)| < 1e-9`.
   Mirror case ground→ramp: ground, positionInSurface 5.97, velocity +2.

8. **clearHeat** — take the end state of scenario 4, apply `clearHeat`; assert
   `thermalEnergy === 0`, `frictiveWork === 0`, `|getTotalEnergy - appliedWork| < 1e-9`.

9. **Snapshot determinism** — run scenario-4 setup for 100 steps recording the trace;
   then restart from the trace state at index 49 (with `previousEnd` = trace[49]) and re-run
   steps 50…99 with the same applied schedule; assert every numeric field of every re-run
   state equals the original trace exactly (`===`, no tolerance). This is what makes
   record/playback faithful.

## Acceptance criteria

1. `npm run physics-check` prints PASS for all scenarios and exits 0.
2. `npm run check` passes — note `tsconfig.scripts.json` only `include`s `scripts/`, but tsc
   follows the import into `src/common/model/`; the engine compiles under `types: ["node"]`
   because it imports nothing browser-specific.
3. `npm run lint && npm run build` pass; `npm run dev` still boots (engine is not yet wired
   into the screens).
