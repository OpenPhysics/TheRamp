/**
 * TimePlotNode.ts
 *
 * One collapsible time-series plot with live readouts, bamboo chart, and scrub cursor.
 */
import type { BooleanProperty, ReadOnlyProperty } from "scenerystack/axon";
import { DerivedProperty } from "scenerystack/axon";
import { ChartRectangle, ChartTransform, GridLineSet, LinePlot, TickLabelSet, TickMarkSet } from "scenerystack/bamboo";
import { clamp, Range, toFixed, Vector2 } from "scenerystack/dot";
import { Orientation } from "scenerystack/phet-core";
import { DragListener, HBox, Line, Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { AccordionBoxOptions } from "scenerystack/sun";
import { AccordionBox } from "scenerystack/sun";
import RampColors from "../../RampColors.js";
import { MAX_RECORDING_TIME } from "../model/RampPhysicsConstants.js";
import type { TimeSeriesModel } from "../model/TimeSeriesModel.js";
import type { SeriesDescriptor } from "./RampPlotsNode.js";

const DEFAULT_CHART_VIEW_WIDTH = 480;
const CHART_VIEW_HEIGHT = 110;
const READOUT_COLUMN_WIDTH = 110;
const READOUT_FONT = new PhetFont(11);
const TITLE_FONT = new PhetFont(14);

export interface TimePlotNodeOptions {
  accordionOptions: Pick<AccordionBoxOptions, "fill" | "stroke">;
  plotViewWidth?: number;
}

export class TimePlotNode extends AccordionBox {
  public constructor(
    titleStringProperty: ReadOnlyProperty<string>,
    series: readonly SeriesDescriptor[],
    yRange: Range,
    timeSeriesModel: TimeSeriesModel,
    expandedProperty: BooleanProperty,
    options: TimePlotNodeOptions,
  ) {
    const chartViewWidth = options.plotViewWidth ?? DEFAULT_CHART_VIEW_WIDTH;
    const chartTransform = new ChartTransform({
      viewWidth: chartViewWidth,
      viewHeight: CHART_VIEW_HEIGHT,
      modelXRange: new Range(0, MAX_RECORDING_TIME),
      modelYRange: yRange,
    });

    const chartRectangle = new ChartRectangle(chartTransform, {
      fill: RampColors.chartBackgroundColorProperty,
      stroke: RampColors.panelBorderColorProperty,
    });

    const chartNode = new Node({
      clipArea: chartRectangle.getShape(),
      children: [
        chartRectangle,
        new GridLineSet(chartTransform, Orientation.HORIZONTAL, yRange.max / 2, {
          stroke: RampColors.chartGridColorProperty,
        }),
        new GridLineSet(chartTransform, Orientation.VERTICAL, 5, {
          stroke: RampColors.chartGridColorProperty,
        }),
        new TickMarkSet(chartTransform, Orientation.HORIZONTAL, 10, {
          edge: "min",
          stroke: RampColors.textColorProperty,
        }),
        new TickLabelSet(chartTransform, Orientation.HORIZONTAL, 10, {
          edge: "min",
          createLabel: (value) =>
            new Text(`${value}`, {
              font: READOUT_FONT,
              fill: RampColors.textColorProperty,
            }),
        }),
        new TickMarkSet(chartTransform, Orientation.VERTICAL, yRange.max, {
          edge: "min",
          origin: -yRange.max,
          stroke: RampColors.textColorProperty,
        }),
        new TickLabelSet(chartTransform, Orientation.VERTICAL, yRange.max, {
          edge: "min",
          origin: -yRange.max,
          createLabel: (value) =>
            new Text(`${value}`, {
              font: READOUT_FONT,
              fill: RampColors.textColorProperty,
            }),
        }),
      ],
    });

    const dataSets: Vector2[][] = series.map(() => []);
    const linePlots: LinePlot[] = [];
    for (let i = 0; i < series.length; i++) {
      const descriptor = series[i];
      const dataSet = dataSets[i];
      if (!(descriptor && dataSet)) {
        continue;
      }
      const plot = new LinePlot(chartTransform, dataSet, {
        stroke: descriptor.colorProperty,
        lineWidth: 1.5,
      });
      chartNode.addChild(plot);
      linePlots.push(plot);
    }

    timeSeriesModel.dataPointAddedEmitter.addListener((time, state) => {
      for (let i = 0; i < series.length; i++) {
        const descriptor = series[i];
        const dataSet = dataSets[i];
        if (descriptor && dataSet) {
          dataSet.push(new Vector2(time, descriptor.accessor(state)));
        }
      }
      for (const plot of linePlots) {
        plot.update();
      }
    });

    timeSeriesModel.clearedEmitter.addListener(() => {
      for (const dataSet of dataSets) {
        dataSet.length = 0;
      }
      for (const plot of linePlots) {
        plot.update();
      }
    });

    const cursorTimeProperty = new DerivedProperty(
      [timeSeriesModel.modeProperty, timeSeriesModel.recordTimeProperty, timeSeriesModel.playbackTimeProperty],
      (mode, recordTime, playbackTime) => (mode === "record" ? recordTime : playbackTime),
    );

    const cursorLine = new Line(0, 0, 0, CHART_VIEW_HEIGHT, {
      stroke: RampColors.accentColorProperty,
      lineWidth: 2,
      cursor: "ew-resize",
    });

    const updateCursorPosition = (time: number): void => {
      const x = chartTransform.modelToViewX(time);
      cursorLine.setX1(x);
      cursorLine.setX2(x);
    };
    cursorTimeProperty.link(updateCursorPosition);

    cursorLine.addInputListener(
      new DragListener({
        drag: (event) => {
          const x = chartNode.globalToLocalPoint(event.pointer.point).x;
          timeSeriesModel.setPlaybackTime(chartTransform.viewToModelX(clamp(x, 0, chartViewWidth)));
        },
      }),
    );

    chartNode.addChild(cursorLine);

    const readoutRows = series.map((descriptor) => {
      const valueText = new Text("0", {
        font: READOUT_FONT,
        fill: RampColors.textColorProperty,
      });

      const formattedValueProperty = new DerivedProperty([descriptor.liveProperty], (value) => toFixed(value, 0));
      formattedValueProperty.link((text) => {
        valueText.string = text;
      });

      return new HBox({
        spacing: 4,
        align: "center",
        children: [
          new Text(descriptor.labelStringProperty, {
            font: READOUT_FONT,
            fill: descriptor.colorProperty,
            maxWidth: 60,
          }),
          valueText,
        ],
      });
    });

    const readoutColumn = new VBox({
      spacing: 2,
      align: "left",
      preferredWidth: READOUT_COLUMN_WIDTH,
      children: readoutRows,
    });

    const contentNode = new HBox({
      spacing: 6,
      align: "top",
      children: [readoutColumn, chartNode],
    });

    super(contentNode, {
      ...options.accordionOptions,
      titleNode: new Text(titleStringProperty, {
        font: TITLE_FONT,
        fill: RampColors.textColorProperty,
      }),
      expandedProperty,
      // Collapsed plots show only the title bar (Java minimized state), not the full chart width.
      useExpandedBoundsWhenCollapsed: false,
      useContentWidthWhenCollapsed: false,
      titleAlignX: "left",
      buttonYMargin: 2,
      titleYMargin: 2,
      cornerRadius: 7,
    });
  }
}
