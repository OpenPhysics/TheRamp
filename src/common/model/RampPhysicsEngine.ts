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
      // Use KE at impact (v just before the wall stopped the block), not KE at step start.
      // When a large force accelerates the block into the wall in one step the two can
      // differ significantly — using the wrong value understates thermal energy.
      thermalEnergy += 0.5 * s.mass * boundary.velocityBeforeStop * boundary.velocityBeforeStop;
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
