/**
 * TheRampScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for both Ramp screens.
 *
 * Canvas: 100 × 80 units.
 *
 * Intro screen    — block on ramp with a single applied-force arrow + sun detail.
 * More Features   — block on ramp with applied, gravity, and normal force arrows.
 */
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import RampColors from "../RampColors.js";

// ── Canvas dimensions ───────────────────────────────────────────────────────
const W = 100;
const H = 80;

// ── Ramp geometry ───────────────────────────────────────────────────────────
// Hypotenuse vertices: bottom-left → top-right (the slope surface).
const GROUND_Y = 67; // y-coordinate of the flat ground level
const BLX = 10,
  BLY = GROUND_Y; // bottom-left of hypotenuse
const BRX = 92,
  BRY = GROUND_Y; // bottom-right corner
const TRX = 92,
  TRY = 27; // top-right apex

const SLOPE_DX = TRX - BLX; // 82
const SLOPE_DY = TRY - BLY; // -40
const SLOPE_LEN = Math.sqrt(SLOPE_DX ** 2 + SLOPE_DY ** 2);

// Unit vector along slope (pointing up the slope)
const SX = SLOPE_DX / SLOPE_LEN;
const SY = SLOPE_DY / SLOPE_LEN;

// Outward normal unit vector (perpendicular to slope, toward sky)
//   Rotate slope vector 90° CW in screen-space: (dy, -dx) → already negative dx ⟹ toward sky
const NX = SLOPE_DY / SLOPE_LEN; // ≈ −0.436
const NY = -SLOPE_DX / SLOPE_LEN; // ≈ −0.900

// Ramp angle (used to rotate the block so it sits flush on the surface)
const RAMP_ANGLE = Math.atan2(SLOPE_DY, SLOPE_DX);

// ── Block ───────────────────────────────────────────────────────────────────
const BLOCK_SIZE = 11;
const BLOCK_T = 0.43; // fraction along hypotenuse (0 = bottom, 1 = top)

// Point on slope surface at BLOCK_T, then offset half-block-height along outward normal
const blockSX = BLX + BLOCK_T * SLOPE_DX;
const blockSY = BLY + BLOCK_T * SLOPE_DY;
const BLOCK_LIFT = BLOCK_SIZE / 2 + 1;
const BCX = blockSX + BLOCK_LIFT * NX; // block center x ≈ 41
const BCY = blockSY + BLOCK_LIFT * NY; // block center y ≈ 44

// ── Arrow factory ───────────────────────────────────────────────────────────
type ColorProp = typeof RampColors.appliedForceColorProperty;

function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colorProp: ColorProp,
  headSize = 7,
  tailWidth = 3,
): ArrowNode {
  return new ArrowNode(x1, y1, x2, y2, {
    fill: colorProp,
    headHeight: headSize,
    headWidth: headSize,
    tailWidth,
    stroke: null,
  });
}

// ── Shared ramp builder ─────────────────────────────────────────────────────
function buildBase(): Node[] {
  // Sky
  const sky = new Rectangle(0, 0, W, GROUND_Y, 6, 6, { fill: RampColors.skyColorProperty });

  // Earth strip below ground line
  const earth = new Rectangle(0, GROUND_Y, W, H - GROUND_Y, { fill: RampColors.earthColorProperty });

  // Ramp body (solid triangle)
  const rampShape = Shape.polygon([new Vector2(BLX, BLY), new Vector2(BRX, BRY), new Vector2(TRX, TRY)]);
  const rampFill = new Path(rampShape, { fill: RampColors.rampSurfaceColorProperty });

  // Ramp outline (slightly darker edge for definition)
  const rampStroke = new Path(rampShape, { lineWidth: 1.5, stroke: RampColors.earthColorProperty });

  // Block on ramp (rotated flush to the surface)
  const block = new Rectangle(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE, 2, 2, {
    fill: RampColors.accentColorProperty,
  });
  block.translation = new Vector2(BCX, BCY);
  block.rotation = RAMP_ANGLE;

  return [sky, earth, rampFill, rampStroke, block];
}

// ── Intro screen icon ───────────────────────────────────────────────────────
// Shows a single applied-force arrow (up the slope) and a decorative sun,
// emphasising the introductory, single-force nature of the screen.
function createIntroIconNode(): Node {
  const children = buildBase();

  // Sun (top-left corner)
  const sun = new Circle(7, { centerX: 14, centerY: 12, fill: RampColors.totalEnergyColorProperty });

  // Applied force — orange arrow up the slope
  const AX = BCX + 22 * SX;
  const AY = BCY + 22 * SY;
  const appliedArrow = arrow(BCX, BCY, AX, AY, RampColors.appliedForceColorProperty, 8, 3.5);

  children.push(sun, appliedArrow);
  return new Node({ children });
}

// ── More Features screen icon ───────────────────────────────────────────────
// Shows three force arrows (applied, gravity, normal) to signal the
// multi-vector / energy-analysis capabilities of the second screen.
function createMoreFeaturesIconNode(): Node {
  const children = buildBase();

  // Applied force — orange, up the slope
  const appliedArrow = arrow(BCX, BCY, BCX + 20 * SX, BCY + 20 * SY, RampColors.appliedForceColorProperty, 7, 3);

  // Gravity — blue, straight down
  const gravityArrow = arrow(BCX, BCY, BCX, BCY + 17, RampColors.gravityForceColorProperty, 7, 3);

  // Normal force — magenta, perpendicular away from ramp surface
  const normalArrow = arrow(BCX, BCY, BCX + 16 * NX, BCY + 16 * NY, RampColors.normalForceColorProperty, 7, 3);

  children.push(appliedArrow, gravityArrow, normalArrow);
  return new Node({ children });
}

// ── Public factory functions ────────────────────────────────────────────────
export function createIntroIcon(): ScreenIcon {
  return new ScreenIcon(createIntroIconNode(), {
    maxIconWidthProportion: 0.9,
    maxIconHeightProportion: 0.9,
    fill: RampColors.skyColorProperty,
  });
}

export function createMoreFeaturesIcon(): ScreenIcon {
  return new ScreenIcon(createMoreFeaturesIconNode(), {
    maxIconWidthProportion: 0.9,
    maxIconHeightProportion: 0.9,
    fill: RampColors.skyColorProperty,
  });
}
