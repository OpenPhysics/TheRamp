/**
 * IntroScreenView.ts
 *
 * The top-level view for the Introduction screen.
 */
import { combineOptions, type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import {
  RampScreenView,
  type RampScreenViewFeatures,
  type RampScreenViewOptions,
} from "../../common/view/RampScreenView.js";
import type { IntroModel } from "../model/IntroModel.js";

const INTRO_FEATURES = combineOptions<RampScreenViewFeatures>({
  hasFreeBodyDiagram: false,
  hasObjectComboBox: false,
  hasFrictionSlider: false,
  hasMassSlider: false,
  hasMeasuringTape: false,
  hasZeroPointControl: false,
  hasVectorFrameControls: false,
  hasForceVisibilityControls: false,
  hasRecordPlaybackBar: false,
  energyBarsExpanded: false,
  workBarsExpanded: false,
  energyPlotExpanded: false,
  workPlotExpanded: false,
  forcePlotExpanded: true,
});

export type IntroScreenViewOptions = RampScreenViewOptions;

export class IntroScreenView extends RampScreenView {
  public constructor(model: IntroModel, providedOptions?: IntroScreenViewOptions) {
    const options = optionize<IntroScreenViewOptions, EmptySelfOptions, RampScreenViewOptions>()({}, providedOptions);
    super(model, INTRO_FEATURES, options);
  }
}
