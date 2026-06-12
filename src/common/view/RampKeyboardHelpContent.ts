/**
 * RampKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar),
 * shared by every screen in The Ramp. The current scaffold only exposes buttons
 * and Reset All, so a single basic-actions section covers the available keyboard
 * controls. Add slider or combo-box sections here as the simulation grows.
 */

import { BasicActionsKeyboardHelpSection, TwoColumnKeyboardHelpContent } from "scenerystack/scenery-phet";

export class RampKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], []);
  }
}
