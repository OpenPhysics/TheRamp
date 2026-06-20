/**
 * RampControlPanel.ts
 *
 * Right-side control panel: object chooser, sliders, checkboxes, and action buttons.
 */
import { BooleanProperty, DerivedProperty, NumberProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { clamp, Range } from "scenerystack/dot";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import type { VerticalCheckboxGroupItem } from "scenerystack/sun";
import { AccordionBox, Checkbox, Panel, VerticalCheckboxGroup } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import RampColors from "../../RampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { APPLIED_FORCE_RANGE, FRICTION_RANGE, MASS_RANGE, POSITION_RANGE } from "../RampConstants.js";
import { CoolRampButton } from "./CoolRampButton.js";
import { ObjectComboBox } from "./ObjectComboBox.js";
import { ObjectSelectionPanel } from "./ObjectSelectionPanel.js";
import type { RampScreenViewFeatures } from "./RampScreenView.js";

const LABEL_FONT = new PhetFont(13);

/**
 * Creates a NumberProperty that bidirectionally syncs with a model property
 * via optional unit-conversion transforms. Handles range clamping on both ends,
 * so callers don't need a local `syncing` flag or duplicate lazyLink boilerplate.
 *
 * @param modelProperty - the authoritative source-of-truth property on the model
 * @param range - display range for the adapter (clamped on both read and write)
 * @param toAdapter - transforms a model value to the display domain (default: identity)
 * @param toModel - transforms a display value back to the model domain (default: identity)
 */
function createAdaptedNumberProperty(
  modelProperty: NumberProperty,
  range: Range,
  toAdapter: (modelValue: number) => number = (v) => v,
  toModel: (adapterValue: number) => number = (v) => v,
): NumberProperty {
  const adapterProperty = new NumberProperty(clamp(toAdapter(modelProperty.value), range.min, range.max), { range });
  let syncing = false;
  adapterProperty.lazyLink((value) => {
    if (!syncing) {
      syncing = true;
      modelProperty.value = toModel(value);
      syncing = false;
    }
  });
  modelProperty.lazyLink((value) => {
    if (!syncing) {
      syncing = true;
      adapterProperty.value = clamp(toAdapter(value), range.min, range.max);
      syncing = false;
    }
  });
  return adapterProperty;
}
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
      textOptions: { font: PhetFont; fill: typeof RampColors.readoutTextColorProperty };
    };
    sliderOptions?: { startDrag?: () => void };
  } = {
    titleNodeOptions: numberControlTitleOptions,
    numberDisplayOptions: {
      decimalPlaces,
      textOptions: { font: LABEL_FONT, fill: RampColors.readoutTextColorProperty },
    },
  };
  if (sliderOptions !== undefined) {
    options.sliderOptions = sliderOptions;
  }
  return new NumberControl(titleProperty, numberProperty, range, options);
}

function createAngleControl(model: RampModel): NumberControl {
  const controls = StringManager.getInstance().getControlStrings();
  const ANGLE_DISPLAY_RANGE = new Range(0, 90);
  const angleDegreesProperty = createAdaptedNumberProperty(
    model.rampAngleProperty,
    ANGLE_DISPLAY_RANGE,
    (rad) => (rad * 180) / Math.PI,
    (deg) => (deg * Math.PI) / 180,
  );
  return createNumberControl(controls.rampAngleStringProperty, angleDegreesProperty, ANGLE_DISPLAY_RANGE, 0);
}

function createMassControl(model: RampModel): NumberControl {
  const controls = StringManager.getInstance().getControlStrings();
  const massAdapterProperty = createAdaptedNumberProperty(model.massProperty, MASS_RANGE);
  return createNumberControl(controls.massStringProperty, massAdapterProperty, MASS_RANGE, 0);
}

function createFrictionControl(model: RampModel): NumberControl {
  const controls = StringManager.getInstance().getControlStrings();

  const coefficientProperty = new NumberProperty(
    clamp(model.kineticFrictionProperty.value, FRICTION_RANGE.min, FRICTION_RANGE.max),
    { range: FRICTION_RANGE },
  );

  let syncing = false;
  coefficientProperty.lazyLink((coeff) => {
    if (!(syncing || model.frictionlessProperty.value)) {
      model.staticFrictionProperty.value = coeff;
      model.kineticFrictionProperty.value = coeff;
    }
  });

  // Sync slider back from model — needed so Reset All and object changes keep the slider honest.
  model.kineticFrictionProperty.lazyLink((coeff) => {
    if (!syncing) {
      syncing = true;
      coefficientProperty.value = clamp(coeff, FRICTION_RANGE.min, FRICTION_RANGE.max);
      syncing = false;
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
    listParent: Node,
    features: RampScreenViewFeatures,
    playCoolSound: () => void,
    measuringTapeVisibleProperty: BooleanProperty,
    zeroPointVisibleProperty: BooleanProperty,
  ) {
    const controls = StringManager.getInstance().getControlStrings();

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
      new CoolRampButton({
        radius: 18,
        accessibleName: controls.coolRampStringProperty,
        listener: () => {
          model.clearHeat();
          playCoolSound();
        },
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
