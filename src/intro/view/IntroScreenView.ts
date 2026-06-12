/**
 * IntroScreenView.ts
 *
 * The top-level view for the Introduction screen.
 */
import type { ScreenViewOptions } from "scenerystack/sim";
import { RampScreenView } from "../../common/view/RampScreenView.js";
import type { IntroModel } from "../model/IntroModel.js";

export class IntroScreenView extends RampScreenView {
  public constructor(model: IntroModel, options?: ScreenViewOptions) {
    super(
      model,
      {
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
      },
      options,
    );
  }
}
