/**
 * IntroScreen.ts
 *
 * The Introduction screen — the simpler of The Ramp's two screens. It wires
 * together the model and view factories and passes screen-level options (name,
 * background color, tandem) to the parent Screen class.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { RampKeyboardHelpContent } from "../common/view/RampKeyboardHelpContent.js";
import { createIntroScreenIcon } from "../common/view/RampScreenIcons.js";
import type { RampPreferencesModel } from "../preferences/RampPreferencesModel.js";
import RampColors from "../RampColors.js";
import { IntroModel } from "./model/IntroModel.js";
import { IntroScreenView } from "./view/IntroScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type IntroScreenOptions = ScreenOptions & { tandem: Tandem; preferences: RampPreferencesModel };

export class IntroScreen extends Screen<IntroModel, IntroScreenView> {
  public constructor(options: IntroScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new IntroModel(options.preferences),
      // View factory — receives the model instance
      (model) =>
        new IntroScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<IntroScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RampColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new RampKeyboardHelpContent(),
          homeScreenIcon: createIntroScreenIcon(),
        },
        options,
      ),
    );
  }
}
