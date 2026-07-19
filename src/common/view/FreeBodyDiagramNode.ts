/**
 * FreeBodyDiagramNode.ts
 *
 * Collapsible 200×200 free-body diagram; horizontal drag applies force to the block.
 */
import { Multilink } from "scenerystack/axon";
import { clamp, Vector2 } from "scenerystack/dot";
import { DragListener, KeyboardDragListener, Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AccordionBox } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import TheRampColors from "../../TheRampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { APPLIED_FORCE_RANGE, FBD_FORCE_PER_PIXEL, FBD_FORCE_SCALE, FBD_SIZE } from "../TheRampConstants.js";
import { ForceArrowNode } from "./ForceArrowNode.js";
import { type ForceId, getForceVectors } from "./ForceVectorSetNode.js";

const FORCES: ForceId[] = ["applied", "gravity", "normal", "friction", "wall", "total"];

function toFbdViewForce(modelForce: Vector2): Vector2 {
  return new Vector2(modelForce.x * FBD_FORCE_SCALE, -modelForce.y * FBD_FORCE_SCALE);
}

export class FreeBodyDiagramNode extends AccordionBox {
  public constructor(model: RampModel) {
    const forceSymbols = StringManager.getInstance().getForceSymbolStrings();
    const controls = StringManager.getInstance().getControlStrings();
    const visibility = model.vectorVisibility;
    const center = FBD_SIZE / 2;
    const tail = new Vector2(center, center);

    const diagramNode = new Node();

    const background = new Rectangle(0, 0, FBD_SIZE, FBD_SIZE, {
      fill: TheRampColors.chartBackgroundColorProperty,
      stroke: TheRampColors.panelBorderColorProperty,
      cursor: "ew-resize",
    });
    diagramNode.addChild(background);

    diagramNode.addChild(
      new Line(0, center, FBD_SIZE, center, {
        stroke: TheRampColors.chartGridColorProperty,
      }),
    );
    diagramNode.addChild(
      new Line(center, 0, center, FBD_SIZE, {
        stroke: TheRampColors.chartGridColorProperty,
      }),
    );

    const forceColors = {
      applied: TheRampColors.appliedForceColorProperty,
      gravity: TheRampColors.gravityForceColorProperty,
      normal: TheRampColors.normalForceColorProperty,
      friction: TheRampColors.frictionForceColorProperty,
      wall: TheRampColors.wallForceColorProperty,
      total: TheRampColors.totalForceColorProperty,
    } as const;

    const forceLabels = {
      applied: forceSymbols.appliedStringProperty,
      gravity: forceSymbols.gravityStringProperty,
      normal: forceSymbols.normalStringProperty,
      friction: forceSymbols.frictionStringProperty,
      wall: forceSymbols.wallStringProperty,
      total: forceSymbols.totalStringProperty,
    } as const;

    const forceToggles = {
      applied: visibility.appliedVisibleProperty,
      gravity: visibility.gravityVisibleProperty,
      normal: visibility.normalVisibleProperty,
      friction: visibility.frictionVisibleProperty,
      wall: visibility.wallVisibleProperty,
      total: visibility.totalVisibleProperty,
    } as const;

    const arrows = {} as Record<ForceId, ForceArrowNode>;
    for (const force of FORCES) {
      const arrow = new ForceArrowNode(forceLabels[force], forceColors[force]);
      diagramNode.addChild(
        new Node({
          visibleProperty: forceToggles[force],
          children: [arrow],
        }),
      );
      arrows[force] = arrow;
    }

    let dragStartX = 0;
    const clearAppliedForce = (): void => {
      model.appliedForceProperty.value = 0;
    };
    background.addInputListener(
      new DragListener({
        start: (event) => {
          model.timeSeriesModel.ensureRecordMode();
          dragStartX = background.globalToParentPoint(event.pointer.point).x;
        },
        drag: (event) => {
          const dx = background.globalToParentPoint(event.pointer.point).x - dragStartX;
          model.appliedForceProperty.value = clamp(
            dx * FBD_FORCE_PER_PIXEL,
            APPLIED_FORCE_RANGE.min,
            APPLIED_FORCE_RANGE.max,
          );
        },
        end: clearAppliedForce,
      }),
    );
    background.addInputListener(
      new KeyboardDragListener({
        keyboardDragDirection: "leftRight",
        dragDelta: 40,
        shiftDragDelta: 10,
        start: () => {
          model.timeSeriesModel.ensureRecordMode();
        },
        drag: (_event, listener) => {
          model.appliedForceProperty.value = clamp(
            listener.modelDelta.x * FBD_FORCE_PER_PIXEL,
            APPLIED_FORCE_RANGE.min,
            APPLIED_FORCE_RANGE.max,
          );
        },
        end: clearAppliedForce,
      }),
    );

    super(diagramNode, {
      titleNode: new Text(controls.freeBodyDiagramStringProperty, {
        font: new PhetFont(14),
        fill: TheRampColors.textColorProperty,
      }),
      expandedProperty: visibility.fbdVisibleProperty,
      fill: TheRampColors.panelBackgroundColorProperty,
      stroke: TheRampColors.panelBorderColorProperty,
    });

    new Multilink(
      [
        model.forces.appliedParallelProperty,
        model.forces.gravityParallelProperty,
        model.forces.frictionParallelProperty,
        model.forces.wallParallelProperty,
        model.forces.netParallelProperty,
        model.forces.normalPerpendicularProperty,
        model.massProperty,
        model.surfaceProperty,
        model.rampAngleProperty,
      ],
      () => {
        const forces = getForceVectors(model);
        for (const force of FORCES) {
          arrows[force].update(tail, toFbdViewForce(forces[force]));
        }
      },
    );
  }
}
