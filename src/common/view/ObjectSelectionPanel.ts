/**
 * ObjectSelectionPanel.ts
 *
 * Intro-screen object chooser: radio-button list of all ramp objects with mass labels.
 */
import { PatternStringProperty } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { VerticalAquaRadioButtonGroup } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import TheRampColors from "../../TheRampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { RAMP_OBJECTS } from "../model/RampObjectDescription.js";

const LABEL_FONT = new PhetFont(13);
const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });

const objectStrings = StringManager.getInstance().getObjectStrings();
const nameProperties = {
  fileCabinet: objectStrings.fileCabinetStringProperty,
  refrigerator: objectStrings.refrigeratorStringProperty,
  piano: objectStrings.pianoStringProperty,
  crate: objectStrings.crateStringProperty,
  sleepyDog: objectStrings.sleepyDogStringProperty,
} as const;

export class ObjectSelectionPanel extends VBox {
  public constructor(model: RampModel) {
    const controls = StringManager.getInstance().getControlStrings();
    const readouts = StringManager.getInstance().getReadoutStrings();

    const title = new Text(controls.chooseObjectStringProperty, {
      font: TITLE_FONT,
      fill: TheRampColors.textColorProperty,
      maxWidth: 150,
    });

    const radioButtonGroup = new VerticalAquaRadioButtonGroup(
      model.selectedObjectProperty,
      RAMP_OBJECTS.map((obj) => ({
        value: obj,
        createNode: () =>
          new Text(
            new PatternStringProperty(readouts.massPatternStringProperty, {
              name: nameProperties[obj.nameKey],
              mass: obj.mass,
            }),
            {
              font: LABEL_FONT,
              fill: TheRampColors.textColorProperty,
              maxWidth: 150,
            },
          ),
      })),
      { spacing: 4, accessibleName: controls.chooseObjectStringProperty },
    );

    model.selectedObjectProperty.lazyLink(() => {
      model.timeSeriesModel.ensureRecordMode();
    });

    super({
      spacing: 6,
      align: "left",
      children: [title, radioButtonGroup],
    });
  }
}
