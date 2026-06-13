/**
 * RampScreenView.ts
 *
 * Base ScreenView for both Ramp screens: world scene, collision audio, controls, Reset All.
 */
import { BooleanProperty, Property } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { MeasuringTapeNode, type MeasuringTapeUnits, ResetAllButton } from "scenerystack/scenery-phet";
import type { ScreenViewOptions } from "scenerystack/sim";
import { ScreenView } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import { CollisionSoundPlayer } from "../audio/CollisionSoundPlayer.js";
import { SynthesizedSounds } from "../audio/synthesizeSoundClip.js";
import type { RampModel } from "../model/RampModel.js";
import { MODEL_VIEW_SCALE, SCREEN_VIEW_MARGIN } from "../RampConstants.js";
import { showConfirmDialog } from "./ConfirmDialog.js";
import { EnergyWorkBarChartsNode } from "./EnergyWorkBarChartsNode.js";
import { FreeBodyDiagramNode } from "./FreeBodyDiagramNode.js";
import { GoPauseClearPanel } from "./GoPauseClearPanel.js";
import { OverheatNode } from "./OverheatNode.js";
import { RampControlPanel } from "./RampControlPanel.js";
import { RampPlotsNode } from "./RampPlotsNode.js";
import { RampSceneNode } from "./RampSceneNode.js";
import { RecordPlaybackControlBar } from "./RecordPlaybackControlBar.js";
import { ZeroPointPeLineNode } from "./ZeroPointPeLineNode.js";

export interface RampScreenViewFeatures {
  hasFreeBodyDiagram?: boolean;
  hasObjectComboBox?: boolean;
  hasFrictionSlider?: boolean;
  hasMassSlider?: boolean;
  hasMeasuringTape?: boolean;
  hasZeroPointControl?: boolean;
  hasVectorFrameControls?: boolean;
  hasForceVisibilityControls?: boolean;
  hasRecordPlaybackBar?: boolean;
  energyBarsExpanded?: boolean;
  workBarsExpanded?: boolean;
  energyPlotExpanded?: boolean;
  workPlotExpanded?: boolean;
  forcePlotExpanded?: boolean;
  plotViewWidth?: number;
}

export class RampScreenView extends ScreenView {
  protected readonly sceneNode: RampSceneNode;
  protected readonly controlPanel: RampControlPanel;
  protected readonly goPauseClearPanel: GoPauseClearPanel | null;
  protected readonly plotsNode: RampPlotsNode;
  protected readonly energyWorkBarChartsNode: EnergyWorkBarChartsNode;
  protected readonly energyBarsExpandedProperty: BooleanProperty;
  protected readonly workBarsExpandedProperty: BooleanProperty;
  protected readonly energyPlotExpandedProperty: BooleanProperty;
  protected readonly workPlotExpandedProperty: BooleanProperty;
  protected readonly forcePlotExpandedProperty: BooleanProperty;
  protected readonly measuringTapeVisibleProperty: BooleanProperty;
  protected readonly zeroPointVisibleProperty: BooleanProperty;
  private measuringTape: MeasuringTapeNode | null = null;

