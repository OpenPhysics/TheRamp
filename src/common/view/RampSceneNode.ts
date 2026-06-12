/**
 * RampSceneNode.ts
 *
 * World scene: sky, surfaces, barriers, block, and readouts. Owns the model-view transform.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Text } from "scenerystack/scenery";
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

const BLOCK_TAIL_LIFT = 30;

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
      ((angle * 180) / Math.PI).toFixed(1),
    );

    const angleReadout = new Text(
      new PatternStringProperty(readoutStrings.anglePatternStringProperty, {
        value: angleDegreesProperty,
      }),
      {
        font: new PhetFont(14),
        left: WORLD_VIEW_ORIGIN.x + 8,
        top: WORLD_VIEW_ORIGIN.y + 6,
      },
    );
    RampColors.readoutTextColorProperty.link((color) => {
      angleReadout.fill = color;
    });

    const heightReadout = new Text(
      new PatternStringProperty(readoutStrings.heightPatternStringProperty, {
        value: new DerivedProperty([model.rampHeightProperty], (height) => height.toFixed(1)),
      }),
      {
        font: new PhetFont(14),
      },
    );
    RampColors.readoutTextColorProperty.link((color) => {
      heightReadout.fill = color;
    });

    const rampBoardLength = RAMP_LENGTH * MODEL_VIEW_SCALE;
    model.rampAngleProperty.link((angle) => {
      heightReadout.visible = angle > 0.05;
      if (angle > 0.05) {
        const rampTopX = WORLD_VIEW_ORIGIN.x + rampBoardLength * Math.cos(angle);
        const rampTopY = WORLD_VIEW_ORIGIN.y - rampBoardLength * Math.sin(angle);
        heightReadout.left = rampTopX + 10;
        heightReadout.centerY = (rampTopY + WORLD_VIEW_ORIGIN.y) / 2;
      }
    });

    this.addChild(skyAndGroundNode);
    this.addChild(groundSurfaceNode);
    this.addChild(leftBarrier);
    this.addChild(rampSurfaceNode);
    this.addChild(blockNode);
    this.addChild(angleReadout);
    this.addChild(heightReadout);
    this.addChild(new ForceVectorSetNode(model, this.blockTailProperty));
  }
}
