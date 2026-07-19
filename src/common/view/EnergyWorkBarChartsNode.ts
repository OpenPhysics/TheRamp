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
import TheRampColors from "../../TheRampColors.js";
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
      arrowColor: TheRampColors.thermalEnergyColorProperty,
      listener: () => {
        model.clearHeat();
        playCoolSound();
      },
      scale: 0.7,
      accessibleName: StringManager.getInstance().getA11yStrings().controls.clearThermalStringProperty,
      tandem: Tandem.OPT_OUT,
    });
    model.energy.thermalEnergyProperty.link((value) => {
      clearThermalButton.enabled = value > 0;
      clearThermalButton.pickable = value > 0;
    });

    const kineticEntry = {
      colorProperty: TheRampColors.kineticEnergyColorProperty,
      valueProperty: model.energy.kineticEnergyProperty,
    };
    const potentialEntry = {
      colorProperty: TheRampColors.potentialEnergyColorProperty,
      valueProperty: model.energy.potentialEnergyProperty,
    };
    const thermalEntry = {
      colorProperty: TheRampColors.thermalEnergyColorProperty,
      valueProperty: model.energy.thermalEnergyProperty,
    };

    const appliedEntry = {
      colorProperty: TheRampColors.appliedWorkColorProperty,
      valueProperty: model.energy.appliedWorkProperty,
    };
    const gravityEntry = {
      colorProperty: TheRampColors.gravityWorkColorProperty,
      valueProperty: model.energy.gravityWorkProperty,
    };
    const frictionEntry = {
      colorProperty: TheRampColors.frictionWorkColorProperty,
      valueProperty: model.energy.frictiveWorkProperty,
    };

    const energyBox = new BarChartAccordionBox({
      titleStringProperty: energyStrings.titleStringProperty,
      legendTitleStringProperty: energyStrings.legendStringProperty,
      expandedProperty: energyBarsExpandedProperty,
      legendItems: [
        {
          abbreviationStringProperty: energyStrings.kineticStringProperty,
          descriptionStringProperty: energyStrings.kineticEnergyStringProperty,
          colorProperty: TheRampColors.kineticEnergyColorProperty,
        },
        {
          abbreviationStringProperty: energyStrings.potentialStringProperty,
          descriptionStringProperty: energyStrings.potentialEnergyStringProperty,
          colorProperty: TheRampColors.potentialEnergyColorProperty,
        },
        {
          abbreviationStringProperty: energyStrings.thermalStringProperty,
          descriptionStringProperty: energyStrings.thermalEnergyStringProperty,
          colorProperty: TheRampColors.thermalEnergyColorProperty,
        },
        {
          abbreviationStringProperty: energyStrings.totalStringProperty,
          descriptionStringProperty: energyStrings.totalEnergyStringProperty,
          colorProperty: TheRampColors.totalEnergyColorProperty,
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
          colorProperty: TheRampColors.appliedWorkColorProperty,
        },
        {
          abbreviationStringProperty: workStrings.gravityStringProperty,
          descriptionStringProperty: workStrings.gravityWorkStringProperty,
          colorProperty: TheRampColors.gravityWorkColorProperty,
        },
        {
          abbreviationStringProperty: workStrings.frictionStringProperty,
          descriptionStringProperty: workStrings.frictionWorkStringProperty,
          colorProperty: TheRampColors.frictionWorkColorProperty,
        },
        {
          abbreviationStringProperty: workStrings.totalStringProperty,
          descriptionStringProperty: workStrings.totalWorkStringProperty,
          colorProperty: TheRampColors.totalWorkColorProperty,
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
