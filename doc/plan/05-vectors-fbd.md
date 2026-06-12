# Phase 05 — Force vector arrows + free-body diagram

Goal: color-coded, labeled force arrows at the block (with the five coordinate-frame
decompositions) and a free-body diagram panel whose horizontal drag applies force.

## Force vectors (model-space, y-up — single definition used by both nodes)

Given the model Properties, with θ = surface angle (0 on ground, `rampAngle` on ramp),
û = (cosθ, sinθ) (up-ramp), n̂ = (−sinθ, cosθ) (away from surface):

| Force | 2D vector (N) | Color property (RampColors) | Symbol string |
|---|---|---|---|
| applied | `appliedParallel · û` | `appliedForceColorProperty` | `forceSymbols.applied` |
| gravity | `(0, −mass · GRAVITY)` | `gravityForceColorProperty` | `forceSymbols.gravity` |
| normal | `normalPerpendicular · n̂` | `normalForceColorProperty` | `forceSymbols.normal` |
| friction | `frictionParallel · û` | `frictionForceColorProperty` | `forceSymbols.friction` |
| wall | `wallParallel · û` | `wallForceColorProperty` | `forceSymbols.wall` |
| total | `netParallel · û` | `totalForceColorProperty` | `forceSymbols.total` |

Frame decompositions of a vector F = (Fx, Fy):
**entire** = F · **parallel** = (F·û)û · **perpendicular** = (F·n̂)n̂ ·
**x** = (Fx, 0) · **y** = (0, Fy).

Model→view vector conversion (arrows use px/N, independent of the MVT):
`view = new Vector2(F.x * FORCE_ARROW_SCALE, -F.y * FORCE_ARROW_SCALE)` (y flip).

Implement the table once as a helper in `ForceVectorSetNode.ts`:

```ts
export type ForceId = "applied" | "gravity" | "normal" | "friction" | "wall" | "total";
export type FrameId = "entire" | "parallel" | "perpendicular" | "x" | "y";

/** Reads the current force vectors (model space, y-up, newtons) from the model. */
export function getForceVectors(model: RampModel): Record<ForceId, Vector2> { … }
export function decompose(force: Vector2, frame: FrameId, theta: number): Vector2 { … }
```

## 1. `src/common/view/ForceArrowNode.ts` (new)

`class ForceArrowNode extends Node` wrapping a scenery-phet `ArrowNode` plus a `RichText`
label (the `forceSymbols.*` strings contain `<sub>` markup — RichText only).

- Ctor: `(labelStringProperty: ReadOnlyProperty<string>, colorProperty: ProfileColorProperty)`.
  ArrowNode options: `{ fill: colorProperty, stroke: RampColors.panelBorderColorProperty, lineWidth: 0.5, tailWidth: 4, headWidth: 14, headHeight: 10 }`.
  RichText: `new PhetFont({ size: 13, weight: "bold" })`, `fill: colorProperty`.
- `public update(tail: Vector2, viewForce: Vector2): void` — if `viewForce.magnitude < 1`
  (sub-pixel), hide self and return; else show, `arrowNode.setTailAndTip(tail.x, tail.y,
  tail.x + viewForce.x, tail.y + viewForce.y)`, place the label centered 12 px beyond the
  tip along the arrow direction.

## 2. `src/common/view/ForceVectorSetNode.ts` (new)

Constructor `(model: RampModel, blockTailProperty: ReadOnlyProperty<Vector2>)` where
`blockTailProperty` is provided by `RampSceneNode` (below).

- Creates `5 frames × 6 forces = 30` ForceArrowNodes, keyed `arrows[frame][force]`.
- Per-arrow visibility: `visibleProperty = DerivedProperty.and([frameToggle, forceToggle])`
  where frame toggles come from `model.vectorVisibility`
  (`entireVectorsProperty`, `parallelComponentsProperty`, `perpendicularComponentsProperty`,
  `xComponentsProperty`, `yComponentsProperty`) and force toggles are
  `appliedVisibleProperty` … `totalVisibleProperty`.
  (`update()` additionally hides sub-pixel arrows regardless.)
