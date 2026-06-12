/**
 * GoPauseClearPanel.ts
 *
 * Record / pause / clear time-series controls at the bottom of the Introduction screen.
 */
import { DerivedProperty, EnumerationProperty } from "scenerystack/axon";
import { HBox } from "scenerystack/scenery";
import { EraserButton, TimeControlNode, TimeSpeed } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import type { RampModel } from "../model/RampModel.js";
import { MAX_RECORDING_TIME } from "../model/RampPhysicsConstants.js";
import { showConfirmDialog } from "./ConfirmDialog.js";

const SPEED_VALUE = new Map<TimeSpeed, number>([
  [TimeSpeed.SLOW, 0.5],
  [TimeSpeed.NORMAL, 1],
]);

function valueToSpeed(value: number): TimeSpeed {
  return value <= 0.75 ? TimeSpeed.SLOW : TimeSpeed.NORMAL;
}

export class GoPauseClearPanel extends HBox {
  public constructor(model: RampModel) {
    const timeControls = StringManager.getInstance().getTimeControlStrings();
    const messages = StringManager.getInstance().getMessageStrings();
    const timeSeriesModel = model.timeSeriesModel;

    const playPauseEnabledProperty = new DerivedProperty(
      [timeSeriesModel.isPlayingProperty, timeSeriesModel.recordTimeProperty],
      (isPlaying, recordTime) => isPlaying || recordTime < MAX_RECORDING_TIME,
    );

    timeSeriesModel.isPlayingProperty.lazyLink((isPlaying, wasPlaying) => {
      if (isPlaying && !wasPlaying && timeSeriesModel.modeProperty.value !== "record") {
        timeSeriesModel.record();
      }
    });

    const timeSpeedProperty = new EnumerationProperty(valueToSpeed(timeSeriesModel.playbackSpeedProperty.value));
    timeSpeedProperty.link((speed) => {
      timeSeriesModel.playbackSpeedProperty.value = SPEED_VALUE.get(speed) ?? 1;
    });
    timeSeriesModel.playbackSpeedProperty.link((value) => {
      timeSpeedProperty.value = valueToSpeed(value);
    });

    const timeControlNode = new TimeControlNode(timeSeriesModel.isPlayingProperty, {
      timeSpeedProperty,
      timeSpeeds: [TimeSpeed.SLOW, TimeSpeed.NORMAL],
      flowBoxSpacing: 16,
      playPauseStepButtonOptions: {
        includeStepForwardButton: false,
        playPauseButtonOptions: {
          radius: 18,
          enabledProperty: playPauseEnabledProperty,
        },
      },
      tandem: Tandem.OPT_OUT,
    });

    const eraserButton = new EraserButton({
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
      align: "center",
      children: [timeControlNode, eraserButton],
      isDisposable: false,
    });
  }
}
