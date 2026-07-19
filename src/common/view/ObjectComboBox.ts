/**
 * ObjectComboBox.ts
 *
 * More Features screen object chooser as a ComboBox dropdown.
 */
import type { Node } from "scenerystack/scenery";
import { Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { ComboBoxItem } from "scenerystack/sun";
import { ComboBox } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import TheRampColors from "../../TheRampColors.js";
import type { RampModel } from "../model/RampModel.js";
import { RAMP_OBJECTS, type RampObjectDescription } from "../model/RampObjectDescription.js";

const LABEL_FONT = new PhetFont(13);

const objectStrings = StringManager.getInstance().getObjectStrings();
const nameProperties = {
  fileCabinet: objectStrings.fileCabinetStringProperty,
  refrigerator: objectStrings.refrigeratorStringProperty,
  piano: objectStrings.pianoStringProperty,
  crate: objectStrings.crateStringProperty,
  sleepyDog: objectStrings.sleepyDogStringProperty,
} as const;

export class ObjectComboBox extends ComboBox<RampObjectDescription> {
  public constructor(model: RampModel, listParent: Node) {
    const items: ComboBoxItem<RampObjectDescription>[] = RAMP_OBJECTS.map((obj) => ({
      value: obj,
      createNode: () =>
        new Text(nameProperties[obj.nameKey], {
          font: LABEL_FONT,
          fill: TheRampColors.textColorProperty,
          maxWidth: 150,
        }),
    }));

    super(model.selectedObjectProperty, items, listParent, {
      buttonFill: TheRampColors.backgroundColorProperty,
      buttonStroke: TheRampColors.panelBorderColorProperty,
      listFill: TheRampColors.panelBackgroundColorProperty,
      listStroke: TheRampColors.panelBorderColorProperty,
      highlightFill: TheRampColors.accentColorProperty,
    });

    model.selectedObjectProperty.lazyLink(() => {
      model.timeSeriesModel.ensureRecordMode();
    });
  }
}
