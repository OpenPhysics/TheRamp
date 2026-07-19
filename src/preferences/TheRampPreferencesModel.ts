/**
 * TheRampPreferencesModel.ts
 *
 * Model for The Ramp's simulation-specific preferences (shown in
 * Preferences → Simulation). Each preference Property takes its initial value
 * from the corresponding query parameter in theRampQueryParameters.
 *
 * These preferences define the defaults applied when a screen's model is
 * constructed and when Reset All is pressed.
 */

import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { Tandem } from "scenerystack/tandem";
import TheRampNamespace from "../TheRampNamespace.js";
import theRampQueryParameters from "./theRampQueryParameters.js";

/** Public range of the initial-ramp-angle preference, in degrees. */
export const INITIAL_RAMP_ANGLE_RANGE_DEG = new Range(0, 90);

export class TheRampPreferencesModel {
  /** Default ramp angle (degrees) used on construction and Reset All. */
  public readonly initialRampAngleProperty: NumberProperty;

  /** Whether the ramp starts frictionless. */
  public readonly frictionlessProperty: BooleanProperty;

  /** Default state of the sound toggle. */
  public readonly soundEnabledProperty: BooleanProperty;

  /** Whether force vectors start broken into parallel components. */
  public readonly showComponentsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.initialRampAngleProperty = new NumberProperty(theRampQueryParameters.rampAngle, {
      range: INITIAL_RAMP_ANGLE_RANGE_DEG,
      ...(tandem && { tandem: tandem.createTandem("initialRampAngleProperty") }),
    });

    this.frictionlessProperty = new BooleanProperty(
      theRampQueryParameters.frictionless,
      tandem ? { tandem: tandem.createTandem("frictionlessProperty") } : undefined,
    );

    this.soundEnabledProperty = new BooleanProperty(
      theRampQueryParameters.soundEnabled,
      tandem ? { tandem: tandem.createTandem("soundEnabledProperty") } : undefined,
    );

    this.showComponentsProperty = new BooleanProperty(
      theRampQueryParameters.showComponents,
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

TheRampNamespace.register("TheRampPreferencesModel", TheRampPreferencesModel);
