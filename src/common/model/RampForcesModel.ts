/**
 * RampForcesModel.ts
 *
 * Groups the six parallel/perpendicular force output Properties into a single
 * namespace so view code can receive `model.forces` instead of the whole model.
 * RampModel owns this instance and calls `set()` inside the `isWritingState`
 * guard after every force recompute.
 */
import { NumberProperty } from "scenerystack/axon";
import type { RampPhysicsState } from "./RampPhysicsEngine.js";

export class RampForcesModel {
  /** Applied force component parallel to the surface (N). */
  public readonly appliedParallelProperty = new NumberProperty(0);
  /** Gravity component parallel to the surface (N, negative = down-ramp). */
  public readonly gravityParallelProperty = new NumberProperty(0);
  /** Kinetic or static friction component parallel to the surface (N). */
  public readonly frictionParallelProperty = new NumberProperty(0);
  /** Wall reaction force parallel to the surface (N). */
  public readonly wallParallelProperty = new NumberProperty(0);
  /** Net force parallel to the surface = sum of all parallel components (N). */
  public readonly netParallelProperty = new NumberProperty(0);
  /** Normal force perpendicular to the surface (N). */
  public readonly normalPerpendicularProperty = new NumberProperty(0);

  /** Batch-write all six components from a physics state snapshot. */
  public set(state: RampPhysicsState): void {
    this.appliedParallelProperty.value = state.appliedParallel;
    this.gravityParallelProperty.value = state.gravityParallel;
    this.frictionParallelProperty.value = state.frictionParallel;
    this.wallParallelProperty.value = state.wallParallel;
    this.netParallelProperty.value = state.netParallel;
    this.normalPerpendicularProperty.value = state.normalPerpendicular;
  }
}
