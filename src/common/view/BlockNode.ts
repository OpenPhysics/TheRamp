/**
 * BlockNode.ts
 *
 * Draggable object image on the ramp/ground. Drag sets applied force; physics moves the block.
 */
import { DerivedProperty, Multilink } from "scenerystack/axon";
import { clamp } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { DragListener, Image, KeyboardListener, Node } from "scenerystack/scenery";
import { RampImages } from "../../assets/images.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { RampModel } from "../model/RampModel.js";
import type { RampObjectDescription } from "../model/RampObjectDescription.js";
import { APPLIED_FORCE_PER_PIXEL, APPLIED_FORCE_RANGE } from "../RampConstants.js";

export class BlockNode extends Node {
  public constructor(model: RampModel, modelViewTransform: ModelViewTransform2) {
    const a11y = StringManager.getInstance().getA11yStrings();
    super({
      cursor: "ew-resize",
      // Accessibility: make the draggable object focusable and labeled so it is
      // reachable and operable from the keyboard (see KeyboardListener below).
      tagName: "div",
      focusable: true,
      accessibleName: a11y.block.accessibleNameStringProperty,
      accessibleHelpText: a11y.block.accessibleHelpTextStringProperty,
    });

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
      // The block sits directly on the surface line on both ground and ramp. The
      // ramp board's thickness now extends below that line (see SurfaceNode), so
      // no board-thickness lift is applied here — lifting only on the ramp left a
      // step in the block's contact at the base of the ramp.
      const skateboardVisible = skateboardImage.visible;
      skateboardImage.bottom = 0;
      skateboardImage.centerX = 0;
      objectImage.centerX = 0;
      objectImage.bottom = skateboardVisible ? skateboardImage.top + 4 : selectedObject.yOffset;
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

    // Re-apply placement after the image loads; the initial applyObjectPlacement call fires before
    // the SVG's intrinsic dimensions are known (bounds.maxY == 0), so `bottom` lands at the wrong
    // y-translation. localBoundsProperty fires when the image actually resolves its size.
    objectImage.localBoundsProperty.lazyLink(() => applyObjectPlacement());

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

    // Keyboard equivalent of the drag: hold an arrow key to push the object,
    // release to stop — mirroring the mouse drag's momentary applied force.
    this.addInputListener(
      new KeyboardListener({
        keys: ["arrowLeft", "arrowRight"],
        fireOnHold: true,
        press: (_event, keysPressed) => {
          model.timeSeriesModel.ensureRecordMode();
          model.appliedForceProperty.value =
            keysPressed === "arrowRight" ? APPLIED_FORCE_RANGE.max : APPLIED_FORCE_RANGE.min;
        },
        release: () => {
          model.appliedForceProperty.value = 0;
        },
      }),
    );
  }
}
