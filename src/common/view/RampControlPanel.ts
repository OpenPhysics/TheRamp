/**
 * RampControlPanel.ts
 *
 * Right-side control panel: object chooser, sliders, checkboxes, and action buttons.
 */
import { BooleanProperty, DerivedProperty, NumberProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { clamp, Range } from "scenerystack/dot";
import { HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import type { VerticalCheckboxGroupItem } from "scenerystack/sun";
import { AccordionBox, Checkbox, Panel, TextPushButton, VerticalCheckboxGroup } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { APPLIED_FORCE_RANGE, FRICTION_RANGE, MASS_RANGE, POSITION_RANGE } from "../RampConstants.js";
import { showConfirmDialog } from "./ConfirmDialog.js";
import { ObjectComboBox } from "./ObjectComboBox.js";
import { ObjectSelectionPanel } from "./ObjectSelectionPanel.js";
import type { RampScreenView, RampScreenViewFeatures } from "./RampScreenView.js";

const LABEL_FONT = new PhetFont(13);
const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });
const SECTION_TITLE_FONT = new PhetFont({ size: 12, weight: "bold" });

const numberControlTitleOptions = {
  font: LABEL_FONT,
  fill: RampColors.textColorProperty,
  maxWidth: 140,
};

function createNumberControl(
  titleProperty: ReadOnlyProperty<string>,
  numberProperty: NumberProperty,
  range: Range,
  decimalPlaces: number,
  sliderOptions?: { startDrag?: () => void },
): NumberControl {
  const options: {
    titleNodeOptions: typeof numberControlTitleOptions;
    numberDisplayOptions: {
      decimalPlaces: number;
      textOptions: { font: PhetFont; fill: typeof RampColors.textColorProperty };
    };
    sliderOptions?: { startDrag?: () => void };
  } = {
    titleNodeOptions: numberControlTitleOptions,
    numberDisplayOptions: {
      decimalPlaces,
      textOptions: { font: LABEL_FONT, fill: RampColors.textColorProperty },
    },
  };
  if (sliderOptions !== undefined) {
    options.sliderOptions = sliderOptions;
  }
  return new NumberControl(titleProperty, numberProperty, range, options);
}

function createAngleControl(model: RampModel): NumberControl {
  const controls = StringManager.getInstance().getControlStrings();

  const angleDegreesProperty = new NumberProperty((model.rampAngleProperty.value * 180) / Math.PI, {
    range: new Range(0, 90),
  });

  let syncing = false;
  angleDegreesProperty.lazyLink((degrees) => {
    if (!syncing) {
      syncing = true;
      model.rampAngleProperty.value = (degrees * Math.PI) / 180;
      syncing = false;
    }
  });
  model.rampAngleProperty.lazyLink((radians) => {
    if (!syncing) {
      syncing = true;
      angleDegreesProperty.value = (radians * 180) / Math.PI;
      syncing = false;
    }
  });

  return createNumberControl(controls.rampAngleStringProperty, angleDegreesProperty, new Range(0, 90), 0);
}

function createMassControl(model: RampModel): NumberControl {
  const controls = StringManager.getInstance().getControlStrings();

  const massAdapterProperty = new NumberProperty(clamp(model.massProperty.value, MASS_RANGE.min, MASS_RANGE.max), {
    range: MASS_RANGE,
  });

  let syncing = false;
  massAdapterProperty.lazyLink((mass) => {
    if (!syncing) {
      syncing = true;
      model.massProperty.value = mass;
      syncing = false;
    }
  });
  model.massProperty.lazyLink((mass) => {
    if (!syncing) {
      syncing = true;
      massAdapterProperty.value = clamp(mass, MASS_RANGE.min, MASS_RANGE.max);
      syncing = false;
    }
  });

  return createNumberControl(controls.massStringProperty, massAdapterProperty, MASS_RANGE, 0);
}

