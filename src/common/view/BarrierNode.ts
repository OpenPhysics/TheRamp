/**
 * BarrierNode.ts
 *
 * Brick-styled wall barrier used at the ground left limit and ramp top.
 */
import { Line, Rectangle } from "scenerystack/scenery";
import RampColors from "../../RampColors.js";

export class BarrierNode extends Rectangle {
  public constructor() {
    super(0, 0, 14, 60, { lineWidth: 1 });
    RampColors.barrierColorProperty.link((color) => {
      this.fill = color;
    });
    RampColors.panelBorderColorProperty.link((color) => {
      this.stroke = color;
    });

    for (const y of [15, 30, 45]) {
      const brickLine = new Line(0, y, 14, y, { lineWidth: 1 });
      RampColors.panelBorderColorProperty.link((color) => {
        brickLine.stroke = color;
      });
      this.addChild(brickLine);
    }
  }
}
