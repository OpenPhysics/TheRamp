/**
 * BarChartAccordionBox.ts
 *
 * Collapsible bar-chart panel with zoom controls, a legend info button, and a
 * white chart background — modeled after PhET's Masses and Springs energy graph.
 */

import type { BooleanProperty, ReadOnlyProperty } from "scenerystack/axon";
import { DerivedProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { ProfileColorProperty } from "scenerystack/scenery";
import { AlignBox, AlignGroup, HBox, HStrut, Node, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { InfoButton, PhetFont, ZoomButton } from "scenerystack/scenery-phet";
import { Dialog } from "scenerystack/sim";
import { AccordionBox, ColorConstants } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import TheRampColors from "../../TheRampColors.js";
import { ENERGY_BAR_SCALE } from "../../TheRampConstants.js";
import { type BarChartGroup, BarChartNode } from "./BarChartNode.js";

export interface LegendItem {
  readonly abbreviationStringProperty: ReadOnlyProperty<string>;
  readonly descriptionStringProperty: ReadOnlyProperty<string>;
  readonly colorProperty: ProfileColorProperty | string;
}

export interface BarChartAccordionBoxOptions {
  readonly titleStringProperty: ReadOnlyProperty<string>;
  readonly legendTitleStringProperty: ReadOnlyProperty<string>;
  readonly legendItems: readonly LegendItem[];
  readonly groups: readonly BarChartGroup[];
  readonly expandedProperty: BooleanProperty;
}

const LEGEND_ABBREVIATION_MAX_WIDTH = 100;
const LEGEND_DESCRIPTION_MAX_WIDTH = 500;
const BACKGROUND_WIDTH = 160;
const BACKGROUND_HEIGHT = 173;
const PANEL_CORNER_RADIUS = 7;
const DEFAULT_ZOOM_LEVEL = 0;
const ZOOM_LEVEL_RANGE = new Range(-2, 4);

const zoomButtonOptions = {
  baseColor: ColorConstants.LIGHT_BLUE,
  xMargin: 8,
  yMargin: 4,
  magnifyingGlassOptions: {
    glassRadius: 7,
  },
  touchAreaXDilation: 5,
  touchAreaYDilation: 5,
  tandem: Tandem.OPT_OUT,
};

export class BarChartAccordionBox extends AccordionBox {
  public readonly zoomLevelProperty: NumberProperty;
  private readonly barChartNode: BarChartNode;

  public constructor(options: BarChartAccordionBoxOptions) {
    const zoomLevelProperty = new NumberProperty(DEFAULT_ZOOM_LEVEL, {
      range: ZOOM_LEVEL_RANGE,
    });

    const scaleFactorProperty = new DerivedProperty([zoomLevelProperty], (zoomLevel) => {
      return ENERGY_BAR_SCALE * 2 ** zoomLevel;
    });

    const barChartNode = new BarChartNode(options.groups, {
      scaleProperty: scaleFactorProperty,
      barWidth: 18,
      barSpacing: 5,
    });

    const background = new Rectangle(0, 0, BACKGROUND_WIDTH, BACKGROUND_HEIGHT, {
      fill: TheRampColors.chartBackgroundColorProperty,
      stroke: TheRampColors.chartGridColorProperty,
      lineWidth: 0.8,
      cornerRadius: PANEL_CORNER_RADIUS,
    });
    barChartNode.center = background.center.plusXY(0, 5);

    const chartNode = new Node({
      children: [background, barChartNode],
    });

    const a11yControls = StringManager.getInstance().getA11yStrings().controls;
    const zoomInButton = new ZoomButton({
      in: true,
      accessibleName: a11yControls.zoomInStringProperty,
      ...zoomButtonOptions,
    });
    const zoomOutButton = new ZoomButton({
      in: false,
      accessibleName: a11yControls.zoomOutStringProperty,
      ...zoomButtonOptions,
    });

    zoomInButton.addListener(() => {
      zoomLevelProperty.value = Math.min(zoomLevelProperty.value + 1, ZOOM_LEVEL_RANGE.max);
    });
    zoomOutButton.addListener(() => {
      zoomLevelProperty.value = Math.max(zoomLevelProperty.value - 1, ZOOM_LEVEL_RANGE.min);
    });

    zoomLevelProperty.link((zoomLevel) => {
      zoomInButton.enabled = zoomLevel < ZOOM_LEVEL_RANGE.max;
      zoomOutButton.enabled = zoomLevel > ZOOM_LEVEL_RANGE.min;
    });

    const abbreviationGroup = new AlignGroup();
    const descriptionGroup = new AlignGroup();
    const legendAbbreviationFont = new PhetFont(16);
    const legendDescriptionFont = new PhetFont(16);

    const dialogContent = new VBox({
      spacing: 15,
      children: options.legendItems.map((item) => {
        const colorSwatch = new Rectangle(0, 0, 13, 13, {
          fill: item.colorProperty,
          stroke: TheRampColors.textColorProperty,
        });

        return new HBox({
          spacing: 20,
          children: [
            new AlignBox(
              new HBox({
                spacing: 14,
                children: [
                  colorSwatch,
                  new RichText(item.abbreviationStringProperty, {
                    font: legendAbbreviationFont,
                    fill: TheRampColors.textColorProperty,
                    maxWidth: LEGEND_ABBREVIATION_MAX_WIDTH,
                  }),
                ],
              }),
              {
                group: abbreviationGroup,
                xAlign: "left",
              },
            ),
            new AlignBox(
              new Text(item.descriptionStringProperty, {
                font: legendDescriptionFont,
                fill: TheRampColors.textColorProperty,
              }),
              {
                group: descriptionGroup,
                xAlign: "left",
                maxWidth: LEGEND_DESCRIPTION_MAX_WIDTH,
              },
            ),
          ],
        });
      }),
    });

    let legendDialog: Dialog | null = null;

    const infoButton = new InfoButton({
      maxHeight: 1.1 * zoomInButton.height,
      centerY: zoomOutButton.centerY,
      accessibleName: a11yControls.energyGraphInfoStringProperty,
      tandem: Tandem.OPT_OUT,
      listener: () => {
        if (!legendDialog) {
          legendDialog = new Dialog(dialogContent, {
            fill: TheRampColors.panelBackgroundColorProperty,
            stroke: TheRampColors.panelBorderColorProperty,
            closeButtonColor: TheRampColors.textColorProperty,
            ySpacing: 20,
            bottomMargin: 20,
            title: new Text(options.legendTitleStringProperty, {
              font: new PhetFont(28),
              fill: TheRampColors.textColorProperty,
              maxWidth: LEGEND_ABBREVIATION_MAX_WIDTH * 2,
            }),
            hideCallback: () => {
              legendDialog?.dispose();
              legendDialog = null;
            },
          });
        }
        legendDialog.show();
      },
    });

    const displayButtons = new HBox({
      spacing: 12,
      children: [infoButton, new HStrut(18), zoomOutButton, zoomInButton],
    });
    displayButtons.left = chartNode.left;

    const accordionBoxContent = new VBox({
      spacing: 4,
      children: [chartNode, displayButtons],
    });

    super(accordionBoxContent, {
      fill: TheRampColors.panelBackgroundColorProperty,
      stroke: TheRampColors.panelBorderColorProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
      buttonYMargin: 4,
      titleNode: new Text(options.titleStringProperty, {
        font: new PhetFont(14),
        fill: TheRampColors.textColorProperty,
        maxWidth: LEGEND_ABBREVIATION_MAX_WIDTH + 40,
      }),
      expandedProperty: options.expandedProperty,
    });

    this.zoomLevelProperty = zoomLevelProperty;
    this.barChartNode = barChartNode;

    this.expandedProperty.link((expanded) => {
      if (expanded) {
        this.barChartNode.update();
      }
    });
  }

  public resetZoom(): void {
    this.zoomLevelProperty.reset();
  }

  public updateChart(): void {
    this.barChartNode.update();
  }
}
