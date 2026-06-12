/**
 * physics-check.ts
 *
 * Node-run verification scenarios for RampPhysicsEngine.
 */
import {
  type CollisionInfo,
  clearHeat,
  createInitialState,
  getGlobalPosition,
  getKineticEnergy,
  getTotalEnergy,
  getTotalWork,
  initWorks,
  type RampPhysicsState,
  setupForces,
  stepPhysics,
} from "../src/common/model/RampPhysicsEngine.js";

let failures = 0;

function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.log(`FAIL ${name}${detail ? ` (${detail})` : ""}`);
  }
}

function approx(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

interface RunResult {
  state: RampPhysicsState;
  collisions: CollisionInfo[];
  trace: RampPhysicsState[];
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

function isFiniteState(s: RampPhysicsState): boolean {
  return (
    Number.isFinite(s.positionInSurface) &&
    Number.isFinite(s.velocity) &&
    Number.isFinite(s.acceleration) &&
    Number.isFinite(s.mass) &&
    Number.isFinite(s.staticFriction) &&
    Number.isFinite(s.kineticFriction) &&
    Number.isFinite(s.rampAngle) &&
    Number.isFinite(s.appliedForce) &&
    Number.isFinite(s.zeroPointY) &&
    Number.isFinite(s.appliedWork) &&
    Number.isFinite(s.gravityWork) &&
    Number.isFinite(s.frictiveWork) &&
    Number.isFinite(s.thermalEnergy) &&
    Number.isFinite(s.appliedParallel) &&
    Number.isFinite(s.gravityParallel) &&
    Number.isFinite(s.frictionParallel) &&
    Number.isFinite(s.wallParallel) &&
    Number.isFinite(s.netParallel) &&
    Number.isFinite(s.normalPerpendicular)
  );
}

function statesEqual(a: RampPhysicsState, b: RampPhysicsState): boolean {
  return (
    a.surface === b.surface &&
    a.positionInSurface === b.positionInSurface &&
    a.velocity === b.velocity &&
    a.acceleration === b.acceleration &&
    a.mass === b.mass &&
    a.staticFriction === b.staticFriction &&
    a.kineticFriction === b.kineticFriction &&
    a.rampAngle === b.rampAngle &&
    a.appliedForce === b.appliedForce &&
    a.zeroPointY === b.zeroPointY &&
    a.appliedWork === b.appliedWork &&
    a.gravityWork === b.gravityWork &&
    a.frictiveWork === b.frictiveWork &&
    a.thermalEnergy === b.thermalEnergy &&
    a.appliedParallel === b.appliedParallel &&
    a.gravityParallel === b.gravityParallel &&
    a.frictionParallel === b.frictionParallel &&
    a.wallParallel === b.wallParallel &&
    a.netParallel === b.netParallel &&
    a.normalPerpendicular === b.normalPerpendicular
  );
}

// 1. Static hold
function scenarioStaticHold(): void {
  const dt = 1 / 60;
  const result = run(createInitialState(), 300, dt, () => 0);
  let ok = true;
  for (const s of result.trace) {
    if (s.velocity !== 0) {
      ok = false;
      break;
    }
    if (s.positionInSurface !== 10) {
      ok = false;
      break;
    }
    if (s.netParallel !== 0) {
      ok = false;
      break;
    }
    if (!approx(s.frictionParallel, -s.gravityParallel)) {
      ok = false;
      break;
    }
  }
  check("static hold", ok);
}

// 2. Break-away threshold
function scenarioBreakaway(): void {
  const dt = 1 / 60;
  const below = run(createInitialState(), 60, dt, () => 459);
  let belowOk = true;
  for (const s of below.trace) {
    if (s.velocity !== 0) {
      belowOk = false;
      break;
    }
  }
  check("breakaway below threshold", belowOk);

  const above = run(createInitialState(), 60, dt, () => 460);
  const final = above.state;
  check(
    "breakaway above threshold",
    final.velocity > 0 && final.positionInSurface > 10,
    `v=${final.velocity}, pos=${final.positionInSurface}`,
  );
}

// 3. Frictionless slide
function scenarioFrictionlessSlide(): void {
  let initial = createInitialState();
  initial = {
    ...initial,
    staticFriction: 0,
    kineticFriction: 0,
    rampAngle: (30 * Math.PI) / 180,
  };
  initial = initWorks(setupForces(initial));

  const dt = 0.01;
  const result = run(initial, 100, dt, () => 0);
  const final = result.state;

  check("frictionless slide velocity", approx(final.velocity, -4.9));
  check("frictionless slide thermal", final.thermalEnergy === 0);

  let invariantOk = true;
  for (const s of result.trace) {
    if (!approx(getTotalEnergy(s), s.appliedWork)) {
      invariantOk = false;
      break;
    }
  }
  check("frictionless slide energy invariant", invariantOk);
}

// 4. Invariant soak (friction)
function scenarioInvariantSoak(): void {
  const dt = 1 / 60;
  const result = run(createInitialState(), 600, dt, (i) => 500 * Math.sin(i / 20));

  let ok = true;
  for (const s of result.trace) {
    if (!approx(getTotalEnergy(s), s.appliedWork, 1e-6)) {
      ok = false;
      break;
    }
    if (!approx(getKineticEnergy(s), getTotalWork(s), 1e-6)) {
      ok = false;
      break;
    }
    if (!isFiniteState(s)) {
      ok = false;
      break;
    }
    const gp = getGlobalPosition(s);
    if (gp < 0 || gp > 21) {
      ok = false;
      break;
    }
  }
  check("invariant soak", ok);
}

// 5. Wall collision (ramp top)
function scenarioWallCollisionRampTop(): void {
  let initial = createInitialState();
  initial = {
    ...initial,
    staticFriction: 0,
    kineticFriction: 0,
    rampAngle: (10 * Math.PI) / 180,
    positionInSurface: 12,
    velocity: 12,
  };
  initial = initWorks(setupForces(initial));

  const dt = 1 / 60;
  const result = run(initial, 120, dt, () => 0);

  check("ramp top collision occurred", result.collisions.length > 0);

  const firstCollisionIndex = result.trace.findIndex(
    (s) => s.positionInSurface === 15 && s.velocity === 0 && s.surface === "ramp",
  );
  check("ramp top collision position", firstCollisionIndex >= 0);

  const firstCollision = result.collisions[0];
  check(
    "ramp top momentum change",
    firstCollision !== undefined && firstCollision.momentumChange < 0 && Math.abs(firstCollision.momentumChange) > 1000,
    firstCollision !== undefined ? `dp=${firstCollision.momentumChange}` : "no collision",
  );

  const thermalAfterCollision = result.trace[firstCollisionIndex]?.thermalEnergy ?? 0;
  check("ramp top thermal after collision", thermalAfterCollision > 5000);

  check("ramp top gravity pulls back", result.state.velocity < 0);
}

// 6. Wall collision (ground left end)
function scenarioWallCollisionGroundLeft(): void {
  let initial = createInitialState();
  initial = {
    ...initial,
    staticFriction: 0,
    kineticFriction: 0,
    surface: "ground",
    positionInSurface: 3,
    velocity: -5,
  };
  initial = initWorks(setupForces(initial));

  const dt = 1 / 60;
  const result = run(initial, 120, dt, () => 0);

  check("ground left collision occurred", result.collisions.length > 0);
  check("ground left collision end state", result.state.positionInSurface === 0 && result.state.velocity === 0);
}

// 7. Surface handoff continuity
function scenarioSurfaceHandoff(): void {
  const dt = 1 / 60;

  // Doc values 0.05 / −2: one Euler step stays on ramp; continuity formula still holds.
  let rampDoc = createInitialState();
  rampDoc = {
    ...rampDoc,
    staticFriction: 0,
    kineticFriction: 0,
    positionInSurface: 0.05,
    velocity: -2,
  };
  rampDoc = initWorks(setupForces(rampDoc));
  const beforeDoc = getGlobalPosition(rampDoc);
  const docResult = stepPhysics(rampDoc, rampDoc, dt);
  const afterDoc = docResult.state;
  check(
    "surface handoff ramp continuity (doc values)",
    approx(getGlobalPosition(afterDoc), beforeDoc + afterDoc.velocity * dt),
  );

  // Crossing hinge: 0.02 m at −2 m/s transfers to ground with global continuity.
  let rampInitial = createInitialState();
  rampInitial = {
    ...rampInitial,
    staticFriction: 0,
    kineticFriction: 0,
    positionInSurface: 0.02,
    velocity: -2,
  };
  rampInitial = initWorks(setupForces(rampInitial));

  const beforeGlobal = getGlobalPosition(rampInitial);
  const rampResult = stepPhysics(rampInitial, rampInitial, dt);
  const after = rampResult.state;
  const continuityRamp =
    after.surface === "ground" && approx(getGlobalPosition(after), beforeGlobal + after.velocity * dt);
  check("surface handoff ramp to ground", continuityRamp);

  let groundInitial = createInitialState();
  groundInitial = {
    ...groundInitial,
    staticFriction: 0,
    kineticFriction: 0,
    surface: "ground",
    positionInSurface: 5.97,
    velocity: 2,
  };
  groundInitial = initWorks(setupForces(groundInitial));

  const beforeGlobalGround = getGlobalPosition(groundInitial);
  const groundResult = stepPhysics(groundInitial, groundInitial, dt);
  const afterGround = groundResult.state;
  const continuityGround =
    afterGround.surface === "ramp" &&
    approx(getGlobalPosition(afterGround), beforeGlobalGround + afterGround.velocity * dt);
  check("surface handoff ground to ramp", continuityGround);
}

// 8. clearHeat
function scenarioClearHeat(): void {
  const dt = 1 / 60;
  const soak = run(createInitialState(), 600, dt, (i) => 500 * Math.sin(i / 20));
  const cleared = clearHeat(soak.state);

  check("clearHeat thermal", cleared.thermalEnergy === 0);
  check("clearHeat frictiveWork", cleared.frictiveWork === 0);
  check("clearHeat energy invariant", approx(getTotalEnergy(cleared), cleared.appliedWork));
}

// 9. Snapshot determinism
function scenarioSnapshotDeterminism(): void {
  const dt = 1 / 60;
  const applied = (i: number) => 500 * Math.sin(i / 20);
  const original = run(createInitialState(), 100, dt, applied);

  const restartState = original.trace[49];
  if (!restartState) {
    check("snapshot determinism", false, "missing trace[49]");
    return;
  }

  let previousEnd = restartState;
  const replayTrace: RampPhysicsState[] = [];
  for (let i = 50; i < 100; i++) {
    const current = { ...previousEnd, appliedForce: applied(i) };
    const result = stepPhysics(current, previousEnd, dt);
    previousEnd = result.state;
    replayTrace.push(result.state);
  }

  let ok = true;
  for (let i = 0; i < replayTrace.length; i++) {
    const orig = original.trace[50 + i];
    const replay = replayTrace[i];
    if (orig === undefined || replay === undefined || !statesEqual(orig, replay)) {
      ok = false;
      break;
    }
  }
  check("snapshot determinism", ok);
}

scenarioStaticHold();
scenarioBreakaway();
scenarioFrictionlessSlide();
scenarioInvariantSoak();
scenarioWallCollisionRampTop();
scenarioWallCollisionGroundLeft();
scenarioSurfaceHandoff();
scenarioClearHeat();
scenarioSnapshotDeterminism();

if (failures > 0) {
  console.log(`${failures} scenario(s) failed`);
  process.exit(1);
} else {
  console.log("All scenarios passed");
}
