/**
 * RampPreferencesModel.ts
 *
 * Model for The Ramp's simulation-specific preferences (shown in
 * Preferences → Simulation). Each preference Property takes its initial value
 * from the corresponding query parameter in rampQueryParameters.
 *
 * These preferences define the defaults applied when a screen's model is
 * constructed and when Reset All is pressed.
 */

import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { Tandem } from "scenerystack/tandem";
import RampNamespace from "../RampNamespace.js";
import rampQueryParameters from "./rampQueryParameters.js";

/** Public range of the initial-ramp-angle preference, in degrees. */
export const INITIAL_RAMP_ANGLE_RANGE_DEG = new Range(0, 90);

export class RampPreferencesModel {
  /** Default ramp angle (degrees) used on construction and Reset All. */
  public readonly initialRampAngleProperty: NumberProperty;

  /** Whether the ramp starts frictionless. */
  public readonly frictionlessProperty: BooleanProperty;

  /** Default state of the sound toggle. */
  public readonly soundEnabledProperty: BooleanProperty;

  /** Whether force vectors start broken into parallel components. */
  public readonly showComponentsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.initialRampAngleProperty = new NumberProperty(rampQueryParameters.rampAngle, {
      range: INITIAL_RAMP_ANGLE_RANGE_DEG,
      ...(tandem && { tandem: tandem.createTandem("initialRampAngleProperty") }),
    });

    this.frictionlessProperty = new BooleanProperty(
      rampQueryParameters.frictionless,
      tandem ? { tandem: tandem.createTandem("frictionlessProperty") } : undefined,
    );

    this.soundEnabledProperty = new BooleanProperty(
      rampQueryParameters.soundEnabled,
      tandem ? { tandem: tandem.createTandem("soundEnabledProperty") } : undefined,
    );

    this.showComponentsProperty = new BooleanProperty(
      rampQueryParameters.showComponents,
      tandem ? { tandem: tandem.createTandem("showComponentsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.initialRampAngleProperty.reset();
    this.frictionlessProperty.reset();
    this.soundEnabledProperty.reset();
    this.showComponentsProperty.reset();
  }
}

RampNamespace.register("RampPreferencesModel", RampPreferencesModel);
