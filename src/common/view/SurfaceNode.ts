/**
 * SurfaceNode.ts
 *
 * Ground line and rotatable ramp board with angle drag interaction.
 */
import { DerivedProperty } from "scenerystack/axon";
import { clamp } from "scenerystack/dot";
import { Color, DragListener, Line, Node, Rectangle } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { OVERHEAT_THERMAL_ENERGY } from "../model/RampPhysicsConstants.js";
import {
  ANGLE_RANGE,
  MODEL_VIEW_SCALE,
  RAMP_BOARD_THICKNESS,
  RAMP_LENGTH,
  WORLD_VIEW_ORIGIN,
} from "../RampConstants.js";
import { BarrierNode } from "./BarrierNode.js";

/** Crisp ground walking surface from the left wall to the ramp hinge. */
export class GroundSurfaceNode extends Node {
  public constructor() {
    super();

    this.addChild(
      new Line(44, WORLD_VIEW_ORIGIN.y, WORLD_VIEW_ORIGIN.x, WORLD_VIEW_ORIGIN.y, {
        lineWidth: 3,
        stroke: RampColors.rampSurfaceColorProperty,
      }),
    );
  }
}

/** Rotatable ramp board with heat glow and top-wall barrier. */
export class RampSurfaceNode extends Node {
  public constructor(model: RampModel) {
    super();

    this.translation = WORLD_VIEW_ORIGIN;

    const heatFillProperty = new DerivedProperty(
      [model.thermalEnergyProperty, RampColors.rampSurfaceColorProperty, RampColors.rampSurfaceHotColorProperty],
      (thermal, cold, hot) => Color.interpolateRGBA(cold, hot, clamp(thermal / OVERHEAT_THERMAL_ENERGY, 0, 1)),
    );

    const boardLength = RAMP_LENGTH * MODEL_VIEW_SCALE;
    const board = new Rectangle(0, -RAMP_BOARD_THICKNESS, boardLength, RAMP_BOARD_THICKNESS, {
      lineWidth: 1,
      cursor: "pointer",
      fill: heatFillProperty,
      stroke: RampColors.panelBorderColorProperty,
      tagName: "div",
      focusable: true,
      accessibleName: StringManager.getInstance().getA11yStrings().controls.rampSurfaceStringProperty,
    });

    const topBarrier = new BarrierNode();
    topBarrier.right = boardLength;
    topBarrier.bottom = -RAMP_BOARD_THICKNESS;
    board.addChild(topBarrier);

    board.addInputListener(
      new DragListener({
        drag: (event) => {
          const parentPoint = this.globalToParentPoint(event.pointer.point);
          const dx = parentPoint.x - WORLD_VIEW_ORIGIN.x;
          const dy = WORLD_VIEW_ORIGIN.y - parentPoint.y;
          model.rampAngleProperty.value = clamp(Math.atan2(dy, Math.max(dx, 1e-6)), ANGLE_RANGE.min, ANGLE_RANGE.max);
        },
      }),
    );

    this.addChild(board);

    model.rampAngleProperty.link((angle) => {
      this.rotation = -angle;
    });
  }
}
