/**
 * ConfirmDialog.ts
 *
 * Modal confirm dialog with a single action button. Closing via the dialog close
 * button or backdrop dismisses without acting.
 */
import type { ReadOnlyProperty } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Dialog } from "scenerystack/sim";
import { TextPushButton } from "scenerystack/sun";
import RampColors from "../../RampColors.js";

const LABEL_FONT = new PhetFont(13);
const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });

export function showConfirmDialog(
  titleProperty: ReadOnlyProperty<string>,
  messageProperty: ReadOnlyProperty<string>,
  confirmLabelProperty: ReadOnlyProperty<string>,
  onConfirm: () => void,
): void {
  const messageText = new Text(messageProperty, {
    font: LABEL_FONT,
    fill: RampColors.textColorProperty,
    maxWidth: 280,
  });

  let dialog: Dialog;

  const confirmButton = new TextPushButton(confirmLabelProperty, {
    font: LABEL_FONT,
    listener: () => {
      dialog.hide();
      onConfirm();
    },
  });

  const content = new VBox({
    spacing: 15,
    align: "center",
    children: [messageText, confirmButton],
  });

  const title = new Text(titleProperty, {
    font: TITLE_FONT,
    fill: RampColors.textColorProperty,
  });

  dialog = new Dialog(content, {
    fill: RampColors.panelBackgroundColorProperty,
    stroke: RampColors.panelBorderColorProperty,
    closeButtonColor: RampColors.textColorProperty,
    title,
    hideCallback: () => dialog.dispose(),
  });

  dialog.show();
}
