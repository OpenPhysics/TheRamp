# Phase 09 — Screen differentiation, measuring tape, zero-point PE, icons, polish

Goal: the two screens get their final, distinct feature sets (mirroring Java's
SimpleRampModule vs RampModule), plus the remaining More-Features-only tools and the
finishing touches.

## 1. Final `RampScreenViewFeatures` and per-screen values

Consolidate the interface (it accreted across phases 05–08) — full final form:

```ts
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
  plotViewWidth?: number; // bamboo chart viewWidth override (default 480)
}
```

| feature | Introduction | More Features |
|---|---|---|
| hasFreeBodyDiagram | false | true |
| hasObjectComboBox | false (radio panel) | true |
| hasFrictionSlider | false | true |
| hasMassSlider | false | true |
| hasMeasuringTape | false | true |
| hasZeroPointControl | false | true |
| hasVectorFrameControls | false | true |
| hasForceVisibilityControls | false | true |
| hasRecordPlaybackBar | false (Go!/Pause/Clear) | true |
| energyBarsExpanded / workBarsExpanded | false | true |
| energyPlotExpanded / workPlotExpanded | false | true |
| forcePlotExpanded | true | false |
| plotViewWidth | (default 480) | 420 (record/playback bar needs the room) |

(Java: the Intro module minimizes all bar graphs and plots except the parallel-force plot;
the advanced module shows everything.)

## 2. Vector visibility controls (More Features control panel)

Two collapsible sections appended to `RampControlPanel` when the features are on
(use `AccordionBox` with small title text, or a titled `VBox` — AccordionBox preferred for
consistency):

- **Forces to Show** (`controls.forcesToShow`), when `hasForceVisibilityControls`:
  `VerticalCheckboxGroup` items for the six `model.vectorVisibility.*VisibleProperty`s,
  labels = `forces.applied/gravity/normal/friction/wall/total`, each label Text tinted
  with the matching force color property.
- **Coordinate Frames** (`controls.coordinateFrames`), when `hasVectorFrameControls`:
  `VerticalCheckboxGroup` for `entireVectorsProperty` (`controls.entireVectors`),
  `parallelComponentsProperty`, `perpendicularComponentsProperty`, `xComponentsProperty`,
  `yComponentsProperty`.
- Also when `hasMeasuringTape` / `hasZeroPointControl`: checkboxes
  `controls.measuringTape` → `measuringTapeVisibleProperty` and
  `controls.showZeroPointPe` → `zeroPointVisibleProperty` (both `BooleanProperty(false)`
  owned by `RampScreenView`, reset in its `reset()`).

## 3. Measuring tape (More Features)

In `RampScreenView` when `hasMeasuringTape`:

```ts
import { MeasuringTapeNode } from "scenerystack/scenery-phet";

const measuringTapeUnitsProperty = new Property({
  name: StringManager.getInstance().getUnitStrings().metersStringProperty.value,
  multiplier: 1 / MODEL_VIEW_SCALE, // view px → meters
});
const measuringTape = new MeasuringTapeNode(measuringTapeUnitsProperty, {
  visibleProperty: measuringTapeVisibleProperty,
  basePositionProperty: new Property(new Vector2(420, 450)),
  tipPositionProperty: new Property(new Vector2(520, 450)),
  textColor: RampColors.readoutTextColorProperty.value,
});
```

Check `MeasuringTapeNode`'s exact option names in
`node_modules/scenerystack/dist/prod/scenery-phet/js/MeasuringTapeNode.d.ts` before wiring
(`basePositionProperty`/`tipPositionProperty` are options; the units type is
`{ name: string; multiplier: number }`). The units name must follow the locale: replace the
initialization above with
`metersStringProperty.link((name) => measuringTapeUnitsProperty.set({ name, multiplier: 1 / MODEL_VIEW_SCALE }));`
so the readout relabels on language switch. Add the tape above the plots, below the control
panel in z-order.

## 4. Zero-point PE line (More Features)

