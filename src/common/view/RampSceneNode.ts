/**
 * RampSceneNode.ts
 *
 * World scene: sky, surfaces, barriers, block, and readouts. Owns the model-view transform.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { type Bounds2, toFixed, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { MODEL_VIEW_SCALE, RAMP_LENGTH, WORLD_VIEW_ORIGIN } from "../RampConstants.js";
import { BarrierNode } from "./BarrierNode.js";
import { BlockNode } from "./BlockNode.js";
import { ForceVectorSetNode } from "./ForceVectorSetNode.js";
import { SkyAndGroundNode } from "./SkyAndGroundNode.js";
import { GroundSurfaceNode, RampSurfaceNode } from "./SurfaceNode.js";

// Distance (px) along the surface normal from the block's contact point up to
// its vertical center, where the force vectors emanate from. The block now rides
// directly on the surface line on both ground and ramp (see BlockNode), so it
// sits one board thickness lower than before; this lift drops by the same amount.
const BLOCK_TAIL_LIFT = 18;

export class RampSceneNode extends Node {
  public readonly modelViewTransform: ModelViewTransform2;
  public readonly blockNode: BlockNode;
  public readonly blockTailProperty: ReadOnlyProperty<Vector2>;

  public constructor(model: RampModel, visibleBoundsProperty: ReadOnlyProperty<Bounds2>) {
    super();

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      WORLD_VIEW_ORIGIN,
      MODEL_VIEW_SCALE,
    );

    const skyAndGroundNode = new SkyAndGroundNode(visibleBoundsProperty);
    const groundSurfaceNode = new GroundSurfaceNode();

    const leftBarrier = new BarrierNode();
    leftBarrier.right = 44;
    leftBarrier.bottom = WORLD_VIEW_ORIGIN.y;

    // Triangular wedge that props up the ramp (matches icon geometry)
    const wedgeNode = new Path(null, {
      fill: RampColors.rampSurfaceColorProperty,
      stroke: RampColors.panelBorderColorProperty,
      lineWidth: 1,
    });

    // Pie-sector arc at the hinge showing the current ramp angle
    const ANGLE_ARC_RADIUS = 46;
    const angleArcNode = new Path(null, {
      stroke: RampColors.readoutTextColorProperty,
      lineWidth: 1.5,
      fill: "rgba(255,255,255,0.18)",
    });

    const rampSurfaceNode = new RampSurfaceNode(model);
    const blockNode = new BlockNode(model, this.modelViewTransform);
    this.blockNode = blockNode;

    this.blockTailProperty = new DerivedProperty(
      [model.blockLocationProperty, model.surfaceProperty, model.rampAngleProperty],
      (blockLocation, surface, rampAngle) => {
        const theta = surface === "ramp" ? rampAngle : 0;
        return this.modelViewTransform
          .modelToViewPosition(blockLocation)
          .plusXY(-BLOCK_TAIL_LIFT * Math.sin(theta), -BLOCK_TAIL_LIFT * Math.cos(theta));
      },
    );

    const readoutStrings = StringManager.getInstance().getReadoutStrings();
    const angleDegreesProperty = new DerivedProperty([model.rampAngleProperty], (angle) =>
      toFixed((angle * 180) / Math.PI, 1),
    );

    const angleReadout = new Text(
      new PatternStringProperty(readoutStrings.anglePatternStringProperty, {
        value: angleDegreesProperty,
      }),
      {
        font: new PhetFont(14),
        fill: RampColors.readoutTextColorProperty,
        left: WORLD_VIEW_ORIGIN.x + 8,
        top: WORLD_VIEW_ORIGIN.y + 6,
      },
    );

    const heightReadout = new Text(
      new PatternStringProperty(readoutStrings.heightPatternStringProperty, {
        value: new DerivedProperty([model.rampHeightProperty], (height) => toFixed(height, 1)),
      }),
      {
        font: new PhetFont(14),
        fill: RampColors.readoutTextColorProperty,
      },
    );

    const rampBoardLength = RAMP_LENGTH * MODEL_VIEW_SCALE;
    model.rampAngleProperty.link((angle) => {
      const raised = angle > 0.05;
      angleArcNode.visible = raised;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tipX = WORLD_VIEW_ORIGIN.x + rampBoardLength * cosA;
      const tipY = WORLD_VIEW_ORIGIN.y - rampBoardLength * sinA;

      // Right-triangle wedge: hinge → ground below tip → ramp tip (always visible)
      wedgeNode.shape = new Shape()
        .moveTo(WORLD_VIEW_ORIGIN.x, WORLD_VIEW_ORIGIN.y)
        .lineTo(tipX, WORLD_VIEW_ORIGIN.y)
        .lineTo(tipX, tipY)
        .close();

      heightReadout.left = tipX + 10;
      heightReadout.centerY = (tipY + WORLD_VIEW_ORIGIN.y) / 2;

      if (raised) {
        // Pie-sector from horizontal (0) sweeping up to ramp direction (−angle in screen coords)
        angleArcNode.shape = new Shape()
          .moveTo(WORLD_VIEW_ORIGIN.x, WORLD_VIEW_ORIGIN.y)
          .lineTo(WORLD_VIEW_ORIGIN.x + ANGLE_ARC_RADIUS, WORLD_VIEW_ORIGIN.y)
          .arc(WORLD_VIEW_ORIGIN.x, WORLD_VIEW_ORIGIN.y, ANGLE_ARC_RADIUS, 0, -angle, true)
          .close();
      }
    });

    this.addChild(skyAndGroundNode);
    this.addChild(groundSurfaceNode);
    this.addChild(leftBarrier);
    this.addChild(wedgeNode); // wedge sits below the ramp board
    this.addChild(rampSurfaceNode);
    this.addChild(blockNode);
    this.addChild(angleArcNode); // arc drawn over the scene, under text readouts
    this.addChild(angleReadout);
    this.addChild(heightReadout);
    this.addChild(new ForceVectorSetNode(model, this.blockTailProperty));
  }
}
