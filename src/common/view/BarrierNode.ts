/**
 * BarrierNode.ts
 *
 * Brick-styled wall barrier used at the ground left limit and ramp top.
 */
import { Line, Rectangle } from "scenerystack/scenery";
import RampColors from "../../RampColors.js";

export class BarrierNode extends Rectangle {
  public constructor() {
    super(0, 0, 14, 60, {
      lineWidth: 1,
      fill: RampColors.barrierColorProperty,
      stroke: RampColors.panelBorderColorProperty,
    });

    for (const y of [15, 30, 45]) {
      this.addChild(new Line(0, y, 14, y, { lineWidth: 1, stroke: RampColors.panelBorderColorProperty }));
    }
  }
}
