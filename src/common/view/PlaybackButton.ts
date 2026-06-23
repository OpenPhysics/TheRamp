/**
 * PlaybackButton.ts
 *
 * Round play-icon button for starting time-series playback.
 */

import { type EmptySelfOptions, optionize, type StrictOmit } from "scenerystack/phet-core";
import { Path } from "scenerystack/scenery";
import { PlayIconShape } from "scenerystack/scenery-phet";
import { RoundPushButton, type RoundPushButtonOptions } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";

const DEFAULT_RADIUS = 16;

function createPlayIcon(radius: number): Path {
  const playWidth = radius * 0.8;
  const playHeight = radius;
  return new Path(new PlayIconShape(playWidth, playHeight), {
    fill: "black",
    centerX: radius * 0.05,
  });
}

type PlaybackButtonOptions = StrictOmit<RoundPushButtonOptions, "content">;

export class PlaybackButton extends RoundPushButton {
  public constructor(providedOptions?: PlaybackButtonOptions) {
    const radius = providedOptions?.radius ?? DEFAULT_RADIUS;

    const options = optionize<PlaybackButtonOptions, EmptySelfOptions, RoundPushButtonOptions>()(
      {
        radius,
        content: createPlayIcon(radius),
        tandem: Tandem.OPT_OUT,
      },
      providedOptions,
    );

    super(options);
  }
}
