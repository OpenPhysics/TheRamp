/**
 * RecordPlaybackControlBar.ts
 *
 * Record / playback / rewind controls for the More Features screen.
 */
import { BooleanProperty, DerivedProperty } from "scenerystack/axon";
import { HBox, Text } from "scenerystack/scenery";
import { PhetFont, PlayPauseButton } from "scenerystack/scenery-phet";
import { Checkbox, TextPushButton } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import { MAX_RECORDING_TIME } from "../model/RampPhysicsConstants.js";
import type { TimeSeriesModel } from "../model/TimeSeriesModel.js";

const LABEL_FONT = new PhetFont(13);

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

    const playPauseButton = new PlayPauseButton(timeSeriesModel.isPlayingProperty, {
      radius: 18,
    });

    const rewindButton = new TextPushButton(timeControls.rewindStringProperty, {
      font: LABEL_FONT,
      listener: () => {
        timeSeriesModel.rewind();
      },
      enabledProperty: rewindEnabledProperty,
    });

    const slowMotionAdapterProperty = new BooleanProperty(false);
    slowMotionAdapterProperty.lazyLink((checked) => {
      timeSeriesModel.playbackSpeedProperty.value = checked ? 0.5 : 1;
    });

    const slowMotionCheckbox = new Checkbox(
      slowMotionAdapterProperty,
      new Text(timeControls.slowMotionStringProperty, {
        font: LABEL_FONT,
        maxWidth: 120,
      }),
    );

    const clearButton = new TextPushButton(timeControls.clearStringProperty, {
      font: LABEL_FONT,
      listener: requestClear,
    });

    super({
      spacing: 8,
      align: "center",
      children: [recordButton, playbackButton, playPauseButton, rewindButton, slowMotionCheckbox, clearButton],
    });
  }
}
