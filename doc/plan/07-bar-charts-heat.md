# Phase 07 — Energy/work bar charts, heat glow, overheat

Goal: the two bar-chart sets and the full thermal-energy story (glow is already wired from
phase 04 — this phase adds the Overheated indicator and Cool Ramp sound).

## 1. `src/common/view/BarChartNode.ts` (new) — generic bar set

```ts
export interface BarEntry {
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly colorProperty: ProfileColorProperty;
  readonly valueProperty: ReadOnlyProperty<number>;
}
export class BarChartNode extends Node {
  public constructor(entries: readonly BarEntry[]) { … }
}
```

Geometry (fixed, no options needed):

- Baseline at local y = 0; bars grow **up** for positive values, down for negative
  (PE/works can be negative). Max bar extent ±`MAX_BAR_HEIGHT = 220` px up, 60 px down.
- Bar width 16 px, pitch 30 px; chart width = `entries.length * 30`.
- Bar height = `value * ENERGY_BAR_SCALE` (0.005 px/J ⇒ 30 000 J = 150 px), clamped to the
  max extents; when clamped, draw a small triangle `Path` (8×8) at the clipped end in the
  same color to indicate overflow.
- Baseline `Line` across the full width, stroke `RampColors.chartGridColorProperty`.
- Implementation: one `Rectangle` per entry, fill `entry.colorProperty`; a `link` on each
  `valueProperty` calls `setRect(x, Math.min(0, -h), 16, Math.abs(h))` with
  `h = clamp(value * ENERGY_BAR_SCALE, -60, 220)` (remember view y is down: a positive
  value's rect is `setRect(x, -h, 16, h)`).
- Labels: `Text(labelStringProperty)` under the baseline, rotated `-Math.PI / 4`, anchored
  `rightTop` at the bar's baseline foot, `font: new PhetFont(11)`,
  `fill: RampColors.textColorProperty`, `maxWidth: 60`.

## 2. `src/common/view/EnergyWorkBarChartsNode.ts` (new)

An `HBox` (spacing 10) of two `AccordionBox`es:

**Energy** (`energy.title`):

| label | color | valueProperty |
|---|---|---|
| `energy.kinetic` | `kineticEnergyColorProperty` | `model.kineticEnergyProperty` |
| `energy.potential` | `potentialEnergyColorProperty` | `model.potentialEnergyProperty` |
| `energy.thermal` | `thermalEnergyColorProperty` | `model.thermalEnergyProperty` |
| `energy.total` | `totalEnergyColorProperty` | `model.totalEnergyProperty` |

**Work** (`work.title`):

| label | color | valueProperty |
|---|---|---|
| `work.applied` | `appliedWorkColorProperty` | `model.appliedWorkProperty` |
| `work.gravity` | `gravityWorkColorProperty` | `model.gravityWorkProperty` |
| `work.friction` | `frictionWorkColorProperty` | `model.frictiveWorkProperty` |
| `work.total` | `totalWorkColorProperty` | `model.totalWorkProperty` |

AccordionBox options as in phase 05 (panel colors, Text titleNode). Each box gets its own
`BooleanProperty` for `expandedProperty`, owned by `RampScreenView` and reset in
`RampScreenView.reset()`; initial value comes from the features bag (extend it):

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
