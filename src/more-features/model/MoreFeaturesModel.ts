/**
 * MoreFeaturesModel.ts
 *
 * The top-level model for the More Features screen — the advanced of The Ramp's
 * two screens (the Java "Ramp" / advanced-features module).
 *
 * Add the simulation's state here using reactive Property objects from
 * scenerystack/axon. The view observes these properties and updates automatically.
 *
 * ── Example ──────────────────────────────────────────────────────────────────
 *   import { BooleanProperty, NumberProperty } from "scenerystack/axon";
 *
 *   public readonly isRunningProperty = new BooleanProperty(false);
 *   public readonly rampAngleProperty = new NumberProperty(Math.PI / 6); // radians
 *
 * ── Step cycle ────────────────────────────────────────────────────────────────
 * The Sim calls step(dt) on every animation frame. Advance the model state
 * in that method (e.g. integrate equations, update positions).
 *
 * ── Reset ─────────────────────────────────────────────────────────────────────
 * reset() is called when the user presses Reset All. Call .reset() on every
 * Property declared here.
 */
import type { TModel } from "scenerystack/joist";

export class MoreFeaturesModel implements TModel {
  /**
   * Resets all model state to initial values.
   * Called when the user presses the Reset All button.
   */
  public reset(): void {
    // TODO: call .reset() on every Property declared in this model
  }

  /**
   * Steps the model forward by dt seconds.
   * Called every animation frame by the Sim framework.
   *
   * @param _dt - elapsed time in seconds since the last frame
   */
  public step(_dt: number): void {
    // TODO: advance simulation state here
  }
}
