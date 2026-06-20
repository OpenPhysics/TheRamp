/**
 * ForceVectorSetNode.ts
 *
 * Five coordinate frames × six forces rendered at the block tail.
 */
import { DerivedProperty, Multilink, type ReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import type { SurfaceId } from "../model/RampPhysicsEngine.js";
import { FORCE_ARROW_SCALE, GRAVITY } from "../RampConstants.js";
import { ForceArrowNode } from "./ForceArrowNode.js";

export type ForceId = "applied" | "gravity" | "normal" | "friction" | "wall" | "total";
export type FrameId = "entire" | "parallel" | "perpendicular" | "x" | "y";

const FRAMES: FrameId[] = ["entire", "parallel", "perpendicular", "x", "y"];
const FORCES: ForceId[] = ["applied", "gravity", "normal", "friction", "wall", "total"];

const TOTAL_TAIL_OFFSET = 15;

export function getSurfaceAngle(surface: SurfaceId, rampAngle: number): number {
  return surface === "ramp" ? rampAngle : 0;
}

/** Reads the current force vectors (model space, y-up, newtons) from the model. */
export function getForceVectors(model: RampModel): Record<ForceId, Vector2> {
  const theta = getSurfaceAngle(model.surfaceProperty.value, model.rampAngleProperty.value);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const uHat = new Vector2(cosTheta, sinTheta);
  const nHat = new Vector2(-sinTheta, cosTheta);
  const mass = model.massProperty.value;

  return {
    applied: uHat.times(model.forces.appliedParallelProperty.value),
    gravity: new Vector2(0, -mass * GRAVITY),
    normal: nHat.times(model.forces.normalPerpendicularProperty.value),
    friction: uHat.times(model.forces.frictionParallelProperty.value),
    wall: uHat.times(model.forces.wallParallelProperty.value),
    total: uHat.times(model.forces.netParallelProperty.value),
  };
}

export function decompose(force: Vector2, frame: FrameId, theta: number): Vector2 {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const uHat = new Vector2(cosTheta, sinTheta);
  const nHat = new Vector2(-sinTheta, cosTheta);

  switch (frame) {
    case "entire":
      return force;
    case "parallel":
      return uHat.times(force.dot(uHat));
    case "perpendicular":
      return nHat.times(force.dot(nHat));
    case "x":
      return new Vector2(force.x, 0);
    case "y":
      return new Vector2(0, force.y);
  }
}

export function toViewForce(modelForce: Vector2): Vector2 {
  return new Vector2(modelForce.x * FORCE_ARROW_SCALE, -modelForce.y * FORCE_ARROW_SCALE);
}

export class ForceVectorSetNode extends Node {
  public constructor(model: RampModel, blockTailProperty: ReadOnlyProperty<Vector2>) {
    super();

    const forceSymbols = StringManager.getInstance().getForceSymbolStrings();
    const visibility = model.vectorVisibility;

    const frameToggles: Record<FrameId, ReadOnlyProperty<boolean>> = {
      entire: visibility.entireVectorsProperty,
      parallel: visibility.parallelComponentsProperty,
      perpendicular: visibility.perpendicularComponentsProperty,
      x: visibility.xComponentsProperty,
      y: visibility.yComponentsProperty,
    };

    const forceToggles: Record<ForceId, ReadOnlyProperty<boolean>> = {
      applied: visibility.appliedVisibleProperty,
      gravity: visibility.gravityVisibleProperty,
      normal: visibility.normalVisibleProperty,
      friction: visibility.frictionVisibleProperty,
      wall: visibility.wallVisibleProperty,
      total: visibility.totalVisibleProperty,
    };

    const forceColors = {
      applied: RampColors.appliedForceColorProperty,
      gravity: RampColors.gravityForceColorProperty,
      normal: RampColors.normalForceColorProperty,
      friction: RampColors.frictionForceColorProperty,
      wall: RampColors.wallForceColorProperty,
      total: RampColors.totalForceColorProperty,
    } as const;

    const forceLabels = {
      applied: forceSymbols.appliedStringProperty,
      gravity: forceSymbols.gravityStringProperty,
      normal: forceSymbols.normalStringProperty,
      friction: forceSymbols.frictionStringProperty,
      wall: forceSymbols.wallStringProperty,
      total: forceSymbols.totalStringProperty,
    } as const;

    const arrows: Record<FrameId, Record<ForceId, ForceArrowNode>> = {
      entire: {} as Record<ForceId, ForceArrowNode>,
      parallel: {} as Record<ForceId, ForceArrowNode>,
      perpendicular: {} as Record<ForceId, ForceArrowNode>,
      x: {} as Record<ForceId, ForceArrowNode>,
      y: {} as Record<ForceId, ForceArrowNode>,
    };

    for (const frame of FRAMES) {
      for (const force of FORCES) {
        const arrow = new ForceArrowNode(forceLabels[force], forceColors[force]);
        this.addChild(
          new Node({
            visibleProperty: DerivedProperty.and([frameToggles[frame], forceToggles[force]]),
            children: [arrow],
          }),
        );
        arrows[frame][force] = arrow;
      }
    }

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
        blockTailProperty,
      ],
      () => {
        const theta = getSurfaceAngle(model.surfaceProperty.value, model.rampAngleProperty.value);
        const forces = getForceVectors(model);
        const tail = blockTailProperty.value;
        const nView = new Vector2(-Math.sin(theta), -Math.cos(theta));

        for (const frame of FRAMES) {
          for (const force of FORCES) {
            const viewForce = toViewForce(decompose(forces[force], frame, theta));
            const arrowTail = force === "total" ? tail.plus(nView.times(TOTAL_TAIL_OFFSET)) : tail;
            arrows[frame][force].update(arrowTail, viewForce);
          }
        }
      },
    );
  }
}
