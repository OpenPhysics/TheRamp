/**
 * ZeroPointPeLineNode.ts
 *
 * Draggable dashed horizontal line marking the PE = 0 height (More Features).
 */
import type { BooleanProperty } from "scenerystack/axon";
import { clamp } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { DragListener, Line, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";

const LINE_X_MIN = 20;
const LINE_X_MAX = 600;

export class ZeroPointPeLineNode extends Node {
  public constructor(
    model: RampModel,
    modelViewTransform: ModelViewTransform2,
    zeroPointVisibleProperty: BooleanProperty,
  ) {
    super({ visibleProperty: zeroPointVisibleProperty });

    const line = new Line(LINE_X_MIN, 0, LINE_X_MAX, 0, {
      stroke: RampColors.potentialEnergyColorProperty,
      lineDash: [10, 6],
      lineWidth: 2,
      cursor: "ns-resize",
    });

    const label = new Text(StringManager.getInstance().getReadoutStrings().zeroPointPeStringProperty, {
      font: new PhetFont(14),
      fill: RampColors.potentialEnergyColorProperty,
      maxWidth: 80,
    });

    const updatePositions = (zeroPointY: number): void => {
      const viewY = modelViewTransform.modelToViewY(zeroPointY);
      line.y1 = viewY;
      line.y2 = viewY;
      label.right = LINE_X_MAX;
      label.centerY = viewY;
    };

    model.zeroPointYProperty.link(updatePositions);

    line.addInputListener(
      new DragListener({
        drag: (event) => {
          const parentPoint = this.globalToParentPoint(event.pointer.point);
          model.zeroPointYProperty.value = clamp(modelViewTransform.viewToModelY(parentPoint.y), -2, 12);
        },
      }),
    );

    this.addChild(line);
    this.addChild(label);
  }
}