  public constructor(model: RampModel, features: RampScreenViewFeatures = {}, options?: ScreenViewOptions) {
    super(options);

    this.energyBarsExpandedProperty = new BooleanProperty(features.energyBarsExpanded ?? false);
    this.workBarsExpandedProperty = new BooleanProperty(features.workBarsExpanded ?? false);
    this.energyPlotExpandedProperty = new BooleanProperty(features.energyPlotExpanded ?? false);
    this.workPlotExpandedProperty = new BooleanProperty(features.workPlotExpanded ?? false);
    this.forcePlotExpandedProperty = new BooleanProperty(features.forcePlotExpanded ?? true);
    this.measuringTapeVisibleProperty = new BooleanProperty(false);
    this.zeroPointVisibleProperty = new BooleanProperty(false);
    this.sceneNode = new RampSceneNode(model, this.visibleBoundsProperty);
    this.addChild(this.sceneNode);

    if (features.hasZeroPointControl) {
      this.addChild(new ZeroPointPeLineNode(model, this.sceneNode.modelViewTransform, this.zeroPointVisibleProperty));
    }

    if (features.hasFreeBodyDiagram) {
      const freeBodyDiagramNode = new FreeBodyDiagramNode(model);
      freeBodyDiagramNode.left = SCREEN_VIEW_MARGIN;
      freeBodyDiagramNode.top = SCREEN_VIEW_MARGIN;
      this.addChild(freeBodyDiagramNode);
    }

    const coolSound = SynthesizedSounds.chime();
    const playCoolSound = (): void => {
      if (model.soundEnabledProperty.value) {
        coolSound.play();
      }
    };

    this.energyWorkBarChartsNode = new EnergyWorkBarChartsNode(
      model,
      this.energyBarsExpandedProperty,
      this.workBarsExpandedProperty,
      playCoolSound,
    );
    this.energyWorkBarChartsNode.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN - 240;
    this.energyWorkBarChartsNode.top = SCREEN_VIEW_MARGIN;
    this.addChild(this.energyWorkBarChartsNode);

    const overheatNode = new OverheatNode(model, playCoolSound);
    overheatNode.center = new Vector2(330, 200);
    this.addChild(overheatNode);

    const messages = StringManager.getInstance().getMessageStrings();

    this.plotsNode = new RampPlotsNode(
      model,
      this.energyPlotExpandedProperty,
      this.workPlotExpandedProperty,
      this.forcePlotExpandedProperty,
      features.plotViewWidth,
    );
    this.plotsNode.left = SCREEN_VIEW_MARGIN;

    const hasRecordPlaybackBar = features.hasRecordPlaybackBar ?? false;
    this.plotsNode.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;
    if (hasRecordPlaybackBar) {
      this.goPauseClearPanel = null;
      const recordPlaybackControlBar = new RecordPlaybackControlBar(model.timeSeriesModel, () => {
        showConfirmDialog(
          messages.confirmClearTitleStringProperty,
          messages.confirmClearGraphsStringProperty,
          StringManager.getInstance().getTimeControlStrings().clearStringProperty,
          () => model.timeSeriesModel.clear(),
        );
      });
      recordPlaybackControlBar.centerX = this.layoutBounds.centerX;
      recordPlaybackControlBar.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;
      this.addChild(this.plotsNode);
      this.addChild(recordPlaybackControlBar);
    } else {
      this.goPauseClearPanel = new GoPauseClearPanel(model);
      this.goPauseClearPanel.left = this.plotsNode.right + 10;
      this.goPauseClearPanel.bottom = this.plotsNode.bottom;
      this.addChild(this.plotsNode);
      this.addChild(this.goPauseClearPanel);
    }

    if (features.hasMeasuringTape) {
      const measuringTapeUnitsProperty = new Property<MeasuringTapeUnits>({
        name: StringManager.getInstance().getUnitStrings().metersStringProperty.value,
        multiplier: 1 / MODEL_VIEW_SCALE,
      });
      StringManager.getInstance()
        .getUnitStrings()
        .metersStringProperty.link((name) => {
          measuringTapeUnitsProperty.set({ name, multiplier: 1 / MODEL_VIEW_SCALE });
        });

      const measuringTape = new MeasuringTapeNode(measuringTapeUnitsProperty, {
        visibleProperty: this.measuringTapeVisibleProperty,
        basePositionProperty: new Property(new Vector2(420, 450)),
        tipPositionProperty: new Property(new Vector2(520, 450)),
        textColor: RampColors.readoutTextColorProperty,
      });
      this.addChild(measuringTape);
      this.measuringTape = measuringTape;
    }

    this.controlPanel = new RampControlPanel(
      model,
      this,
      features,
      playCoolSound,
      this.measuringTapeVisibleProperty,
      this.zeroPointVisibleProperty,
    );
    this.controlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    this.controlPanel.top = SCREEN_VIEW_MARGIN;
    this.addChild(this.controlPanel);

    this.energyWorkBarChartsNode.right = this.controlPanel.left - 10;

    new CollisionSoundPlayer(model.collisionEmitter, model.soundEnabledProperty);

    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);
  }

  /**
   * Resets view-side state (animations, panel visibility, etc.).
   * Called by the Reset All button listener.
   */
  public reset(): void {
    this.energyBarsExpandedProperty.reset();
    this.workBarsExpandedProperty.reset();
    this.energyPlotExpandedProperty.reset();
    this.workPlotExpandedProperty.reset();
    this.forcePlotExpandedProperty.reset();
    this.measuringTapeVisibleProperty.reset();
    this.zeroPointVisibleProperty.reset();
    this.measuringTape?.reset();
    this.energyWorkBarChartsNode.resetZoom();
  }

  /**
   * Steps the view forward by dt seconds for animation.
   * @param _dt - elapsed time in seconds
   */
  public override step(_dt: number): void {
    // View animation hooks added in later phases.
  }
}
