/**
 * MoreFeaturesScreenView.ts
 *
 * The top-level view for the More Features screen.
 */
import { combineOptions, type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import {
  RampScreenView,
  type RampScreenViewFeatures,
  type RampScreenViewOptions,
} from "../../common/view/RampScreenView.js";
import type { MoreFeaturesModel } from "../model/MoreFeaturesModel.js";

const MORE_FEATURES_SCREEN_FEATURES = combineOptions<RampScreenViewFeatures>({
  hasFreeBodyDiagram: true,
  hasObjectComboBox: true,
  hasFrictionSlider: true,
  hasMassSlider: true,
  hasMeasuringTape: true,
  hasZeroPointControl: true,
  hasVectorFrameControls: true,
  hasForceVisibilityControls: true,
  hasRecordPlaybackBar: true,
  energyBarsExpanded: true,
  workBarsExpanded: true,
  energyPlotExpanded: true,
  workPlotExpanded: true,
  forcePlotExpanded: false,
  plotViewWidth: 420,
});

export type MoreFeaturesScreenViewOptions = RampScreenViewOptions;

export class MoreFeaturesScreenView extends RampScreenView {
  public constructor(model: MoreFeaturesModel, providedOptions?: MoreFeaturesScreenViewOptions) {
    const options = optionize<MoreFeaturesScreenViewOptions, EmptySelfOptions, RampScreenViewOptions>()(
      {},
      providedOptions,
    );
    super(model, MORE_FEATURES_SCREEN_FEATURES, options);
  }
}
