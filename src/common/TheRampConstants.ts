/**
 * TheRampConstants.ts
 *
 * View-layer constants for The Ramp. Physics constants live in
 * common/model/RampPhysicsConstants.ts (zero-import file) and are re-exported
 * here for convenience.
 */
import { Range, Vector2 } from "scenerystack/dot";

export * from "./model/RampPhysicsConstants.js";

/** Ramp angle control range, radians */
export const ANGLE_RANGE = new Range(0, Math.PI / 2);

/** Global block position range, m (0 = ground left wall, 21 = ramp top) */
export const POSITION_RANGE = new Range(0, 21);

/** Applied force control range, N */
export const APPLIED_FORCE_RANGE = new Range(-1000, 1000);

/** Coefficient-of-friction slider range (sets both mu_s and mu_k) */
export const FRICTION_RANGE = new Range(0.1, 1.5);

/** Mass slider range, kg (More Features screen) */
export const MASS_RANGE = new Range(100, 500);

/** Model-view scale, view px per model meter */
export const MODEL_VIEW_SCALE = 26;

/** Visual thickness of the ramp board, px */
export const RAMP_BOARD_THICKNESS = 12;

/** View position of the model origin (the ramp hinge / base) */
export const WORLD_VIEW_ORIGIN = new Vector2(200, 390);

/** World force-arrow scale, px per N */
export const FORCE_ARROW_SCALE = 0.06;

/** Free-body-diagram force scale, px per N */
export const FBD_FORCE_SCALE = 1 / 20;

/** Free-body-diagram panel size, px */
export const FBD_SIZE = 200;

/** Block drag: applied newtons per pixel of horizontal drag */
export const APPLIED_FORCE_PER_PIXEL = 1 / 1.2;

/** FBD drag: applied newtons per pixel of horizontal drag */
export const FBD_FORCE_PER_PIXEL = 20;

/** Bar chart scale, px per J */
export const ENERGY_BAR_SCALE = 0.005;

/** Y range of the energy and work time plots, J */
export const PLOT_ENERGY_RANGE = new Range(-30000, 30000);

/** Y range of the parallel-forces time plot, N */
export const PLOT_FORCE_RANGE = new Range(-1000, 1000);

/** Margin between screen-view edge and content, px */
export const SCREEN_VIEW_MARGIN = 10;
