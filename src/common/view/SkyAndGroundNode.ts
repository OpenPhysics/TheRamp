/**
 * SkyAndGroundNode.ts
 *
 * Full-width sky and earth rectangles sized against the ScreenView visible bounds.
 */
import type { ReadOnlyProperty } from "scenerystack/axon";
import type { Bounds2 } from "scenerystack/dot";
import { Node, Rectangle } from "scenerystack/scenery";
import RampColors from "../../RampColors.js";
import { WORLD_VIEW_ORIGIN } from "../RampConstants.js";

export class SkyAndGroundNode extends Node {
  public constructor(visibleBoundsProperty: ReadOnlyProperty<Bounds2>) {
    super();

    const skyRect = new Rectangle(0, 0, 1, 1);
    const earthRect = new Rectangle(0, 0, 1, 1);
    RampColors.skyColorProperty.link((color) => {
      skyRect.fill = color;
    });
    RampColors.earthColorProperty.link((color) => {
      earthRect.fill = color;
    });

    this.addChild(skyRect);
    this.addChild(earthRect);

    const updateBounds = (bounds: Bounds2): void => {
      skyRect.setRect(bounds.minX, bounds.minY, bounds.width, WORLD_VIEW_ORIGIN.y - bounds.minY);
      earthRect.setRect(bounds.minX, WORLD_VIEW_ORIGIN.y, bounds.width, bounds.maxY - WORLD_VIEW_ORIGIN.y);
    };

    visibleBoundsProperty.link(updateBounds);
  }
}
