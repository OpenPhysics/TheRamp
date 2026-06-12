/**
 * IntroModel.ts
 *
 * The top-level model for the Introduction screen — the simpler of The Ramp's
 * two screens (the Java "Simple Ramp" module).
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
import { RampModel } from "../../common/model/RampModel.js";

export class IntroModel extends RampModel {}
