/**
 * RampKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar),
 * shared by every screen in The Ramp.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class RampKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new SliderControlsKeyboardHelpSection()], [new BasicActionsKeyboardHelpSection()]);
  }
}
