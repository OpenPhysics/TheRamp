/**
 * TheRampColors.ts
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
 * Import TheRampColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import TheRampColors from "../../TheRampColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: TheRampColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the TheRampColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import TheRampNamespace from "./TheRampNamespace.js";

const TheRampColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(TheRampNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(TheRampNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(TheRampNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(TheRampNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(TheRampNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Applied force vector and applied-work bar color. */
  appliedForceColorProperty: new ProfileColorProperty(TheRampNamespace, "appliedForce", {
    // Darkened from PhET Java #EC9937 for ≥3:1 contrast on white chart backgrounds.
    default: "#C8821C",
    projector: "#A86A14",
  }),

  /** Gravity (weight) force vector color. */
  gravityForceColorProperty: new ProfileColorProperty(TheRampNamespace, "gravityForce", {
    default: "#3282D7",
    projector: "#1F66B5",
  }),

  /** Normal force vector color. */
  normalForceColorProperty: new ProfileColorProperty(TheRampNamespace, "normalForce", {
    default: "#FF00FF",
    projector: "#C400C4",
  }),

  /** Friction force vector color. */
  frictionForceColorProperty: new ProfileColorProperty(TheRampNamespace, "frictionForce", {
    default: "#FF0000",
    projector: "#D40000",
  }),

  /** Wall reaction force vector color. */
  wallForceColorProperty: new ProfileColorProperty(TheRampNamespace, "wallForce", {
    // Darkened from PhET Java #BEBE00 for ≥3:1 contrast on white chart backgrounds.
    default: "#969600",
    projector: "#6E6E00",
  }),

  /** Net (total) force vector color. */
  totalForceColorProperty: new ProfileColorProperty(TheRampNamespace, "totalForce", {
    // Darkened from PhET Java #00CC1A for ≥3:1 contrast on white chart backgrounds.
    default: "#00A816",
    projector: "#007A0E",
  }),

  /** Kinetic energy bar and plot series color. */
  kineticEnergyColorProperty: new ProfileColorProperty(TheRampNamespace, "kineticEnergy", {
    default: "#00A816",
    projector: "#007A0E",
  }),

  /** Potential energy bar and plot series color. */
  potentialEnergyColorProperty: new ProfileColorProperty(TheRampNamespace, "potentialEnergy", {
    default: "#3282D7",
    projector: "#1F66B5",
  }),

  /** Thermal energy bar and plot series color. */
  thermalEnergyColorProperty: new ProfileColorProperty(TheRampNamespace, "thermalEnergy", {
    default: "#FF0000",
    projector: "#D40000",
  }),

  /** Total energy bar color. */
  totalEnergyColorProperty: new ProfileColorProperty(TheRampNamespace, "totalEnergy", {
    default: "#C8821C",
    projector: "#A86A14",
  }),

  /** Applied work bar color. */
  appliedWorkColorProperty: new ProfileColorProperty(TheRampNamespace, "appliedWork", {
    default: "#C8821C",
    projector: "#A86A14",
  }),

  /** Gravity work bar color. */
  gravityWorkColorProperty: new ProfileColorProperty(TheRampNamespace, "gravityWork", {
    default: "#3282D7",
    projector: "#1F66B5",
  }),

  /** Friction work bar color. */
  frictionWorkColorProperty: new ProfileColorProperty(TheRampNamespace, "frictionWork", {
    default: "#FF0000",
    projector: "#D40000",
  }),

  /** Total work bar color. */
  totalWorkColorProperty: new ProfileColorProperty(TheRampNamespace, "totalWork", {
    default: "#00A816",
    projector: "#007A0E",
  }),

  /** Sky background fill above the ground line. */
  skyColorProperty: new ProfileColorProperty(TheRampNamespace, "sky", {
    default: "#A5DCFC",
    projector: "#D6EEFF",
  }),

  /** Earth/ground background fill below the ground line. */
  earthColorProperty: new ProfileColorProperty(TheRampNamespace, "earth", {
    default: "#96C88C",
    projector: "#96C88C",
  }),

  /** Ramp surface fill (normal temperature). */
  rampSurfaceColorProperty: new ProfileColorProperty(TheRampNamespace, "rampSurface", {
    default: "#C68642",
    projector: "#B5793A",
  }),

  /** Ramp surface fill when overheated. */
  rampSurfaceHotColorProperty: new ProfileColorProperty(TheRampNamespace, "rampSurfaceHot", {
    default: "#FF3300",
    projector: "#FF3300",
  }),

  /** Barrier/wall rectangle fill. */
  barrierColorProperty: new ProfileColorProperty(TheRampNamespace, "barrier", {
    default: "#AA4A3C",
    projector: "#995040",
  }),

  /** Time plot and bar chart background. */
  chartBackgroundColorProperty: new ProfileColorProperty(TheRampNamespace, "chartBackground", {
    default: "#FFFFFF",
    projector: "#FFFFFF",
  }),

  /** Time plot grid line color. */
  chartGridColorProperty: new ProfileColorProperty(TheRampNamespace, "chartGrid", {
    default: "#CCCCCC",
    projector: "#AAAAAA",
  }),

  /** World readout text (angle, height, speed on sky/earth). */
  readoutTextColorProperty: new ProfileColorProperty(TheRampNamespace, "readoutText", {
    default: "#1A1A1A",
    projector: "#1A1A1A",
  }),

  /** Snowflake stroke on the "cool ramp" button. */
  coolRampSnowflakeColorProperty: new ProfileColorProperty(TheRampNamespace, "coolRampSnowflake", {
    default: "#3399FF",
    projector: "#1F66B5",
  }),

  /** Translucent fill of the pie-sector arc showing the current ramp angle. */
  angleArcFillColorProperty: new ProfileColorProperty(TheRampNamespace, "angleArcFill", {
    default: "rgba(255,255,255,0.18)",
    projector: "rgba(0,0,0,0.10)",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(TheRampNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(TheRampNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(TheRampNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  /**
   * Base fill for chart zoom-in/zoom-out buttons.
   * Matches sun ColorConstants.LIGHT_BLUE (rgb 153,206,255); slightly deeper in projector mode.
   */
  zoomButtonColorProperty: new ProfileColorProperty(TheRampNamespace, "zoomButton", {
    default: "#99CEFF",
    projector: "#6BB0E8",
  }),
};

export default TheRampColors;
