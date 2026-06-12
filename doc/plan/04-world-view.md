# Phase 04 — World view: sky, ramp, barriers, draggable block

Goal: the visible world. After this phase you can rotate the ramp by dragging it and push
the block by dragging it, and the block obeys the physics (slides, transfers between ground
and ramp, stops at the walls with a sound).

## Model-view transform

`RampSceneNode` owns the single MVT for the world:

```ts
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Vector2 } from "scenerystack/dot";
import { MODEL_VIEW_SCALE, WORLD_VIEW_ORIGIN } from "../RampConstants.js";

const mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
  Vector2.ZERO,
  WORLD_VIEW_ORIGIN, // (200, 390)
  MODEL_VIEW_SCALE, // 26 px/m
);
```

Resulting geometry (for sanity checks): ground spans view x ∈ [44, 200] at y = 390; ramp is
hinged at (200, 390); ramp top at angle θ is at `(200 + 390·cosθ, 390 − 390·sinθ)` —
(584, 322) at 10°, (200, 0) at 90°. The world occupies roughly the left ~600 px of the
1024×618 layout; control panels (phase 06) take the right column; plots (phase 08) overlay
the bottom.

## 1. `src/common/view/SkyAndGroundNode.ts` (new)

A `Node` with two `Rectangle` children sized against the **visibleBounds** the ScreenView
passes in (so sky/earth bleed to the window edges):

- Sky: from top of bounds down to `WORLD_VIEW_ORIGIN.y` (390), fill
  `RampColors.skyColorProperty`.
- Earth: from 390 to bottom of bounds, fill `RampColors.earthColorProperty`.

Constructor signature: `(visibleBoundsProperty: ReadOnlyProperty<Bounds2>)`; link to it and
re-set both `rects` via `setRect` so window resizes stay covered.

## 2. `src/common/view/SurfaceNode.ts` (new) — ground line + rotatable ramp

Exports two classes.

**`GroundSurfaceNode`** — a `Line` from view (44, 390) to (200, 390), `lineWidth: 3`,
stroke `RampColors.rampSurfaceColorProperty`. (The earth rectangle provides the body; this
line crisps the walking surface.)

**`RampSurfaceNode`** — the rotatable ramp board. Structure:

- A `Rectangle(0, -12, 390, 12)` (the board: 15 m × 26 px/m long, 12 px thick, drawn in an
  unrotated local frame where +x is "up the ramp" and the top surface is local y = −12…0 —
  scenery view coords are y-down, so the board lies ABOVE the local x-axis by using
  y ∈ [−12, 0]). Fill: the heat-glow property (below); stroke
  `RampColors.panelBorderColorProperty`, `lineWidth: 1`.
- The top wall barrier as a child (see BarrierNode) so it rotates with the board, standing
  on the board's top surface at the far end: `barrier.right = 390; barrier.bottom = -12;`
  (barrier is 14 px wide, 60 px tall).
- Node placement: `translation = WORLD_VIEW_ORIGIN` and
  `model.rampAngleProperty.link((angle) => { this.rotation = -angle; });`
  (negative because view y is down).

Heat glow fill (create inside RampSurfaceNode):

```ts
const heatFillProperty = new DerivedProperty(
  [model.thermalEnergyProperty, RampColors.rampSurfaceColorProperty, RampColors.rampSurfaceHotColorProperty],
  (thermal, cold, hot) => Color.interpolateRGBA(cold, hot, clamp(thermal / OVERHEAT_THERMAL_ENERGY, 0, 1)),
);
```

(`Color.interpolateRGBA(color1, color2, ratio)` — verify the static exists on `Color` in
`scenerystack/scenery`; if absent, use `color1.blend(color2, ratio)`.)

Rotate-drag: `DragListener` on the board rectangle, `cursor: "pointer"`:

```ts
drag: (event) => {
  const parentPoint = this.globalToParentPoint(event.pointer.point); // parent = scene
  const dx = parentPoint.x - WORLD_VIEW_ORIGIN.x;
  const dy = WORLD_VIEW_ORIGIN.y - parentPoint.y; // flip to y-up
  model.rampAngleProperty.value = clamp(Math.atan2(dy, Math.max(dx, 1e-6)), ANGLE_RANGE.min, ANGLE_RANGE.max);
},
```

Readouts (children of the **scene**, not the rotated board):

- Angle readout: `Text` with a `PatternStringProperty` of
  `StringManager.getInstance().getReadoutStrings().anglePatternStringProperty` and
  `{ value: angleDegreesProperty }` where
  `angleDegreesProperty = new DerivedProperty([model.rampAngleProperty], (a) => ((a * 180) / Math.PI).toFixed(1))`.
  Font `new PhetFont(14)`, fill `RampColors.readoutTextColorProperty`. Position: just right
  of the hinge, `left: WORLD_VIEW_ORIGIN.x + 8, top: WORLD_VIEW_ORIGIN.y + 6` (on the earth).
- Height readout: same pattern with `heightPatternStringProperty` and
  `value: new DerivedProperty([model.rampHeightProperty], (h) => h.toFixed(1))`. Reposition
  on every angle change: x = ramp top view x + 10, y = midway between ramp top y and 390.
  Visible only when angle > 0.05 rad.

## 3. `src/common/view/BarrierNode.ts` (new)

`class BarrierNode extends Rectangle` — `(0, 0, 14, 60)` with fill
`RampColors.barrierColorProperty`, stroke `RampColors.panelBorderColorProperty`. Add three
horizontal `Line` children (at y = 15, 30, 45) stroked with panelBorder for a brick hint.
Instances:

