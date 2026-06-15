/**
 * RampColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import RampColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import RampColors from "../../RampColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: RampColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the RampColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import RampNamespace from "./RampNamespace.js";

const RampColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(RampNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(RampNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(RampNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(RampNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(RampNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Applied force vector and applied-work bar color. */
  appliedForceColorProperty: new ProfileColorProperty(RampNamespace, "appliedForce", {
    default: "#EC9937",
    projector: "#C97A1B",
  }),

  /** Gravity (weight) force vector color. */
  gravityForceColorProperty: new ProfileColorProperty(RampNamespace, "gravityForce", {
    default: "#3282D7",
    projector: "#1F66B5",
  }),

  /** Normal force vector color. */
  normalForceColorProperty: new ProfileColorProperty(RampNamespace, "normalForce", {
    default: "#FF00FF",
    projector: "#C400C4",
  }),

  /** Friction force vector color. */
  frictionForceColorProperty: new ProfileColorProperty(RampNamespace, "frictionForce", {
    default: "#FF0000",
    projector: "#D40000",
  }),

  /** Wall reaction force vector color. */
  wallForceColorProperty: new ProfileColorProperty(RampNamespace, "wallForce", {
    default: "#BEBE00",
    projector: "#8F8F00",
  }),

  /** Net (total) force vector color. */
  totalForceColorProperty: new ProfileColorProperty(RampNamespace, "totalForce", {
    default: "#00CC1A",
    projector: "#009913",
  }),

  /** Kinetic energy bar and plot series color. */
  kineticEnergyColorProperty: new ProfileColorProperty(RampNamespace, "kineticEnergy", {
    default: "#00CC1A",
    projector: "#009913",
  }),

  /** Potential energy bar and plot series color. */
  potentialEnergyColorProperty: new ProfileColorProperty(RampNamespace, "potentialEnergy", {
    default: "#3282D7",
    projector: "#1F66B5",
  }),

  /** Thermal energy bar and plot series color. */
  thermalEnergyColorProperty: new ProfileColorProperty(RampNamespace, "thermalEnergy", {
    default: "#FF0000",
    projector: "#D40000",
  }),

  /** Total energy bar color. */
  totalEnergyColorProperty: new ProfileColorProperty(RampNamespace, "totalEnergy", {
    default: "#EC9937",
    projector: "#C97A1B",
  }),

  /** Applied work bar color. */
  appliedWorkColorProperty: new ProfileColorProperty(RampNamespace, "appliedWork", {
    default: "#EC9937",
    projector: "#C97A1B",
  }),

  /** Gravity work bar color. */
  gravityWorkColorProperty: new ProfileColorProperty(RampNamespace, "gravityWork", {
    default: "#3282D7",
    projector: "#1F66B5",
  }),

  /** Friction work bar color. */
  frictionWorkColorProperty: new ProfileColorProperty(RampNamespace, "frictionWork", {
    default: "#FF0000",
    projector: "#D40000",
  }),

  /** Total work bar color. */
  totalWorkColorProperty: new ProfileColorProperty(RampNamespace, "totalWork", {
    default: "#00CC1A",
    projector: "#009913",
  }),

  /** Sky background fill above the ground line. */
  skyColorProperty: new ProfileColorProperty(RampNamespace, "sky", {
    default: "#A5DCFC",
    projector: "#D6EEFF",
  }),

  /** Earth/ground background fill below the ground line. */
  earthColorProperty: new ProfileColorProperty(RampNamespace, "earth", {
    default: "#96C88C",
    projector: "#96C88C",
  }),

  /** Ramp surface fill (normal temperature). */
  rampSurfaceColorProperty: new ProfileColorProperty(RampNamespace, "rampSurface", {
    default: "#C68642",
    projector: "#B5793A",
  }),

  /** Ramp surface fill when overheated. */
  rampSurfaceHotColorProperty: new ProfileColorProperty(RampNamespace, "rampSurfaceHot", {
    default: "#FF3300",
    projector: "#FF3300",
  }),

  /** Barrier/wall rectangle fill. */
  barrierColorProperty: new ProfileColorProperty(RampNamespace, "barrier", {
    default: "#AA4A3C",
    projector: "#995040",
  }),

  /** Time plot and bar chart background. */
  chartBackgroundColorProperty: new ProfileColorProperty(RampNamespace, "chartBackground", {
    default: "#FFFFFF",
    projector: "#FFFFFF",
  }),

  /** Time plot grid line color. */
  chartGridColorProperty: new ProfileColorProperty(RampNamespace, "chartGrid", {
    default: "#CCCCCC",
    projector: "#AAAAAA",
  }),

  /** World readout text (angle, height, speed on sky/earth). */
  readoutTextColorProperty: new ProfileColorProperty(RampNamespace, "readoutText", {
    default: "#1A1A1A",
    projector: "#1A1A1A",
  }),

  /** Snowflake stroke on the "cool ramp" button. */
  coolRampSnowflakeColorProperty: new ProfileColorProperty(RampNamespace, "coolRampSnowflake", {
    default: "#3399FF",
    projector: "#1F66B5",
  }),
};

export default RampColors;
