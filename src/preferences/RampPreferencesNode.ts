/**
 * RampPreferencesNode.ts
 *
 * Custom preferences UI for The Ramp, shown in Preferences → Simulation.
 * Controls are bound to RampPreferencesModel Properties; their initial values
 * come from rampQueryParameters.
 */

import { Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import RampColors from "../RampColors.js";
import RampNamespace from "../RampNamespace.js";
import { INITIAL_RAMP_ANGLE_RANGE_DEG, type RampPreferencesModel } from "./RampPreferencesModel.js";

export class RampPreferencesNode extends VBox {
  public constructor(preferencesModel: RampPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: RampColors.textColorProperty,
    });

    const checkbox = (
      property: RampPreferencesModel["frictionlessProperty"],
      labelProperty: typeof prefStrings.frictionlessStringProperty,
      tandemName: string,
    ): Checkbox =>
      new Checkbox(
        property,
        new Text(labelProperty, {
          font: new PhetFont(14),
          fill: RampColors.textColorProperty,
        }),
        {
          checkboxColor: RampColors.textColorProperty,
          checkboxColorBackground: RampColors.panelBackgroundColorProperty,
          spacing: 8,
          ...(tandem && { tandem: tandem.createTandem(tandemName) }),
        },
      );

    const initialRampAngleControl = new NumberControl(
      prefStrings.initialRampAngleStringProperty,
      preferencesModel.initialRampAngleProperty,
      INITIAL_RAMP_ANGLE_RANGE_DEG,
      {
        delta: 1,
        numberDisplayOptions: {
          decimalPlaces: 0,
          valuePattern: "{{value}}°",
          textOptions: { fill: RampColors.textColorProperty },
        },
        titleNodeOptions: {
          font: new PhetFont(14),
          fill: RampColors.textColorProperty,
          maxWidth: 200,
        },
        sliderOptions: { trackFillEnabled: RampColors.textColorProperty },
        arrowButtonOptions: { scale: 0.75 },
        layoutFunction: NumberControl.createLayoutFunction4({ sliderPadding: 5 }),
        ...(tandem && { tandem: tandem.createTandem("initialRampAngleControl") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [
        header,
        initialRampAngleControl,
        checkbox(preferencesModel.frictionlessProperty, prefStrings.frictionlessStringProperty, "frictionlessCheckbox"),
        checkbox(preferencesModel.soundEnabledProperty, prefStrings.soundEnabledStringProperty, "soundEnabledCheckbox"),
        checkbox(
          preferencesModel.showComponentsProperty,
          prefStrings.showComponentsStringProperty,
          "showComponentsCheckbox",
        ),
      ],
    });
  }
}

RampNamespace.register("RampPreferencesNode", RampPreferencesNode);
