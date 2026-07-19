/**
 * CoolRampButton.ts
 *
 * Round icon button for clearing thermal energy (cooling the ramp).
 */
import { Shape } from "scenerystack/kite";
import { type EmptySelfOptions, optionize, type StrictOmit } from "scenerystack/phet-core";
import { Path } from "scenerystack/scenery";
import { RoundPushButton, type RoundPushButtonOptions } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import TheRampColors from "../../TheRampColors.js";

const DEFAULT_RADIUS = 20;

function createSnowflakeIcon(radius: number): Path {
  const armLength = radius * 0.55;
  const shape = new Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    shape.moveTo(0, 0);
    shape.lineTo(armLength * Math.cos(angle), armLength * Math.sin(angle));
  }
  return new Path(shape, {
    stroke: TheRampColors.coolRampSnowflakeColorProperty,
    lineWidth: 2,
    lineCap: "round",
  });
}

type CoolRampButtonOptions = StrictOmit<RoundPushButtonOptions, "content">;

export class CoolRampButton extends RoundPushButton {
  public constructor(providedOptions?: CoolRampButtonOptions) {
    const radius = providedOptions?.radius ?? DEFAULT_RADIUS;

    const options = optionize<CoolRampButtonOptions, EmptySelfOptions, RoundPushButtonOptions>()(
      {
        radius,
        content: createSnowflakeIcon(radius),
        tandem: Tandem.OPT_OUT,
      },
      providedOptions,
    );

    super(options);
  }
}
