/**
 * ForceArrowNode.ts
 *
 * One labeled force arrow (ArrowNode + RichText subscript label).
 */
import type { ReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { Node, type ProfileColorProperty, RichText } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import TheRampColors from "../../TheRampColors.js";

const LABEL_OFFSET = 12;

export class ForceArrowNode extends Node {
  private readonly arrowNode: ArrowNode;
  private readonly label: RichText;

  public constructor(labelStringProperty: ReadOnlyProperty<string>, colorProperty: ProfileColorProperty) {
    super();

    this.arrowNode = new ArrowNode(0, 0, 1, 0, {
      fill: colorProperty,
      stroke: TheRampColors.panelBorderColorProperty,
      lineWidth: 0.5,
      tailWidth: 4,
      headWidth: 14,
      headHeight: 10,
    });

    this.label = new RichText(labelStringProperty, {
      font: new PhetFont({ size: 13, weight: "bold" }),
      fill: colorProperty,
    });

    this.addChild(this.arrowNode);
    this.addChild(this.label);
  }

  public update(tail: Vector2, viewForce: Vector2): void {
    if (viewForce.magnitude < 1) {
      this.visible = false;
      return;
    }

    this.visible = true;
    const tip = tail.plus(viewForce);
    this.arrowNode.setTailAndTip(tail.x, tail.y, tip.x, tip.y);

    const direction = viewForce.normalized();
    this.label.center = tip.plus(direction.times(LABEL_OFFSET));
  }
}