A `Node` in `RampSceneNode` (or layered in `RampScreenView` using the scene's MVT):

- Dashed horizontal `Line` spanning view x ∈ [20, 600] at
  `y = mvt.modelToViewY(model.zeroPointYProperty.value)` (link); stroke
  `potentialEnergyColorProperty`, `lineDash: [10, 6]`, lineWidth 2.
- Label `Text(readouts.zeroPointPeStringProperty)` at the right end of the line, fill
  `potentialEnergyColorProperty`.
- Vertical `DragListener` (cursor `"ns-resize"`):
  `model.zeroPointYProperty.value = clamp(mvt.viewToModelY(parentPoint.y), -2, 12)`.
- `visibleProperty: zeroPointVisibleProperty`.

Verification hook: dragging the line above the block makes PE (and the PE bar) negative.

## 5. Screen icons — `src/common/view/RampScreenIcons.ts` (new)

```ts
import { ScreenIcon } from "scenerystack/sim";
export function createIntroScreenIcon(): ScreenIcon { … }
export function createMoreFeaturesScreenIcon(): ScreenIcon { … }
```

Both draw programmatically (no assets): a sky-filled rounded rectangle background
(`skyColorProperty`), a right triangle ramp (`Path` via `Shape.polygon`:
(10, 70) → (90, 70) → (90, 30), fill `rampSurfaceColorProperty`) and a small square block
(`Rectangle`, fill `accentColorProperty`) resting mid-hypotenuse (rotate to match slope
≈ −0.46 rad). The More Features icon adds two small `ArrowNode`s (one green up-slope, one
blue down) to suggest vectors. Wrap: `new ScreenIcon(node, { maxIconWidthProportion: 0.85, maxIconHeightProportion: 0.85, fill: RampColors.skyColorProperty })`.

Wire into `src/intro/IntroScreen.ts` / `src/more-features/MoreFeaturesScreen.ts` options:
`homeScreenIcon: createIntroScreenIcon()` (check the exact `ScreenOptions` key —
`homeScreenIcon` — in the scaffold's Screen typing).

## 6. Keyboard help (modify `src/common/view/RampKeyboardHelpContent.ts`)

Add `SliderControlsKeyboardHelpSection` (verified export of `scenerystack/scenery-phet`)
to the right column alongside the existing `BasicActionsKeyboardHelpSection`:

```ts
super([new SliderControlsKeyboardHelpSection()], [new BasicActionsKeyboardHelpSection()]);
```

## 7. Layout polish checklist

- No overlap at default state on either screen at 1024×618: control panel right column;
  bar charts left of it; FBD top-left (More Features); plots bottom-left; world center-left.
  Where collisions occur, shrink plot `viewWidth` (480 → 420) before moving the world.
- Every `Text`/`RichText` has `maxWidth`; check French (longest) on both screens.
- `RampScreenView.reset()` resets: expanded Properties, `measuringTapeVisibleProperty`,
  `zeroPointVisibleProperty`, measuring-tape base/tip Properties (`.reset()`).
- `model.reset()` (phase 03) already resets `vectorVisibility` — confirm.
- Delete any remaining TODO/placeholder comments from the scaffold stubs.

## 8. Update `doc/implementation-notes.md`

Rewrite the "Status: structural scaffold only" section to describe the real architecture:
pure engine + axon façade + time-series model + options-driven views, with a pointer to
`doc/plan/` for history. Also update the CLAUDE.md "Status" line at the repo root the same
way (one-line change).

## Acceptance criteria (manual)

1. **Introduction**: simple panel (radio objects, frictionless, angle, position, applied
   force, sound, reset, cool ramp), Go!/Pause/Clear, force plot expanded, bars + other
   plots collapsed, NO free-body diagram, NO tape/zero-point/frame controls.
2. **More Features**: combo box, friction + mass sliders, FBD, forces-to-show +
   coordinate-frames groups, measuring tape (drag base/tip, reads meters), zero-point PE
   line (PE bar goes negative when line is above the block), record/playback bar, bars +
   energy/work plots expanded.
3. Home screen and navbar show the two drawn icons.
4. Keyboard help dialog lists slider help; tab-navigation reaches the controls.
5. Reset All on each screen restores that screen's full default state (including
   tape/zero-point visibility and accordion states).
6. `npm run check && npm run lint && npm run build && npm run physics-check` pass.
