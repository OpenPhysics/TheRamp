/**
 * OverheatNode.ts
 *
 * "Overheated." message and Cool Ramp button shown when thermal energy exceeds the limit.
 */
import { DerivedProperty } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { OVERHEAT_THERMAL_ENERGY } from "../model/RampPhysicsConstants.js";
import { CoolRampButton } from "./CoolRampButton.js";

export class OverheatNode extends VBox {
  public constructor(model: RampModel, playCoolSound: () => void) {
    const controls = StringManager.getInstance().getControlStrings();
    const messages = StringManager.getInstance().getMessageStrings();

    super({
      spacing: 8,
      align: "center",
      children: [
        new Text(messages.overheatedStringProperty, {
          font: new PhetFont({ size: 16, weight: "bold" }),
          fill: RampColors.thermalEnergyColorProperty,
        }),
        new CoolRampButton({
          radius: 22,
          accessibleName: controls.coolRampStringProperty,
          listener: () => {
            model.clearHeat();
            playCoolSound();
          },
        }),
      ],
    });

    this.visibleProperty = new DerivedProperty(
      [model.thermalEnergyProperty],
      (thermalEnergy) => thermalEnergy >= OVERHEAT_THERMAL_ENERGY,
    );
  }
}
