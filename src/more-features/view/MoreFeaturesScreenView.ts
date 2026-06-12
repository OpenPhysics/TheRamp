/**
 * MoreFeaturesScreenView.ts
 *
 * The top-level view for the More Features screen.
 */
import type { ScreenViewOptions } from "scenerystack/sim";
import { RampScreenView } from "../../common/view/RampScreenView.js";
import type { MoreFeaturesModel } from "../model/MoreFeaturesModel.js";

export class MoreFeaturesScreenView extends RampScreenView {
  public constructor(model: MoreFeaturesModel, options?: ScreenViewOptions) {
    super(
      model,
      {
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
      },
      options,
    );
  }
}
