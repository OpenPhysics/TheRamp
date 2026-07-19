/**
 * TheRampPreferencesNode.ts
 *
 * Custom preferences UI for The Ramp, shown in Preferences → Simulation.
 * Controls are bound to TheRampPreferencesModel Properties; their initial values
 * come from theRampQueryParameters.
 */

import { Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import TheRampColors from "../TheRampColors.js";
import TheRampNamespace from "../TheRampNamespace.js";
import { INITIAL_RAMP_ANGLE_RANGE_DEG, type TheRampPreferencesModel } from "./TheRampPreferencesModel.js";

export class TheRampPreferencesNode extends VBox {
  public constructor(preferencesModel: TheRampPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: TheRampColors.textColorProperty,
    });

    const checkbox = (
      property: TheRampPreferencesModel["frictionlessProperty"],
      labelProperty: typeof prefStrings.frictionlessStringProperty,
      tandemName: string,
    ): Checkbox =>
      new Checkbox(
        property,
        new Text(labelProperty, {
          font: new PhetFont(14),
          fill: TheRampColors.textColorProperty,
        }),
        {
          checkboxColor: TheRampColors.textColorProperty,
          checkboxColorBackground: TheRampColors.panelBackgroundColorProperty,
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
          textOptions: { fill: TheRampColors.textColorProperty },
        },
        titleNodeOptions: {
          font: new PhetFont(14),
          fill: TheRampColors.textColorProperty,
          maxWidth: 200,
        },
        sliderOptions: { trackFillEnabled: TheRampColors.textColorProperty },
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

TheRampNamespace.register("TheRampPreferencesNode", TheRampPreferencesNode);
