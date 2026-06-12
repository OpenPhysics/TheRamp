# Phase 08 — Time-series plots + record/playback UI

Goal: the three scrolling plots fed by the recording buffer, a draggable time cursor that
scrubs playback, and the record/playback control bar.

Verified bamboo API (scenerystack 3.0):
`ChartTransform({ viewWidth, viewHeight, modelXRange, modelYRange })`;
`ChartRectangle(chartTransform, options)`;
`GridLineSet(chartTransform, axisOrientation: Orientation, spacing, options)` and
`TickMarkSet`/`TickLabelSet` likewise — **`Orientation` comes from `scenerystack/phet-core`**
(`Orientation.HORIZONTAL` / `Orientation.VERTICAL`);
`LinePlot(chartTransform, dataSet: (Vector2 | null)[], options)` with
`setDataSet(dataSet)` and `update()` (call `update()` after mutating the array in place).

## 1. Series registry — in `src/common/view/RampPlotsNode.ts`

```ts
import { getKineticEnergy, getPotentialEnergy, getTotalWork } from "../model/RampPhysicsEngine.js";

export interface SeriesDescriptor {
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly colorProperty: ProfileColorProperty;
  /** live value for the readout column */
  readonly liveProperty: ReadOnlyProperty<number>;
  /** value extracted from a recorded snapshot for plotting */
  readonly accessor: (state: RampPhysicsState) => number;
}
```

Three arrays (strings from StringManager groups; colors from RampColors):

**Energy plot** (`energy.title`, y-range `PLOT_ENERGY_RANGE` = ±30 000 J):
kinetic → `getKineticEnergy(s)` / potential → `getPotentialEnergy(s)` /
thermal → `s.thermalEnergy` / total → `getKineticEnergy(s) + getPotentialEnergy(s) + s.thermalEnergy`;
liveProperties: `kineticEnergyProperty`, `potentialEnergyProperty`, `thermalEnergyProperty`,
`totalEnergyProperty`; colors: the four `*EnergyColorProperty`s.

**Work plot** (`work.title`, ±30 000 J): applied → `s.appliedWork` / gravity →
`s.gravityWork` / friction → `s.frictiveWork` / total → `getTotalWork(s)`;
liveProperties: the four work Properties; colors: the four `*WorkColorProperty`s.

**Parallel forces plot** (`forces.parallelTitle`, y-range `PLOT_FORCE_RANGE` = ±1000 N):
applied → `s.appliedParallel` / friction → `s.frictionParallel` /
gravity → `s.gravityParallel` / wall → `s.wallParallel`;
liveProperties: `appliedParallelProperty`, `frictionParallelProperty`,
`gravityParallelProperty`, `wallParallelProperty`; labels `forces.applied`, `forces.friction`,
`forces.gravity`, `forces.wall`; colors: the matching `*ForceColorProperty`s.

## 2. `src/common/view/TimePlotNode.ts` (new)

`class TimePlotNode extends AccordionBox`. Constructor
`(titleStringProperty, series: readonly SeriesDescriptor[], yRange: Range, timeSeriesModel: TimeSeriesModel, expandedProperty: BooleanProperty)`.

Content layout: `HBox` of [readout column, chart node].

Chart node:

- `const chartTransform = new ChartTransform({ viewWidth: 480, viewHeight: 110, modelXRange: new Range(0, MAX_RECORDING_TIME), modelYRange: yRange });`
- `ChartRectangle` fill `chartBackgroundColorProperty`, stroke `panelBorderColorProperty`.
- `GridLineSet(chartTransform, Orientation.HORIZONTAL, yRange.max / 2, { stroke: chartGridColorProperty })`
  and `GridLineSet(chartTransform, Orientation.VERTICAL, 5, …)` (a line every 5 s).