- Left wall: in `RampSceneNode`, `right: 44, bottom: 390` (the block's left limit, global 0).
- Ramp-top wall: child of `RampSurfaceNode` as described above.

## 4. `src/common/view/BlockNode.ts` (new)

Structure: `class BlockNode extends Node` containing:

- `skateboardImage = new Image(RampImages.skateboard)` — `visibleProperty` =
  `new DerivedProperty([model.staticFrictionProperty, model.kineticFrictionProperty], (s, k) => s === 0 && k === 0)`;
  scaled to ~60 px wide (`maxWidth: 60`), `centerX: 0`, `bottom: 0`.
- `objectImage = new Image(RampImages[obj.imageKey])`.

On `model.selectedObjectProperty.link((obj) => { … })`: set `objectImage.image = RampImages[obj.imageKey]`,
then `objectImage.setScaleMagnitude(obj.viewScale)`, `objectImage.centerX = 0`,
`objectImage.bottom = obj.yOffset` (Java's yOffset sinks the image into the surface),
and when the skateboard is visible the object rides it: link a `Multilink` of
`[selectedObjectProperty, skateboardImage.visibleProperty]` and set
`objectImage.bottom = skateboardVisible ? skateboardImage.top + 4 : obj.yOffset`.

Mass stretch (Java `sy = scale * mass / preferredMass`): in a `Multilink` of
`[model.selectedObjectProperty, model.massProperty]`, set the object image's y-scale to
`obj.viewScale * (mass / obj.mass)` (x-scale stays `obj.viewScale`) via
`objectImage.setScaleMagnitude(obj.viewScale, obj.viewScale * (mass / obj.mass))`, then
re-apply the bottom/centerX placement.

Placement (a `Multilink` of `[model.blockLocationProperty, model.surfaceProperty, model.rampAngleProperty]`):

```ts
this.translation = mvt.modelToViewPosition(blockLocation);
this.rotation = surface === "ramp" ? -rampAngle : 0;
```

Drag → applied force (cursor `"ew-resize"`):

```ts
let dragStartX = 0;
this.addInputListener(
  new DragListener({
    start: (event) => {
      model.timeSeriesModel.ensureRecordMode();
      dragStartX = this.globalToParentPoint(event.pointer.point).x;
    },
    drag: (event) => {
      const dx = this.globalToParentPoint(event.pointer.point).x - dragStartX;
      model.appliedForceProperty.value = clamp(
        dx * APPLIED_FORCE_PER_PIXEL,
        APPLIED_FORCE_RANGE.min,
        APPLIED_FORCE_RANGE.max,
      );
    },
    end: () => {
      model.appliedForceProperty.value = 0;
    },
  }),
);
```

PORT NOTE: the drag does NOT move the block directly — it sets a horizontal applied force
(≈0.83 N per pixel of displacement from the grab point) and the physics moves the block.
This is exactly the Java interaction.

## 5. `src/common/view/RampSceneNode.ts` (new)

`class RampSceneNode extends Node`. Constructor
`(model: RampModel, visibleBoundsProperty: ReadOnlyProperty<Bounds2>)`. Owns the MVT
(`public readonly modelViewTransform: ModelViewTransform2`) — later phases (vectors,
measuring tape, zero-point line) attach through accessors on this node.

Children in z-order (back→front): `SkyAndGroundNode`, `GroundSurfaceNode`, left
`BarrierNode`, `RampSurfaceNode`, `BlockNode`, readout texts. Expose
`public readonly blockNode: BlockNode` (phase 05 anchors arrows to it).

## 6. `src/common/view/RampScreenView.ts` (new base class)

```ts
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
```

(Check the actual options type export: the scaffold's `IntroScreenView` already extends
`ScreenView` — reuse whatever options pattern it has.)

Phase-04 contents (this class grows in every later phase):

- `protected readonly sceneNode: RampSceneNode` — added first, sized by passing
  `this.visibleBoundsProperty`.
- `new CollisionSoundPlayer(model.collisionEmitter, model.soundEnabledProperty);`
- `ResetAllButton` bottom-right (move the existing stub code here), listener:
  `model.reset(); this.reset();` (confirm dialog comes in phase 06).
- TEMPORARY: `model.timeSeriesModel.isPlayingProperty.value = true;` with comment
  `// TODO(phase-06): remove — autoplay so phases 04-05 are testable before Go/Pause exists`.
- `public reset(): void` and `public override step(dt: number): void` hooks (empty bodies ok).

Rewrite `src/intro/view/IntroScreenView.ts` and
`src/more-features/view/MoreFeaturesScreenView.ts` as subclasses:

```ts
export class IntroScreenView extends RampScreenView {
  public constructor(model: IntroModel, options: IntroScreenViewOptions) {
    super(model, options);
  }
}
```

keeping their existing exported options types so `IntroScreen.ts`/`MoreFeaturesScreen.ts`
compile unchanged. Delete the placeholder Rectangle/Text from the stubs (the scene now
fills the screen).

## Acceptance criteria (manual, `npm run dev`)

1. Both screens show sky, earth, a 10°-inclined ramp with a wall at its top, a left wall,
   and the File Cabinet resting on the ramp at global 16 m (≈ view x 584… block sits ~10 m
   up the board).
2. Dragging the ramp board rotates it smoothly through 0–90°; the block stays glued to the
   board and the angle readout tracks (e.g. "Angle = 35.2°").
3. With the ramp near 10°, dragging the cabinet rightward ≥ ~550 px makes it creep up-ramp;
   releasing lets friction stop it. Steeper than ~17° (tan⁻¹ 0.3), the cabinet slides down
   on its own, accelerates onto the ground, coasts to the left wall, stops with a smash
   sound.
4. Pushing the block to the ramp top stops it at the wall with a sound.
5. Reset All restores the initial scene.
6. `npm run check && npm run lint && npm run build && npm run physics-check` pass.
