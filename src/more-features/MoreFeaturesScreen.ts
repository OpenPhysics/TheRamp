/**
 * MoreFeaturesScreen.ts
 *
 * The More Features screen — the advanced of The Ramp's two screens. It wires
 * together the model and view factories and passes screen-level options (name,
 * background color, tandem) to the parent Screen class.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createMoreFeaturesIcon } from "../common/TheRampScreenIcons.js";
import { RampKeyboardHelpContent } from "../common/view/RampKeyboardHelpContent.js";
import type { TheRampPreferencesModel } from "../preferences/TheRampPreferencesModel.js";
import TheRampColors from "../TheRampColors.js";
import { MoreFeaturesModel } from "./model/MoreFeaturesModel.js";
import { MoreFeaturesScreenView } from "./view/MoreFeaturesScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type MoreFeaturesScreenOptions = ScreenOptions & { tandem: Tandem; preferences: TheRampPreferencesModel };

export class MoreFeaturesScreen extends Screen<MoreFeaturesModel, MoreFeaturesScreenView> {
  public constructor(options: MoreFeaturesScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new MoreFeaturesModel(options.preferences),
      // View factory — receives the model instance
      (model) =>
        new MoreFeaturesScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<MoreFeaturesScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: TheRampColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new RampKeyboardHelpContent(),
          homeScreenIcon: createMoreFeaturesIcon(),
        },
        options,
      ),
    );
  }
}
