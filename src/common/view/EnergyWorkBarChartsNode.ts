/**
 * EnergyWorkBarChartsNode.ts
 *
 * Collapsible Energy and Work bar-chart panels to the left of the control panel.
 */
import type { BooleanProperty } from "scenerystack/axon";
import { HBox } from "scenerystack/scenery";
import { MoveToTrashLegendButton } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { BarChartAccordionBox } from "./BarChartAccordionBox.js";

export class EnergyWorkBarChartsNode extends HBox {
  private readonly energyBox: BarChartAccordionBox;
  private readonly workBox: BarChartAccordionBox;

  public constructor(
    model: RampModel,
    energyBarsExpandedProperty: BooleanProperty,
    workBarsExpandedProperty: BooleanProperty,
    playCoolSound: () => void,
  ) {
    const energyStrings = StringManager.getInstance().getEnergyStrings();
    const workStrings = StringManager.getInstance().getWorkStrings();

    const clearThermalButton = new MoveToTrashLegendButton({
      arrowColor: RampColors.thermalEnergyColorProperty,
      listener: () => {
        model.clearHeat();
        playCoolSound();
      },
      scale: 0.7,
      accessibleName: StringManager.getInstance().getA11yStrings().controls.clearThermalStringProperty,
      tandem: Tandem.OPT_OUT,
    });
    model.thermalEnergyProperty.link((value) => {
      clearThermalButton.enabled = value > 0;
      clearThermalButton.pickable = value > 0;
    });

    const kineticEntry = {
      colorProperty: RampColors.kineticEnergyColorProperty,
      valueProperty: model.kineticEnergyProperty,
    };
    const potentialEntry = {
      colorProperty: RampColors.potentialEnergyColorProperty,
      valueProperty: model.potentialEnergyProperty,
    };
    const thermalEntry = {
      colorProperty: RampColors.thermalEnergyColorProperty,
      valueProperty: model.thermalEnergyProperty,
    };

    const appliedEntry = {
      colorProperty: RampColors.appliedWorkColorProperty,
      valueProperty: model.appliedWorkProperty,
    };
    const gravityEntry = {
      colorProperty: RampColors.gravityWorkColorProperty,
      valueProperty: model.gravityWorkProperty,
    };
    const frictionEntry = {
      colorProperty: RampColors.frictionWorkColorProperty,
      valueProperty: model.frictiveWorkProperty,
    };

    const energyBox = new BarChartAccordionBox({
      titleStringProperty: energyStrings.titleStringProperty,
      legendTitleStringProperty: energyStrings.legendStringProperty,
      expandedProperty: energyBarsExpandedProperty,
      legendItems: [
        {
          abbreviationStringProperty: energyStrings.kineticStringProperty,
          descriptionStringProperty: energyStrings.kineticEnergyStringProperty,
          colorProperty: RampColors.kineticEnergyColorProperty,
        },
        {
          abbreviationStringProperty: energyStrings.potentialStringProperty,
          descriptionStringProperty: energyStrings.potentialEnergyStringProperty,
          colorProperty: RampColors.potentialEnergyColorProperty,
        },
        {
          abbreviationStringProperty: energyStrings.thermalStringProperty,
          descriptionStringProperty: energyStrings.thermalEnergyStringProperty,
          colorProperty: RampColors.thermalEnergyColorProperty,
        },
        {
          abbreviationStringProperty: energyStrings.totalStringProperty,
          descriptionStringProperty: energyStrings.totalEnergyStringProperty,
          colorProperty: RampColors.totalEnergyColorProperty,
        },
      ],
      groups: [
        {
          entries: [kineticEntry],
          labelStringProperty: energyStrings.kineticStringProperty,
        },
        {
          entries: [potentialEntry],
          labelStringProperty: energyStrings.potentialStringProperty,
        },
        {
          entries: [thermalEntry],
          labelStringProperty: energyStrings.thermalStringProperty,
          labelNode: clearThermalButton,
        },
        {
          entries: [kineticEntry, potentialEntry, thermalEntry],
          labelStringProperty: energyStrings.totalStringProperty,
        },
      ],
    });

    const workBox = new BarChartAccordionBox({
      titleStringProperty: workStrings.titleStringProperty,
      legendTitleStringProperty: workStrings.legendStringProperty,
      expandedProperty: workBarsExpandedProperty,
      legendItems: [
        {
          abbreviationStringProperty: workStrings.appliedStringProperty,
          descriptionStringProperty: workStrings.appliedWorkStringProperty,
          colorProperty: RampColors.appliedWorkColorProperty,
        },
        {
          abbreviationStringProperty: workStrings.gravityStringProperty,
          descriptionStringProperty: workStrings.gravityWorkStringProperty,
          colorProperty: RampColors.gravityWorkColorProperty,
        },
        {
          abbreviationStringProperty: workStrings.frictionStringProperty,
          descriptionStringProperty: workStrings.frictionWorkStringProperty,
          colorProperty: RampColors.frictionWorkColorProperty,
        },
        {
          abbreviationStringProperty: workStrings.totalStringProperty,
          descriptionStringProperty: workStrings.totalWorkStringProperty,
          colorProperty: RampColors.totalWorkColorProperty,
        },
      ],
      groups: [
        {
          entries: [appliedEntry],
          labelStringProperty: workStrings.appliedStringProperty,
        },
        {
          entries: [gravityEntry],
          labelStringProperty: workStrings.gravityStringProperty,
        },
        {
          entries: [frictionEntry],
          labelStringProperty: workStrings.frictionStringProperty,
        },
        {
          entries: [appliedEntry, gravityEntry, frictionEntry],
          labelStringProperty: workStrings.totalStringProperty,
        },
      ],
    });

    super({
      spacing: 10,
      align: "top",
      children: [energyBox, workBox],
    });

    this.energyBox = energyBox;
    this.workBox = workBox;
  }

  public resetZoom(): void {
    this.energyBox.resetZoom();
    this.workBox.resetZoom();
  }
}
