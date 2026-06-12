/**
 * RampPhysicsConstants.ts
 *
 * Numeric constants for the ramp physics. ZERO imports — this module is shared
 * by the pure physics engine and runs under Node in scripts/physics-check.ts.
 */

/** Gravitational acceleration, m/s^2 */
export const GRAVITY = 9.8;

/** Length of the inclined ramp, m */
export const RAMP_LENGTH = 15.0;

/** Length of the flat ground segment to the left of the ramp, m */
export const GROUND_LENGTH = 6.0;

/** x-coordinate of the left end of the ground; the ramp is hinged at the origin */
export const GROUND_ORIGIN_X = -6.0;

/** Ramp angle after reset, radians (10 degrees) */
export const INITIAL_RAMP_ANGLE = (10 * Math.PI) / 180;

/** Block position along the ramp after reset, m (global position 16) */
export const INITIAL_POSITION_IN_SURFACE = 10.0;

/** Upper clamp on a single integration step, s */
export const MAX_DT = 0.2;

/** Maximum record/playback duration, s */
export const MAX_RECORDING_TIME = 30;

/** Thermal energy at which the "Overheated." indicator appears, J */
export const OVERHEAT_THERMAL_ENERGY = 50000;
