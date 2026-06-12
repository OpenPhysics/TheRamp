# Phase 07 — Energy/work bar charts, heat glow, overheat

Goal: the two bar-chart sets and the full thermal-energy story (glow is already wired from
phase 04 — this phase adds the Overheated indicator and Cool Ramp sound).

> **REVISED (post-plan)**: the bar charts were redesigned after the original plan, modeled
> on PhET's Masses and Springs energy graph. The generic bar set gained stacked groups, a
> zoom range, and an overflow indicator; each chart lives in a `BarChartAccordionBox` with
> zoom buttons and a legend dialog. Sections 1–2 below describe the **implemented** design.

## 1. `src/common/view/BarChartNode.ts` (new) — generic bar set

```ts
export interface BarDataEntry {
  readonly colorProperty: ProfileColorProperty;
  readonly valueProperty: ReadOnlyProperty<number>;
}
export interface BarChartGroup {
  readonly entries: readonly BarDataEntry[]; // >1 entry ⇒ stacked bar (used for Total)
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly labelNode?: Node | null; // optional extra node next to the label (trash button)
}
export class BarChartNode extends Node {
  public constructor(groups: readonly BarChartGroup[], options?: BarChartNodeOptions) { … }
}
```

Geometry / behavior:

- Baseline at local y = 0; bars grow **up** for positive values, down for negative
  (PE/works can be negative). Max bar extent 220 px up, 60 px down (options).
- Bar width 18 px, spacing 5 px; a vertical axis `ArrowNode`
  (fill `RampColors.readoutTextColorProperty`) marks the y-axis; baseline `Line` stroke
  `RampColors.chartGridColorProperty`.
- Bar height = `value * scaleProperty.value` where `scaleProperty` defaults to
  `ENERGY_BAR_SCALE` and is driven by the zoom level (below); heights clamp to the max
  extents with an 8 px overflow triangle in the last entry's color at the clipped end.
- Groups with multiple entries stack segments (positive up from the baseline, negative
  down), so the Total bar is the visible sum of its components.
- Labels: `Text(labelStringProperty)` under the baseline, rotated `-Math.PI / 4`,
  `font: new PhetFont(11)`, `fill: RampColors.readoutTextColorProperty` (the chart
  background is light in both profiles), `maxWidth: 60`, over a translucent
  `chartBackgroundColorProperty` backing rectangle; `labelNode` (if any) sits to the right.
- `update()` recomputes all bars (called when an accordion box expands).

## 2. `src/common/view/BarChartAccordionBox.ts` + `EnergyWorkBarChartsNode.ts` (new)

`BarChartAccordionBox extends AccordionBox` — one chart on a 160×520
`chartBackgroundColorProperty` rounded rectangle, plus:

- **Zoom**: `zoomLevelProperty: NumberProperty(0, range −2…4)`; bar scale =
  `ENERGY_BAR_SCALE * 2^zoomLevel`; `ZoomButton` pair (in/out) with enable-at-range-ends;
  `resetZoom()` is called from `RampScreenView.reset()`.
- **Legend**: an `InfoButton` opens a `Dialog` (from `scenerystack/sim`) listing each
  series — color swatch, abbreviation `RichText`, description `Text` — built from
  `LegendItem[]`; the dialog is created lazily and disposed via `hideCallback`.

`EnergyWorkBarChartsNode` — an `HBox` (spacing 10) of two `BarChartAccordionBox`es:

**Energy** (`energy.title`): kinetic / potential / thermal single-entry groups plus a
stacked **Total** group `[kinetic, potential, thermal]`; colors `*EnergyColorProperty`;
the thermal group's `labelNode` is a `MoveToTrashLegendButton` (arrow color
`thermalEnergyColorProperty`) that calls `model.clearHeat()` + plays the cool sound,
enabled only while `thermalEnergyProperty > 0`.

**Work** (`work.title`): applied / gravity / friction (`model.frictiveWorkProperty`)
single-entry groups plus stacked **Total** `[applied, gravity, friction]`; colors
`*WorkColorProperty`.

Each box gets its own `BooleanProperty` for `expandedProperty`, owned by `RampScreenView`
and reset in `RampScreenView.reset()`; initial value comes from the features bag (extend it):

```ts
export interface RampScreenViewFeatures {
  // …existing…
  energyBarsExpanded?: boolean; // default true
  workBarsExpanded?: boolean; // default true
}
```

Placement in `RampScreenView`: to the left of the control panel,
`right: controlPanel.left − 10, top: SCREEN_VIEW_MARGIN`.

## 3. `src/common/view/OverheatNode.ts` (new)

A `VBox`: `Text(messages.overheatedStringProperty)` (PhetFont 16 bold, fill
`thermalEnergyColorProperty`) over a `TextPushButton(controls.coolRampStringProperty)`.

- `visibleProperty: new DerivedProperty([model.thermalEnergyProperty], (e) => e >= OVERHEAT_THERMAL_ENERGY)`.
- Button listener: `model.clearHeat(); coolSound.play();` — where
  `coolSound = loadSoundClip(RampAudio.slapooh)` is created once in `RampScreenView` and
  passed in (guard with `model.soundEnabledProperty.value` before `.play()`).
- Placement: centered above the ramp midpoint, `center: (330, 200)` in layout coords.

Also wire the same `coolSound` (with the same enabled guard) into the control panel's
Cool Ramp button from phase 06 — pass the clip (or a `playCoolSound: () => void` callback)
into `RampControlPanel`.

## 4. How to drive thermal energy up (for testing)

Crate (μ = 0.7) on a 30° ramp, drag back and forth repeatedly, or set applied force +1000 N
and let it grind up-ramp: thermal ≈ μ·m·g·cosθ·distance ≈ 1780 J/m ⇒ ~28 m of travel
reaches 50 kJ. The ramp board visibly reddens on the way (interpolated fill from phase 04).

## Acceptance criteria (manual)

1. Both charts render with correct colors/labels and animate during motion.
2. **Invariant check (the big one)**: at all times the Energy "Total" bar and the Work
   "Applied" bar have identical heights — including during collisions and after Cool Ramp.
3. PE bar goes negative (below baseline) when the block is below the zero-point (only
   reachable in phase 09 by dragging the zero-point line up; for now verify negative
   works render below the baseline — W_gravity is negative whenever the block is above
   y = 0).
4. Friction grinding turns the ramp red; at ≥ 50 kJ "Overheated." + Cool Ramp button
   appear; pressing it plays slapooh, zeroes the Thermal bar, drops Total to match, and
   the board color cools.
5. Bars clip with an overflow triangle instead of growing past the box.
6. `npm run check && npm run lint && npm run build && npm run physics-check` pass.
