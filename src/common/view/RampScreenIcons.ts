/**
 * RampScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for both Ramp screens.
 */
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import RampColors from "../../RampColors.js";

const RAMP_ANGLE = -0.46;
const BLOCK_SIZE = 14;
const BLOCK_CENTER = { x: 50, y: 50 };

function createRampIconNode(includeVectors: boolean): Node {
  const background = new Rectangle(0, 0, 100, 80, 8, 8);
  RampColors.skyColorProperty.link((color) => {
    background.fill = color;
  });

  const ramp = new Path(Shape.polygon([new Vector2(10, 70), new Vector2(90, 70), new Vector2(90, 30)]));
  RampColors.rampSurfaceColorProperty.link((color) => {
    ramp.fill = color;
  });

  const block = new Rectangle(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
  RampColors.accentColorProperty.link((color) => {
    block.fill = color;
  });
  block.translation = new Vector2(BLOCK_CENTER.x, BLOCK_CENTER.y);
  block.rotation = RAMP_ANGLE;

  const children: Node[] = [background, ramp, block];

  if (includeVectors) {
    const rampMidX = 50;
    const rampMidY = 50;
    const upSlopeArrow = new ArrowNode(rampMidX - 18, rampMidY + 8, rampMidX + 2, rampMidY - 2, {
      fill: RampColors.totalForceColorProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3,
      stroke: null,
    });
    const downArrow = new ArrowNode(rampMidX + 2, rampMidY - 18, rampMidX + 2, rampMidY + 2, {
      fill: RampColors.gravityForceColorProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3,
      stroke: null,
    });
    children.push(upSlopeArrow, downArrow);
  }

  return new Node({ children });
}

export function createIntroScreenIcon(): ScreenIcon {
  return new ScreenIcon(createRampIconNode(false), {
    maxIconWidthProportion: 0.85,
    maxIconHeightProportion: 0.85,
    fill: RampColors.skyColorProperty,
  });
}

export function createMoreFeaturesScreenIcon(): ScreenIcon {
  return new ScreenIcon(createRampIconNode(true), {
    maxIconWidthProportion: 0.85,
    maxIconHeightProportion: 0.85,
    fill: RampColors.skyColorProperty,
  });
}
