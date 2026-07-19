import { describe, expect, it } from "vitest";
import {
  createInitialState,
  getPotentialEnergy,
  setupForces,
  stepPhysics,
} from "../../../src/common/model/RampPhysicsEngine.js";

describe("RampPhysicsEngine", () => {
  it("has zero acceleration at rest with no applied force", () => {
    const state = setupForces(createInitialState());

    expect(state.velocity).toBeCloseTo(0, 6);
    expect(state.appliedForce).toBeCloseTo(0, 6);
    expect(state.acceleration).toBeCloseTo(0, 6);
  });

  it("has nonzero acceleration when a large force is applied", () => {
    const atRest = createInitialState();
    const pushed = setupForces({ ...atRest, appliedForce: 50_000 });

    expect(pushed.acceleration).not.toBeCloseTo(0, 3);
    expect(Math.abs(pushed.acceleration)).toBeGreaterThan(0);
  });

  it("gravityParallel is negative on a frictionless ramp (downslope)", () => {
    const state = setupForces({
      ...createInitialState(),
      staticFriction: 0,
      kineticFriction: 0,
      appliedForce: 0,
    });

    expect(state.gravityParallel).toBeLessThan(0);
    expect(state.netParallel).toBeLessThan(0);
  });

  it("stepPhysics increases speed down a frictionless ramp", () => {
    const start = setupForces({
      ...createInitialState(),
      staticFriction: 0,
      kineticFriction: 0,
      appliedForce: 0,
      velocity: 0,
    });
    const { state: after } = stepPhysics(start, start, 0.05);

    expect(after.velocity).toBeLessThan(0);
    expect(getPotentialEnergy(after)).toBeLessThan(getPotentialEnergy(start));
  });
});
