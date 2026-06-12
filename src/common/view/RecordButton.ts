/**
 * RecordButton.ts
 *
 * Round record-icon button for starting time-series recording.
 */

import type { StrictOmit } from "scenerystack/phet-core";
import { Circle } from "scenerystack/scenery";
import { PhetColorScheme } from "scenerystack/scenery-phet";
import { RoundPushButton, type RoundPushButtonOptions } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";

const DEFAULT_RADIUS = 18;

function createRecordIcon(radius: number): Circle {
  const squareLength = 0.75 * radius;
  return new Circle(0.6 * squareLength, {
    fill: PhetColorScheme.RED_COLORBLIND,
  });
}

type RecordButtonOptions = StrictOmit<RoundPushButtonOptions, "content">;

export class RecordButton extends RoundPushButton {
  public constructor(providedOptions?: RecordButtonOptions) {
    const radius = providedOptions?.radius ?? DEFAULT_RADIUS;

    super({
      radius,
      xMargin: (radius * 16.5) / 30,
      yMargin: (radius * 16.5) / 30,
      content: createRecordIcon(radius),
      tandem: Tandem.OPT_OUT,
      ...providedOptions,
    });
  }
}
