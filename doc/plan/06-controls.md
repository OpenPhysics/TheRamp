# Phase 06 — Control panels, sliders, dialogs

Goal: every user control. After this phase the temporary autoplay is gone; the sim starts
paused and the user presses **Go!**.

All control labels use `StringManager` string Properties; all text gets
`fill: RampColors.textColorProperty`, `font: new PhetFont(13)` (titles 14 bold), and a
`maxWidth` (≈ 150 for labels) so long translations don't blow up the panel.

## 1. `src/common/view/ConfirmDialog.ts` (new helper)

```ts
import { Dialog } from "scenerystack/sim"; // NOT sun

export function showConfirmDialog(
  titleProperty: ReadOnlyProperty<string>,
  messageProperty: ReadOnlyProperty<string>,
  confirmLabelProperty: ReadOnlyProperty<string>,
  onConfirm: () => void,
): void
```

Design: `Dialog` already provides its own close (✕) button, so the dialog needs only ONE
action button — the confirm action, labeled by `confirmLabelProperty` (the caller passes
the action's own string, e.g. `controls.reset`). Closing the dialog any other way cancels;
no separate Cancel button or string is needed.

Implementation: content = `VBox` of [message `Text(messageProperty)`,
`TextPushButton(confirmLabelProperty, { listener: () => { dialog.hide(); onConfirm(); } })`];
`const dialog = new Dialog(content, { title: new Text(titleProperty, …) }); dialog.show();`
Check `node_modules/scenerystack/dist/prod/sun/js/Dialog.d.ts` for the auto-dispose hook
(`hideCallback` exists on DialogOptions); wire `hideCallback: () => dialog.dispose()` if
present, otherwise create the dialog once per call site and reuse it.

Used by: Reset (title `messages.confirmResetTitle`, message `messages.confirmReset`,
confirm label `controls.reset`) and Clear (title `messages.confirmClearTitle`, message
`messages.confirmClearGraphs`, confirm label `timeControls.clear`).

## 2. Object choosers

**`src/common/view/ObjectSelectionPanel.ts`** (Intro) — a `VBox` titled
`controls.chooseObject` (bold Text) over a `VerticalAquaRadioButtonGroup<RampObjectDescription>`
on `model.selectedObjectProperty`. Items: for each object in `RAMP_OBJECTS`, label =
`PatternStringProperty(readouts.massPatternStringProperty, { name: nameProperty, mass: obj.mass })`
where `nameProperty` comes from a typed lookup:

```ts
const objectStrings = StringManager.getInstance().getObjectStrings();
const nameProperties = {
  fileCabinet: objectStrings.fileCabinetStringProperty,
  refrigerator: objectStrings.refrigeratorStringProperty,
  piano: objectStrings.pianoStringProperty,
  crate: objectStrings.crateStringProperty,
  sleepyDog: objectStrings.sleepyDogStringProperty,
} as const;
// nameProperties[obj.nameKey] is fully typed — no index-signature problems
```

**`src/common/view/ObjectComboBox.ts`** (More Features) — `ComboBox<RampObjectDescription>`
on the same Property; items `{ value: obj, createNode: () => new Text(nameProperties[obj.nameKey], …) }`;
ComboBox requires a `listParent` — pass the ScreenView (`this`) through the control-panel
constructor.

Selecting an object must call `model.timeSeriesModel.ensureRecordMode()` — add a
`lazyLink` on `selectedObjectProperty` **in the panel** (not the model).

## 3. Sliders / number controls

All are scenery-phet `NumberControl(titleStringProperty, numberProperty, range, options)`
with `layoutFunction` default, `titleNodeOptions: { font: new PhetFont(13), fill: RampColors.textColorProperty, maxWidth: 140 }`,
arrow buttons on. Where the model unit differs from the display unit, use a **panel-local
adapter NumberProperty with a guarded two-way sync** (pattern shown once, reuse):

```ts
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
```

| Control | title string | property | range | decimals | notes |
|---|---|---|---|---|---|
| Ramp angle | `controls.rampAngle` | degrees adapter ↔ `rampAngleProperty` | 0–90 | 0 | |
| Object position | `controls.position` | `model.globalPositionProperty` | `POSITION_RANGE` | 1 | `sliderOptions: { startDrag: () => model.timeSeriesModel.ensureRecordMode() }` |
| Applied force | `controls.appliedForce` | `model.appliedForceProperty` | `APPLIED_FORCE_RANGE` | 0 | same `startDrag`; value persists on release (only block-drag auto-zeroes) |
| Friction coefficient (MF only) | `controls.frictionCoefficient` | local `coefficientProperty` (init 0.5, `FRICTION_RANGE`) | 0.1–1.5 | 2 | `lazyLink` writes BOTH `staticFrictionProperty` and `kineticFrictionProperty`; `enabledProperty: DerivedProperty.not(model.frictionlessProperty)` (check `DerivedProperty.not` exists; else derive `(v) => !v`); on `selectedObjectProperty` change set `coefficientProperty.value = clamp(obj.kineticFriction, 0.1, 1.5)` guarded |
| Mass (MF only) | `controls.mass` | mass adapter ↔ `massProperty` | `MASS_RANGE` | 0 | adapter needed because objects can be lighter than 100 kg (dog = 15): model→adapter uses `clamp(mass, 100, 500)`; adapter→model writes raw |

## 4. Checkboxes & buttons

- `Checkbox(model.frictionlessProperty, new Text(controls.frictionless…))`
- `Checkbox(model.soundEnabledProperty, new Text(controls.sound…))`
- `TextPushButton(controls.reset…)` → `showConfirmDialog(confirmResetTitle, confirmReset, controls.reset, () => { model.reset(); screenView.reset(); })`
- `TextPushButton(controls.coolRamp…)` → `model.clearHeat()` (sound added in phase 07)
- Also route the screen's `ResetAllButton` through the same confirm dialog.

## 5. `src/common/view/GoPauseClearPanel.ts` (new)

`HBox` (spacing 10) of three `TextPushButton`s:

- **Go!** (`timeControls.go`) → `model.timeSeriesModel.ensureRecordMode();
  model.timeSeriesModel.isPlayingProperty.value = true;`
  `enabledProperty` = DerivedProperty over `[isPlayingProperty, recordTimeProperty]`:
  enabled when not playing and `recordTime < MAX_RECORDING_TIME`.
- **Pause** (`timeControls.pause`) → `isPlayingProperty.value = false;` enabled when playing.
- **Clear** (`timeControls.clear`) → confirm dialog → `model.timeSeriesModel.clear()`.

Position: bottom-center of the screen (`centerX: layoutBounds.centerX, bottom: maxY − MARGIN`).
(Phase 08/09 reposition it next to the plots; both screens get it for now.)

## 6. `src/common/view/RampControlPanel.ts` (new)

`class RampControlPanel extends Panel`. Constructor
`(model: RampModel, screenView: RampScreenView, listParent: Node, features: RampScreenViewFeatures)`.
Content: `VBox` (`spacing: 8, align: "left"`) assembled from `features` (extend the
phase-05 interface):

```ts
export interface RampScreenViewFeatures {
  hasFreeBodyDiagram?: boolean;
  hasObjectComboBox?: boolean; // false ⇒ radio-button ObjectSelectionPanel
  hasFrictionSlider?: boolean;
  hasMassSlider?: boolean;
}
```

Order: object chooser (combo or radio panel) · frictionless checkbox · angle control ·
position control · applied-force control · [friction slider] · [mass slider] ·
sound checkbox · HBox(Reset, Cool Ramp). Panel options:
`{ fill: RampColors.panelBackgroundColorProperty, stroke: RampColors.panelBorderColorProperty, xMargin: 8, yMargin: 8 }`.
The whole VBox gets `maxWidth: 230`.

## 7. RampScreenView wiring (modify)

- Construct `RampControlPanel`, placed `right: layoutBounds.maxX − SCREEN_VIEW_MARGIN, top: SCREEN_VIEW_MARGIN`.
- Add `GoPauseClearPanel`.
- **Delete the phase-04 temporary autoplay line.**
- Pass per-screen features from the subclasses now:
  `IntroScreenView` → `{ hasFreeBodyDiagram: false, hasObjectComboBox: false, hasFrictionSlider: false, hasMassSlider: false }`;
  `MoreFeaturesScreenView` → all true.

## Acceptance criteria (manual)

1. Sim starts paused; **Go!** starts recording (block physics runs), **Pause** freezes it,
   arrows still track slider changes while paused (setupForcesOnly path).
2. Intro: radio-button list of all five objects with masses ("Piano (225 kg)"); selecting
   the dog swaps the image, mass and friction (dog slides at much shallower angles).
   More Features: same via combo box.
3. Frictionless checkbox: skateboard appears under the object, block glides without
   slowing; unchecking restores the object's friction.
4. Angle/position/applied-force controls all drive the model and the readouts agree;
   moving position past 6 m hops the block between ground and ramp correctly.
5. More Features: friction slider greys out when frictionless; mass slider stretches the
   block vertically (Java behavior) and changes the physics.
6. Reset and Clear each show a localized confirm dialog; confirming acts, closing cancels.
7. Locale switch (fr/es) relabels every control live.
8. `npm run check && npm run lint && npm run build && npm run physics-check` pass.
