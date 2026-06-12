/**
 * RecordPlaybackControlBar.ts
 *
 * Record / playback / rewind controls for the More Features screen.
 */
import { DerivedProperty, EnumerationProperty } from "scenerystack/axon";
import { HBox } from "scenerystack/scenery";
import { EraserButton, PhetFont, RestartButton, TimeControlNode, TimeSpeed } from "scenerystack/scenery-phet";
import { TextPushButton } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import { MAX_RECORDING_TIME } from "../model/RampPhysicsConstants.js";
import type { TimeSeriesModel } from "../model/TimeSeriesModel.js";

const LABEL_FONT = new PhetFont(13);
const TRANSPORT_BUTTON_RADIUS = 16;
const TRANSPORT_SPACING = 10;

const SPEED_VALUE = new Map<TimeSpeed, number>([
  [TimeSpeed.SLOW, 0.5],
  [TimeSpeed.NORMAL, 1],
]);

function valueToSpeed(value: number): TimeSpeed {
  return value <= 0.75 ? TimeSpeed.SLOW : TimeSpeed.NORMAL;
}

export class RecordPlaybackControlBar extends HBox {
  public constructor(timeSeriesModel: TimeSeriesModel, requestClear: () => void) {
    const timeControls = StringManager.getInstance().getTimeControlStrings();

    const recordEnabledProperty = new DerivedProperty(
      [timeSeriesModel.recordTimeProperty],
      (recordTime) => recordTime < MAX_RECORDING_TIME,
    );

    const playbackEnabledProperty = new DerivedProperty(
      [timeSeriesModel.recordTimeProperty],
      (recordTime) => recordTime > 0,
    );

    const rewindEnabledProperty = new DerivedProperty(
      [timeSeriesModel.modeProperty, timeSeriesModel.recordTimeProperty],
      (mode, recordTime) => mode === "playback" || recordTime > 0,
    );

    const recordButton = new TextPushButton(timeControls.recordStringProperty, {
      font: LABEL_FONT,
      listener: () => {
        timeSeriesModel.record();
      },
      enabledProperty: recordEnabledProperty,
    });

    const playbackButton = new TextPushButton(timeControls.playbackStringProperty, {
      font: LABEL_FONT,
      listener: () => {
        timeSeriesModel.playback();
      },
      enabledProperty: playbackEnabledProperty,
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
        playPauseStepXSpacing: TRANSPORT_SPACING,
        playPauseButtonOptions: { radius: 18 },
      },
      tandem: Tandem.OPT_OUT,
    });

    const rewindButton = new RestartButton({
      radius: TRANSPORT_BUTTON_RADIUS,
      listener: () => {
        timeSeriesModel.rewind();
      },
      enabledProperty: rewindEnabledProperty,
      accessibleName: timeControls.rewindStringProperty,
    });

    const transport = new HBox({
      spacing: TRANSPORT_SPACING,
      align: "center",
      children: [rewindButton, timeControlNode],
    });

    const eraserButton = new EraserButton({
      listener: requestClear,
      accessibleName: timeControls.clearStringProperty,
    });

    super({
      spacing: 8,
      align: "center",
      children: [recordButton, playbackButton, transport, eraserButton],
      isDisposable: false,
    });
  }
}
