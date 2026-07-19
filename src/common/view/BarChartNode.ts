/**
 * BarChartNode.ts
 *
 * Qualitative bar chart for energy and work readouts. Bars grow up for positive values
 * and down for negative values. When a bar exceeds the visible range, an arrow indicates
 * continued growth. Multiple entries in one group are stacked (used for the Total bar).
 */
import { NumberProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { clamp } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Line, Node, Path, type ProfileColorProperty, Rectangle, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import TheRampColors from "../../TheRampColors.js";
import { ENERGY_BAR_SCALE } from "../../TheRampConstants.js";

export interface BarDataEntry {
  readonly colorProperty: ProfileColorProperty;
  readonly valueProperty: ReadOnlyProperty<number>;
}

export interface BarChartGroup {
  readonly entries: readonly BarDataEntry[];
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly labelNode?: Node | null;
}

export interface BarChartNodeOptions {
  readonly scaleProperty?: ReadOnlyProperty<number>;
  readonly barWidth?: number;
  readonly barSpacing?: number;
  readonly maxBarHeightUp?: number;
  readonly maxBarHeightDown?: number;
}

const DEFAULT_BAR_WIDTH = 16;
const DEFAULT_BAR_SPACING = 5;
const DEFAULT_MAX_BAR_HEIGHT_UP = 73;
const DEFAULT_MAX_BAR_HEIGHT_DOWN = 20;
const OVERFLOW_SIZE = 8;
const LABEL_BACKGROUND_OPACITY = 0.7;
const Y_AXIS_TOP_MARGIN = 8;

function createUpTriangle(centerX: number, baseY: number, size: number): Shape {
  const half = size / 2;
  return new Shape()
    .moveTo(centerX, baseY - size)
    .lineTo(centerX - half, baseY)
    .lineTo(centerX + half, baseY)
    .close();
}

function createDownTriangle(centerX: number, baseY: number, size: number): Shape {
  const half = size / 2;
  return new Shape()
    .moveTo(centerX, baseY + size)
    .lineTo(centerX - half, baseY)
    .lineTo(centerX + half, baseY)
    .close();
}

function getBarHeight(
  value: number,
  scale: number,
  maxUp: number,
  maxDown: number,
): {
  height: number;
  clampedTop: boolean;
  clampedBottom: boolean;
} {
  const rawH = value * scale;
  return {
    height: clamp(rawH, -maxDown, maxUp),
    clampedTop: rawH > maxUp,
    clampedBottom: rawH < -maxDown,
  };
}

export class BarChartNode extends Node {
  private readonly updateCallbacks: (() => void)[] = [];
  private readonly scaleProperty: ReadOnlyProperty<number>;
  private readonly maxBarHeightUp: number;
  private readonly maxBarHeightDown: number;

  public constructor(groups: readonly BarChartGroup[], providedOptions?: BarChartNodeOptions) {
    super();

    const barWidth = providedOptions?.barWidth ?? DEFAULT_BAR_WIDTH;
    const barSpacing = providedOptions?.barSpacing ?? DEFAULT_BAR_SPACING;
    this.maxBarHeightUp = providedOptions?.maxBarHeightUp ?? DEFAULT_MAX_BAR_HEIGHT_UP;
    this.maxBarHeightDown = providedOptions?.maxBarHeightDown ?? DEFAULT_MAX_BAR_HEIGHT_DOWN;
    this.scaleProperty = providedOptions?.scaleProperty ?? new NumberProperty(ENERGY_BAR_SCALE);

    const chartWidth = groups.length * (barWidth + barSpacing) - barSpacing;

    this.addChild(
      new ArrowNode(0, 0, 0, -(this.maxBarHeightUp - Y_AXIS_TOP_MARGIN), {
        fill: TheRampColors.readoutTextColorProperty,
        stroke: null,
        headHeight: 8,
        headWidth: 8,
        tailWidth: 3,
      }),
    );

    this.addChild(
      new Line(0, 0, chartWidth, 0, {
        stroke: TheRampColors.chartGridColorProperty,
        lineWidth: 1,
      }),
    );

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (!group) {
        continue;
      }

      const x = i * (barWidth + barSpacing);
      const barCenterX = x + barWidth / 2;
      const barLayer = new Node();
      const overflowTriangle = new Path(null, {
        visible: false,
      });

      // The chart background is TheRampColors.chartBackgroundColorProperty (light in both
      // profiles), so labels use the readout text color rather than the panel text color.
      const labelText = new Text(group.labelStringProperty, {
        font: new PhetFont(11),
        fill: TheRampColors.readoutTextColorProperty,
        maxWidth: 60,
        rotation: -Math.PI / 4,
      });

      const labelContent = new Node({
        children: group.labelNode ? [labelText, group.labelNode] : [labelText],
      });

      const labelBackground = new Rectangle(0, 0, 1, 1, {
        fill: TheRampColors.chartBackgroundColorProperty,
        opacity: LABEL_BACKGROUND_OPACITY,
        stroke: null,
      });

      const labelContainer = new Node({
        children: [labelBackground, labelContent],
      });

      const positionLabel = (): void => {
        labelText.right = barCenterX;
        labelText.top = 4;
        if (group.labelNode) {
          group.labelNode.centerY = labelText.centerY;
          group.labelNode.left = labelText.right + 2;
        }

        const contentBounds = labelContent.localBounds;
        labelBackground.setRect(
          contentBounds.minX - 2,
          contentBounds.minY - 1,
          contentBounds.width + 4,
          contentBounds.height + 2,
        );
      };
      positionLabel();

      const updateGroup = (): void => {
        barLayer.removeAllChildren();

        const scale = this.scaleProperty.value;
        let positiveOffset = 0;
        let negativeOffset = 0;
        let clampedTop = false;
        let clampedBottom = false;

        for (const entry of group.entries) {
          const value = entry.valueProperty.value;
          const {
            height,
            clampedTop: top,
            clampedBottom: bottom,
          } = getBarHeight(value, scale, this.maxBarHeightUp - positiveOffset, this.maxBarHeightDown - negativeOffset);
          clampedTop ||= top;
          clampedBottom ||= bottom;

          if (height >= 0) {
            const bar = new Rectangle(x, -(positiveOffset + height), barWidth, height, {
              fill: entry.colorProperty,
            });
            barLayer.addChild(bar);
            positiveOffset += height;
          } else if (height < 0) {
            const absH = Math.abs(height);
            const bar = new Rectangle(x, negativeOffset, barWidth, absH, {
              fill: entry.colorProperty,
            });
            barLayer.addChild(bar);
            negativeOffset += absH;
          }
        }

        if (clampedTop) {
          overflowTriangle.shape = createUpTriangle(barCenterX, -positiveOffset, OVERFLOW_SIZE);
          overflowTriangle.fill =
            group.entries[group.entries.length - 1]?.colorProperty ?? TheRampColors.readoutTextColorProperty;
          overflowTriangle.visible = true;
        } else if (clampedBottom) {
          overflowTriangle.shape = createDownTriangle(barCenterX, negativeOffset, OVERFLOW_SIZE);
          overflowTriangle.fill =
            group.entries[group.entries.length - 1]?.colorProperty ?? TheRampColors.readoutTextColorProperty;
          overflowTriangle.visible = true;
        } else {
          overflowTriangle.visible = false;
        }
      };

      for (const entry of group.entries) {
        entry.valueProperty.link(updateGroup);
      }
      this.scaleProperty.link(updateGroup);
      this.updateCallbacks.push(updateGroup);
      updateGroup();

      this.addChild(barLayer);
      this.addChild(overflowTriangle);
      this.addChild(labelContainer);
    }
  }

  /** Recomputes all bar heights (e.g. after accordion expand). */
  public update(): void {
    for (const callback of this.updateCallbacks) {
      callback();
    }
  }
}