- Update everything from one `Multilink` over
  `[appliedParallelProperty, gravityParallelProperty, frictionParallelProperty,
  wallParallelProperty, netParallelProperty, normalPerpendicularProperty, massProperty,
  surfaceProperty, rampAngleProperty, blockTailProperty]`:
  compute `getForceVectors`, then for each visible arrow
  `arrow.update(tail, toView(decompose(force, frame, theta)))`.
  The **total** arrow gets its tail offset 15 px further along n̂ (view) so it doesn't sit
  on the others (Java offsets the net-force arrow too).

In `RampSceneNode` (modify): add
`public readonly blockTailProperty: ReadOnlyProperty<Vector2>` — a DerivedProperty of
`[model.blockLocationProperty, model.surfaceProperty, model.rampAngleProperty]` returning
the block's view position lifted 30 px along the surface normal (model n̂ = (−sinθ, cosθ),
so in view coordinates the offset is `(−30·sinθ, −30·cosθ)`):
`mvt.modelToViewPosition(loc).plusXY(-30 * Math.sin(theta), -30 * Math.cos(theta))`,
which at θ = 0 is (0, −30), i.e. 30 px straight above the contact point. Add
`new ForceVectorSetNode(model, this.blockTailProperty)` as the scene's top layer.

## 3. `src/common/view/FreeBodyDiagramNode.ts` (new)

An `AccordionBox` (from `scenerystack/sun`) whose content is a fixed
`FBD_SIZE × FBD_SIZE` (200×200) diagram:

- Background `Rectangle(0, 0, 200, 200)` fill `RampColors.chartBackgroundColorProperty`,
  stroke `panelBorderColorProperty`.
- Axes: two `Line`s through the center (100, 100), stroke `chartGridColorProperty`.
- Six `ForceArrowNode`s (reuse), tails fixed at (100, 100), scale `FBD_FORCE_SCALE`
  (1/20 px/N): `view = (F.x / 20, -F.y / 20)`. Frames don't apply here — the FBD always
  shows **entire** vectors; per-force visibility uses the same six
  `model.vectorVisibility.*VisibleProperty`s. Same update Multilink sources as above.
- Drag-to-apply-force on the background (cursor `"ew-resize"`), exactly the BlockNode
  pattern but with `FBD_FORCE_PER_PIXEL` (20 N/px):
  start → `ensureRecordMode()` + record start x; drag →
  `appliedForceProperty.value = clamp(dx * FBD_FORCE_PER_PIXEL, ±1000)`; end → 0.
- AccordionBox options: `titleNode: new Text(controls.freeBodyDiagramStringProperty, { font: new PhetFont(14), fill: RampColors.textColorProperty })`,
  `expandedProperty: model.vectorVisibility.fbdVisibleProperty`,
  `fill: RampColors.panelBackgroundColorProperty`, `stroke: panelBorderColorProperty`.

## 4. RampScreenView wiring (modify)

Introduce the options bag that later phases extend:

```ts
export interface RampScreenViewFeatures {
  hasFreeBodyDiagram?: boolean; // default true for now; finalized in phase 09
}
```

`RampScreenView` ctor gains `features: RampScreenViewFeatures = {}`. When
`features.hasFreeBodyDiagram !== false`, add `FreeBodyDiagramNode` at
`left: SCREEN_VIEW_MARGIN, top: SCREEN_VIEW_MARGIN`.

## Acceptance criteria (manual, `npm run dev`; autoplay from phase 04 still active)

1. Initial scene (cabinet, 10°): blue gravity arrow straight down (~196 px = 980 N × 0.06),
   magenta normal arrow perpendicular to the board, red friction arrow pointing up-ramp
   balancing gravity's parallel pull, no applied/total/wall arrows (zero). Labels show
   F_G, F_N, F_f with proper subscripts.
2. Dragging the block shows the orange F_A arrow growing with drag distance and a green
   F_net arrow when unbalanced; arrows track the moving block.
3. The FBD panel (top-left) mirrors the same arrows at 1/20 px/N; collapsing it works;
   dragging horizontally inside it pushes the block (20 N/px — small motions push hard).
4. Steepen the ramp past ~17°: friction flips concepts (kinetic, opposing the downward
   slide) and the block moves — arrows update live.
5. `npm run check && npm run lint && npm run build && npm run physics-check` pass.