function createFrictionControl(model: RampModel): NumberControl {
  const controls = StringManager.getInstance().getControlStrings();

  const coefficientProperty = new NumberProperty(0.5, { range: FRICTION_RANGE });

  let syncing = false;
  coefficientProperty.lazyLink((coeff) => {
    if (!(syncing || model.frictionlessProperty.value)) {
      model.staticFrictionProperty.value = coeff;
      model.kineticFrictionProperty.value = coeff;
    }
  });

  model.selectedObjectProperty.lazyLink((obj) => {
    if (!syncing) {
      syncing = true;
      coefficientProperty.value = clamp(obj.kineticFriction, FRICTION_RANGE.min, FRICTION_RANGE.max);
      syncing = false;
    }
  });

  const control = createNumberControl(
    controls.frictionCoefficientStringProperty,
    coefficientProperty,
    FRICTION_RANGE,
    2,
  );
  control.enabledProperty = DerivedProperty.not(model.frictionlessProperty);
  return control;
}

function createForceVisibilitySection(model: RampModel): AccordionBox {
  const controls = StringManager.getInstance().getControlStrings();
  const forces = StringManager.getInstance().getForceStrings();
  const visibility = model.vectorVisibility;

  const forceItems: {
    property: BooleanProperty;
    label: ReadOnlyProperty<string>;
    color: typeof RampColors.appliedForceColorProperty;
  }[] = [
    {
      property: visibility.appliedVisibleProperty,
      label: forces.appliedStringProperty,
      color: RampColors.appliedForceColorProperty,
    },
    {
      property: visibility.gravityVisibleProperty,
      label: forces.gravityStringProperty,
      color: RampColors.gravityForceColorProperty,
    },
    {
      property: visibility.normalVisibleProperty,
      label: forces.normalStringProperty,
      color: RampColors.normalForceColorProperty,
    },
    {
      property: visibility.frictionVisibleProperty,
      label: forces.frictionStringProperty,
      color: RampColors.frictionForceColorProperty,
    },
    {
      property: visibility.wallVisibleProperty,
      label: forces.wallStringProperty,
      color: RampColors.wallForceColorProperty,
    },
    {
      property: visibility.totalVisibleProperty,
      label: forces.totalStringProperty,
      color: RampColors.totalForceColorProperty,
    },
  ];

  const items: VerticalCheckboxGroupItem[] = forceItems.map((item) => ({
    property: item.property,
    createNode: () =>
      new Text(item.label, {
        font: LABEL_FONT,
        fill: item.color,
        maxWidth: 140,
      }),
  }));

  const checkboxGroup = new VerticalCheckboxGroup(items, {
    spacing: 4,
    tandem: Tandem.OPT_OUT,
  });

  return new AccordionBox(checkboxGroup, {
    titleNode: new Text(controls.forcesToShowStringProperty, {
      font: SECTION_TITLE_FONT,
      fill: RampColors.textColorProperty,
      maxWidth: 200,
    }),
    expandedProperty: new BooleanProperty(false),
    fill: RampColors.panelBackgroundColorProperty,
    stroke: RampColors.panelBorderColorProperty,
    tandem: Tandem.OPT_OUT,
  });
}

function createCoordinateFramesSection(model: RampModel): AccordionBox {
  const controls = StringManager.getInstance().getControlStrings();
  const visibility = model.vectorVisibility;

  const frameItems: { property: BooleanProperty; label: ReadOnlyProperty<string> }[] = [
    { property: visibility.entireVectorsProperty, label: controls.entireVectorsStringProperty },
    { property: visibility.parallelComponentsProperty, label: controls.parallelComponentsStringProperty },
    { property: visibility.perpendicularComponentsProperty, label: controls.perpendicularComponentsStringProperty },
    { property: visibility.xComponentsProperty, label: controls.xComponentsStringProperty },
    { property: visibility.yComponentsProperty, label: controls.yComponentsStringProperty },
  ];

  const items: VerticalCheckboxGroupItem[] = frameItems.map((item) => ({
    property: item.property,
    createNode: () =>
      new Text(item.label, {
        font: LABEL_FONT,
        fill: RampColors.textColorProperty,
        maxWidth: 180,
      }),
  }));

  const checkboxGroup = new VerticalCheckboxGroup(items, {
    spacing: 4,
    tandem: Tandem.OPT_OUT,
  });

  return new AccordionBox(checkboxGroup, {
    titleNode: new Text(controls.coordinateFramesStringProperty, {
      font: SECTION_TITLE_FONT,
      fill: RampColors.textColorProperty,
      maxWidth: 200,
    }),
    expandedProperty: new BooleanProperty(false),
    fill: RampColors.panelBackgroundColorProperty,
    stroke: RampColors.panelBorderColorProperty,
    tandem: Tandem.OPT_OUT,
  });
}

