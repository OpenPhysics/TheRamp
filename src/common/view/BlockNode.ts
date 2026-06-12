/**
 * BlockNode.ts
 *
 * Draggable object image on the ramp/ground. Drag sets applied force; physics moves the block.
 */
import { DerivedProperty, Multilink } from "scenerystack/axon";
import { clamp } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { DragListener, Image, Node } from "scenerystack/scenery";
import { RampImages } from "../../assets/images.js";
import type { RampModel } from "../model/RampModel.js";
import type { RampObjectDescription } from "../model/RampObjectDescription.js";
import { APPLIED_FORCE_PER_PIXEL, APPLIED_FORCE_RANGE, RAMP_BOARD_THICKNESS } from "../RampConstants.js";

export class BlockNode extends Node {
  public constructor(model: RampModel, modelViewTransform: ModelViewTransform2) {
    super({ cursor: "ew-resize" });

    const skateboardImage = new Image(RampImages.skateboard, {
      maxWidth: 60,
      centerX: 0,
      bottom: 0,
      visibleProperty: new DerivedProperty(
        [model.staticFrictionProperty, model.kineticFrictionProperty],
        (staticFriction, kineticFriction) => staticFriction === 0 && kineticFriction === 0,
      ),
    });

    const objectImage = new Image(RampImages.cabinet, {
      centerX: 0,
      bottom: 0,
    });

    this.addChild(skateboardImage);
    this.addChild(objectImage);

    let selectedObject: RampObjectDescription = model.selectedObjectProperty.value;

    const applyObjectPlacement = (): void => {
      const surfaceTopOffset = model.surfaceProperty.value === "ramp" ? -RAMP_BOARD_THICKNESS : 0;
      const skateboardVisible = skateboardImage.visible;
      skateboardImage.bottom = surfaceTopOffset;
      objectImage.centerX = 0;
      objectImage.bottom = skateboardVisible ? skateboardImage.top + 4 : surfaceTopOffset + selectedObject.yOffset;
    };

    const applyObjectScale = (): void => {
      const mass = model.massProperty.value;
      objectImage.setScaleMagnitude(selectedObject.viewScale, selectedObject.viewScale * (mass / selectedObject.mass));
      applyObjectPlacement();
    };

    model.selectedObjectProperty.link((obj) => {
      selectedObject = obj;
      objectImage.image = RampImages[obj.imageKey];
      applyObjectScale();
    });

    new Multilink([model.selectedObjectProperty, skateboardImage.visibleProperty, model.surfaceProperty], () => {
      applyObjectPlacement();
    });

    new Multilink([model.selectedObjectProperty, model.massProperty], () => {
      applyObjectScale();
    });

    new Multilink(
      [model.blockLocationProperty, model.surfaceProperty, model.rampAngleProperty],
      (blockLocation, surface, rampAngle) => {
        this.translation = modelViewTransform.modelToViewPosition(blockLocation);
        this.rotation = surface === "ramp" ? -rampAngle : 0;
      },
    );

    let dragStartX = 0;
    this.addInputListener(
      new DragListener({
        start: (event) => {
          model.timeSeriesModel.ensureRecordMode();
          dragStartX = this.globalToParentPoint(event.pointer.point).x;
        },
        drag: (event) => {
          const dx = this.globalToParentPoint(event.pointer.point).x - dragStartX;
          model.appliedForceProperty.value = clamp(
            dx * APPLIED_FORCE_PER_PIXEL,
            APPLIED_FORCE_RANGE.min,
            APPLIED_FORCE_RANGE.max,
          );
        },
        end: () => {
          model.appliedForceProperty.value = 0;
        },
      }),
    );
  }
}
