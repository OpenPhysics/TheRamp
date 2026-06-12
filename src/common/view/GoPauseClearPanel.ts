/**
 * GoPauseClearPanel.ts
 *
 * Record / pause / clear time-series controls at the bottom of the screen.
 */
import { DerivedProperty } from "scenerystack/axon";
import { HBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { TextPushButton } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import type { RampModel } from "../model/RampModel.js";
import { MAX_RECORDING_TIME } from "../model/RampPhysicsConstants.js";
import { showConfirmDialog } from "./ConfirmDialog.js";

const LABEL_FONT = new PhetFont(13);

export class GoPauseClearPanel extends HBox {
  public constructor(model: RampModel) {
    const timeControls = StringManager.getInstance().getTimeControlStrings();
    const messages = StringManager.getInstance().getMessageStrings();
    const timeSeriesModel = model.timeSeriesModel;

    const goEnabledProperty = new DerivedProperty(
      [timeSeriesModel.isPlayingProperty, timeSeriesModel.recordTimeProperty],
      (isPlaying, recordTime) => !isPlaying && recordTime < MAX_RECORDING_TIME,
    );

    const goButton = new TextPushButton(timeControls.goStringProperty, {
      font: LABEL_FONT,
      listener: () => {
        timeSeriesModel.ensureRecordMode();
        timeSeriesModel.isPlayingProperty.value = true;
      },
      enabledProperty: goEnabledProperty,
    });

    const pauseButton = new TextPushButton(timeControls.pauseStringProperty, {
      font: LABEL_FONT,
      listener: () => {
        timeSeriesModel.isPlayingProperty.value = false;
      },
      enabledProperty: timeSeriesModel.isPlayingProperty,
    });

    const clearButton = new TextPushButton(timeControls.clearStringProperty, {
      font: LABEL_FONT,
      listener: () => {
        showConfirmDialog(
          messages.confirmClearTitleStringProperty,
          messages.confirmClearGraphsStringProperty,
          timeControls.clearStringProperty,
          () => timeSeriesModel.clear(),
        );
      },
    });

    super({
      spacing: 10,
      children: [goButton, pauseButton, clearButton],
    });
  }
}