export class RampControlPanel extends Panel {
  public constructor(
    model: RampModel,
    screenView: RampScreenView,
    listParent: Node,
    features: RampScreenViewFeatures,
    playCoolSound: () => void,
    measuringTapeVisibleProperty: BooleanProperty,
    zeroPointVisibleProperty: BooleanProperty,
  ) {
    const controls = StringManager.getInstance().getControlStrings();
    const messages = StringManager.getInstance().getMessageStrings();

    const children: Node[] = [];

    if (features.hasObjectComboBox) {
      const objectComboBox = new ObjectComboBox(model, listParent);
      const chooseTitle = new Text(controls.chooseObjectStringProperty, {
        font: TITLE_FONT,
        fill: RampColors.textColorProperty,
        maxWidth: 150,
      });
      children.push(
        new VBox({
          spacing: 6,
          align: "left",
          children: [chooseTitle, objectComboBox],
        }),
      );
    } else {
      children.push(new ObjectSelectionPanel(model));
    }

    const ensureRecordOnDrag = (): void => {
      model.timeSeriesModel.ensureRecordMode();
    };

    children.push(
      new Checkbox(
        model.frictionlessProperty,
        new Text(controls.frictionlessStringProperty, {
          font: LABEL_FONT,
          fill: RampColors.textColorProperty,
          maxWidth: 150,
        }),
      ),
      createAngleControl(model),
      createNumberControl(controls.positionStringProperty, model.globalPositionProperty, POSITION_RANGE, 1, {
        startDrag: ensureRecordOnDrag,
      }),
      createNumberControl(controls.appliedForceStringProperty, model.appliedForceProperty, APPLIED_FORCE_RANGE, 0, {
        startDrag: ensureRecordOnDrag,
      }),
    );

    if (features.hasFrictionSlider) {
      children.push(createFrictionControl(model));
    }

    if (features.hasMassSlider) {
      children.push(createMassControl(model));
    }

    children.push(
      new Checkbox(
        model.soundEnabledProperty,
        new Text(controls.soundStringProperty, {
          font: LABEL_FONT,
          fill: RampColors.textColorProperty,
          maxWidth: 150,
        }),
      ),
      new HBox({
        spacing: 8,
        children: [
          new TextPushButton(controls.resetStringProperty, {
            font: LABEL_FONT,
            listener: () => {
              showConfirmDialog(
                messages.confirmResetTitleStringProperty,
                messages.confirmResetStringProperty,
                controls.resetStringProperty,
                () => {
                  model.reset();
                  screenView.reset();
                },
              );
            },
          }),
          new TextPushButton(controls.coolRampStringProperty, {
            font: LABEL_FONT,
            listener: () => {
              model.clearHeat();
              playCoolSound();
            },
          }),
        ],
      }),
    );

    if (features.hasForceVisibilityControls) {
      children.push(createForceVisibilitySection(model));
    }

    if (features.hasVectorFrameControls) {
      children.push(createCoordinateFramesSection(model));
    }

    if (features.hasMeasuringTape) {
      children.push(
        new Checkbox(
          measuringTapeVisibleProperty,
          new Text(controls.measuringTapeStringProperty, {
            font: LABEL_FONT,
            fill: RampColors.textColorProperty,
            maxWidth: 150,
          }),
        ),
      );
    }

    if (features.hasZeroPointControl) {
      children.push(
        new Checkbox(
          zeroPointVisibleProperty,
          new Text(controls.showZeroPointPeStringProperty, {
            font: LABEL_FONT,
            fill: RampColors.textColorProperty,
            maxWidth: 150,
          }),
        ),
      );
    }

    const content = new VBox({
      spacing: 8,
      align: "left",
      maxWidth: 230,
      children,
    });

    super(content, {
      fill: RampColors.panelBackgroundColorProperty,
      stroke: RampColors.panelBorderColorProperty,
      xMargin: 8,
      yMargin: 8,
    });
  }
}
