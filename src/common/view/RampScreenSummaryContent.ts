/**
 * RampScreenSummaryContent.ts
 *
 * The accessible screen summary (SceneryStack Interactive Description) shared by
 * both Ramp screens. It describes the play area and controls, gives an
 * interaction hint, and — crucially — exposes a LIVE "current details" paragraph
 * derived from the model so a screen-reader user can re-read the situation
 * (object, ramp angle, applied force, speed) at any time.
 *
 * Follows the OpenPhysics accessibility convention; see ../../../ACCESSIBILITY.md
 * and the canonical TemplateSingleSim/SimScreenSummaryContent.ts.
 */

import { DerivedProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { RampModel } from "../model/RampModel.js";

export class RampScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: RampModel) {
    const stringManager = StringManager.getInstance();
    const a11y = stringManager.getA11yStrings();
    const objectStrings = stringManager.getObjectStrings();

    // Map each object's nameKey to its localized name StringProperty so the
    // current-details paragraph can name the selected object.
    const nameProperties = {
      fileCabinet: objectStrings.fileCabinetStringProperty,
      refrigerator: objectStrings.refrigeratorStringProperty,
      piano: objectStrings.pianoStringProperty,
      crate: objectStrings.crateStringProperty,
      sleepyDog: objectStrings.sleepyDogStringProperty,
    };

    // Live snapshot. Numbers are rounded so the text only changes when a
    // meaningful (readable) value changes rather than on every animation frame.
    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsStringProperty,
        model.selectedObjectProperty,
        model.rampAngleProperty,
        model.appliedForceProperty,
        model.speedProperty,
        nameProperties.fileCabinet,
        nameProperties.refrigerator,
        nameProperties.piano,
        nameProperties.crate,
        nameProperties.sleepyDog,
      ],
      (template, selectedObject, rampAngle, appliedForce, speed) =>
        StringUtils.fillIn(template, {
          object: nameProperties[selectedObject.nameKey].value,
          angle: Math.round((rampAngle * 180) / Math.PI),
          force: Math.round(appliedForce),
          speed: toFixed(speed, 1),
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
