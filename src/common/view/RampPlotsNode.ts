/**
 * RampPlotsNode.ts
 *
 * Collapsible energy, work, and parallel-forces time-series plots.
 */
import type { BooleanProperty, ReadOnlyProperty } from "scenerystack/axon";
import type { ProfileColorProperty } from "scenerystack/scenery";
import { VBox } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import {
  getKineticEnergy,
  getPotentialEnergy,
  getTotalEnergy,
  getTotalWork,
  type RampPhysicsState,
} from "../model/RampPhysicsEngine.js";
import { PLOT_ENERGY_RANGE, PLOT_FORCE_RANGE } from "../RampConstants.js";
import { TimePlotNode } from "./TimePlotNode.js";

export interface SeriesDescriptor {
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly colorProperty: ProfileColorProperty;
  /** live value for the readout column */
  readonly liveProperty: ReadOnlyProperty<number>;
  /** value extracted from a recorded snapshot for plotting */
  readonly accessor: (state: RampPhysicsState) => number;
}

function createEnergySeries(model: RampModel): SeriesDescriptor[] {
  const energyStrings = StringManager.getInstance().getEnergyStrings();

  return [
    {
      labelStringProperty: energyStrings.kineticStringProperty,
      colorProperty: RampColors.kineticEnergyColorProperty,
      liveProperty: model.kineticEnergyProperty,
      accessor: getKineticEnergy,
    },
    {
      labelStringProperty: energyStrings.potentialStringProperty,
      colorProperty: RampColors.potentialEnergyColorProperty,
      liveProperty: model.potentialEnergyProperty,
      accessor: getPotentialEnergy,
    },
    {
      labelStringProperty: energyStrings.thermalStringProperty,
      colorProperty: RampColors.thermalEnergyColorProperty,
      liveProperty: model.thermalEnergyProperty,
      accessor: (s) => s.thermalEnergy,
    },
    {
      labelStringProperty: energyStrings.totalStringProperty,
      colorProperty: RampColors.totalEnergyColorProperty,
      liveProperty: model.totalEnergyProperty,
      accessor: getTotalEnergy,
    },
  ];
}

function createWorkSeries(model: RampModel): SeriesDescriptor[] {
  const workStrings = StringManager.getInstance().getWorkStrings();

  return [
    {
      labelStringProperty: workStrings.appliedStringProperty,
      colorProperty: RampColors.appliedWorkColorProperty,
      liveProperty: model.appliedWorkProperty,
      accessor: (s) => s.appliedWork,
    },
    {
      labelStringProperty: workStrings.gravityStringProperty,
      colorProperty: RampColors.gravityWorkColorProperty,
      liveProperty: model.gravityWorkProperty,
      accessor: (s) => s.gravityWork,
    },
    {
      labelStringProperty: workStrings.frictionStringProperty,
      colorProperty: RampColors.frictionWorkColorProperty,
      liveProperty: model.frictiveWorkProperty,
      accessor: (s) => s.frictiveWork,
    },
    {
      labelStringProperty: workStrings.totalStringProperty,
      colorProperty: RampColors.totalWorkColorProperty,
      liveProperty: model.totalWorkProperty,
      accessor: getTotalWork,
    },
  ];
}

function createParallelForceSeries(model: RampModel): SeriesDescriptor[] {
  const forceStrings = StringManager.getInstance().getForceStrings();

  return [
    {
      labelStringProperty: forceStrings.appliedStringProperty,
      colorProperty: RampColors.appliedForceColorProperty,
      liveProperty: model.appliedParallelProperty,
      accessor: (s) => s.appliedParallel,
    },
    {
      labelStringProperty: forceStrings.frictionStringProperty,
      colorProperty: RampColors.frictionForceColorProperty,
      liveProperty: model.frictionParallelProperty,
      accessor: (s) => s.frictionParallel,
    },
    {
      labelStringProperty: forceStrings.gravityStringProperty,
      colorProperty: RampColors.gravityForceColorProperty,
      liveProperty: model.gravityParallelProperty,
      accessor: (s) => s.gravityParallel,
    },
    {
      labelStringProperty: forceStrings.wallStringProperty,
      colorProperty: RampColors.wallForceColorProperty,
      liveProperty: model.wallParallelProperty,
      accessor: (s) => s.wallParallel,
    },
  ];
}

export class RampPlotsNode extends VBox {
  public constructor(
    model: RampModel,
    energyPlotExpandedProperty: BooleanProperty,
    workPlotExpandedProperty: BooleanProperty,
    forcePlotExpandedProperty: BooleanProperty,
    plotViewWidth?: number,
  ) {
    const energyStrings = StringManager.getInstance().getEnergyStrings();
    const workStrings = StringManager.getInstance().getWorkStrings();
    const forceStrings = StringManager.getInstance().getForceStrings();
    const timeSeriesModel = model.timeSeriesModel;

    const accordionOptions = {
      fill: RampColors.panelBackgroundColorProperty,
      stroke: RampColors.panelBorderColorProperty,
    };

    const plotOptions = {
      accordionOptions,
      ...(plotViewWidth !== undefined ? { plotViewWidth } : {}),
    };

    const energyPlot = new TimePlotNode(
      energyStrings.titleStringProperty,
      createEnergySeries(model),
      PLOT_ENERGY_RANGE,
      timeSeriesModel,
      energyPlotExpandedProperty,
      plotOptions,
    );

    const workPlot = new TimePlotNode(
      workStrings.titleStringProperty,
      createWorkSeries(model),
      PLOT_ENERGY_RANGE,
      timeSeriesModel,
      workPlotExpandedProperty,
      plotOptions,
    );

    const forcePlot = new TimePlotNode(
      forceStrings.parallelTitleStringProperty,
      createParallelForceSeries(model),
      PLOT_FORCE_RANGE,
      timeSeriesModel,
      forcePlotExpandedProperty,
      plotOptions,
    );

    super({
      spacing: 2,
      align: "left",
      children: [energyPlot, workPlot, forcePlot],
    });
  }
}
