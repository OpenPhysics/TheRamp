/**
 * RampEnergyModel.ts
 *
 * Groups the eight energy and work output Properties into a single namespace so
 * view code can receive `model.energy` instead of the whole model.
 * RampModel owns this instance and calls `setAll()` inside the `isWritingState`
 * guard after every physics step or playback restore.
 * During a static force-only recompute (`setupForcesOnly`) RampModel writes the
 * three computable terms (KE, PE, total) directly on this object's properties;
 * the accumulation terms (thermal, applied/gravity/fractive work, total work)
 * are unchanged in that case and are intentionally left alone.
 */
import { NumberProperty } from "scenerystack/axon";
import {
  getKineticEnergy,
  getPotentialEnergy,
  getTotalEnergy,
  getTotalWork,
  type RampPhysicsState,
} from "./RampPhysicsEngine.js";

export class RampEnergyModel {
  /** Translational kinetic energy ½mv² (J). */
  public readonly kineticEnergyProperty = new NumberProperty(0);
  /** Gravitational potential energy mgh (J, relative to zeroPointY). */
  public readonly potentialEnergyProperty = new NumberProperty(0);
  /** Accumulated thermal energy from friction and inelastic collisions (J). */
  public readonly thermalEnergyProperty = new NumberProperty(0);
  /** Total mechanical + thermal energy KE + PE + thermal (J). */
  public readonly totalEnergyProperty = new NumberProperty(0);

  /** Cumulative work done by the applied force (J). */
  public readonly appliedWorkProperty = new NumberProperty(0);
  /** Cumulative work done by gravity (J). */
  public readonly gravityWorkProperty = new NumberProperty(0);
  /** Cumulative work done by friction (J, negative when friction dissipates energy). */
  public readonly frictiveWorkProperty = new NumberProperty(0);
  /** Total work = applied + gravity + fractive (J). */
  public readonly totalWorkProperty = new NumberProperty(0);

  /**
   * Full batch-write from a physics state snapshot.
   * Called after every physics step, playback restore, and on reset.
   */
  public setAll(state: RampPhysicsState): void {
    this.kineticEnergyProperty.value = getKineticEnergy(state);
    this.potentialEnergyProperty.value = getPotentialEnergy(state);
    this.thermalEnergyProperty.value = state.thermalEnergy;
    this.totalEnergyProperty.value = getTotalEnergy(state);
    this.appliedWorkProperty.value = state.appliedWork;
    this.gravityWorkProperty.value = state.gravityWork;
    this.frictiveWorkProperty.value = state.frictiveWork;
    this.totalWorkProperty.value = getTotalWork(state);
  }
}