- `TickMarkSet`/`TickLabelSet` on the bottom edge every 10 s; `TickLabelSet` on the left
  edge at `{ -yRange.max, 0, yRange.max }` — use `createLabel: (value) => new Text(…)`
  options; keep labels plain numbers (axis units are implied by the title; this matches
  the Java plots' minimal labeling).
- One `LinePlot` per series: keep a `private readonly dataSets: Vector2[][]`; construct
  `new LinePlot(chartTransform, dataSets[i], { stroke: series[i].colorProperty, lineWidth: 1.5 })`.
- **Clip the plot area**: set `clipArea` of the chart container to the ChartRectangle shape
  (values can exceed the y-range, e.g. energies above 30 kJ).

Data flow (wired to the shared `timeSeriesModel`):

- `dataPointAddedEmitter.addListener((time, state) => { series.forEach((s, i) => dataSets[i].push(new Vector2(time, s.accessor(state)))); linePlots.forEach((p) => p.update()); })`
- `clearedEmitter.addListener(() => { dataSets.forEach((d) => (d.length = 0)); linePlots.forEach((p) => p.update()); })`

Time cursor: a vertical `Line` over the chart at
`x = chartTransform.modelToViewX(cursorTime)` where `cursorTime` is a DerivedProperty:
mode === "record" ? recordTime : playbackTime (link to `modeProperty`,
`recordTimeProperty`, `playbackTimeProperty`). Stroke `accentColorProperty`, lineWidth 2,
cursor `"ew-resize"`, with a `DragListener`:

```ts
drag: (event) => {
  const x = chartNode.globalToLocalPoint(event.pointer.point).x;
  timeSeriesModel.setPlaybackTime(chartTransform.viewToModelX(clamp(x, 0, 480)));
},
```

(Scrubbing pauses and switches to playback mode — that's `setPlaybackTime`'s contract.)

Readout column (left of the chart, width ≈ 110): for each series a `VBox` row —
`Text(labelStringProperty)` in the series color, and a `Text` bound to a
DerivedProperty of `liveProperty` formatted `value.toFixed(0)` (font 11). This mirrors the
Java per-series readouts without NumberDisplay plumbing.

## 3. `src/common/view/RampPlotsNode.ts` (new)

`class RampPlotsNode extends VBox` (spacing 4, align left) of the three `TimePlotNode`s in
order: energy, work, parallel forces. Expanded Properties are owned by `RampScreenView`
(features bag, extended):

```ts
export interface RampScreenViewFeatures {
  // …existing…
  energyPlotExpanded?: boolean; // default false
  workPlotExpanded?: boolean; // default false
  forcePlotExpanded?: boolean; // default true
  hasRecordPlaybackBar?: boolean; // default false (Intro keeps GoPauseClearPanel)
}
```

Placement: `left: SCREEN_VIEW_MARGIN, bottom: layoutBounds.maxY − SCREEN_VIEW_MARGIN`.
The world view occupies the same screen region — collapsed plots are small title bars, and
expanded plots intentionally overlay the lower world area (Java does the same).

## 4. `src/common/view/RecordPlaybackControlBar.ts` (new)

`class RecordPlaybackControlBar extends HBox` (spacing 8), constructed with
`(timeSeriesModel, requestClear: () => void)` where `requestClear` shows the phase-06
confirm dialog then calls `clear()`:

- `TextPushButton(timeControls.record…)` → `record()`; enabled when
  `recordTime < MAX_RECORDING_TIME`.
- `TextPushButton(timeControls.playback…)` → `playback()`; enabled when `recordTime > 0`.
- `PlayPauseButton(timeSeriesModel.isPlayingProperty, { radius: 18 })` (scenery-phet).
- `TextPushButton(timeControls.rewind…)` → `rewind()`; enabled when mode is playback or
  recordTime > 0.
- `Checkbox(slowMotionAdapterProperty, new Text(timeControls.slowMotion…))` — adapter
  `BooleanProperty(false)` lazy-linked to `playbackSpeedProperty.value = checked ? 0.5 : 1`.
- `TextPushButton(timeControls.clear…)` → `requestClear()`.

Placement: `centerX` over the plots, `bottom: plotsNode.top − 4`. Constructed only when
`features.hasRecordPlaybackBar` is true; the phase-06 `GoPauseClearPanel` is constructed
only when `hasRecordPlaybackBar` is **false** (it moves next to the plots:
`left: plotsNode.right + 10, bottom: plotsNode.bottom`).

## 5. RampScreenView wiring (modify)

- Construct `RampPlotsNode` + (per features) `RecordPlaybackControlBar` or
  `GoPauseClearPanel` as placed above.
- `RampScreenView.reset()` now resets the expanded Properties (bars + plots).
- Recording stops automatically at 30 s (`TimeSeriesModel.step` guard) — verify the Go!
  button greys out then (its enabledProperty from phase 06 already handles this).

## Acceptance criteria (manual)

1. Press Go!/Record, push the block around for ~10 s: all three plots draw colored traces
   in real time; the readout column tracks live values; the cursor advances with time.
2. Forces plot: applied trace mirrors your drags; friction flips sign with motion
   direction; wall spikes at collisions.
3. Drag the cursor left: sim pauses, the whole world (block position, ramp angle, arrows,
   bars) snaps to that moment. Playback replays it in real time; Slow Motion halves the
   speed; Rewind returns to t = 0.
4. Press Record after scrubbing to t = 5 s: future data (t > 5 s) is discarded and
   recording continues from there.
5. Recording stops at exactly 30 s; Clear (with confirm) wipes traces and resets time to 0.
6. Touching any physics control during playback (drag block, slider `startDrag`) jumps
   back to record mode (Java behavior).
7. `npm run check && npm run lint && npm run build && npm run physics-check` pass.
