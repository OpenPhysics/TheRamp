# The Ramp — Porting Plan: Overview

This directory contains the complete, ordered plan for porting PhET's Java simulation
**The Ramp** (forces on an inclined plane) to TypeScript + SceneryStack 3.0 in this repo.
The plan is written so that an LLM (or human) can build the entire simulation by executing
the phase documents **in order, one at a time**, without consulting any other source.
Where this plan and the Java source disagree, **this plan wins** (deviations from Java are
deliberate and marked "PORT NOTE").

Reference Java source (read-only, for context only):
`~/svn/trunk/simulations-java/simulations/the-ramp/src/edu/colorado/phet/theramp/`
or within this repo,  `JAVA/src/edu/colorado/phet/theramp/`

## What is being built

A two-screen simulation:

- **Introduction** — block on a ramp; choose an object, push it, watch force vectors and a
  parallel-forces time plot. Bar charts and other plots exist but start collapsed/hidden.
- **More Features** — everything in Introduction plus: free-body diagram, all force/coordinate-frame
  vector toggles, energy & work bar charts and time plots, friction and mass sliders, measuring
  tape, zero-point-PE line.

Shared subsystems: exact Java physics (Euler integration, static/kinetic friction,
wall collisions, energy/work bookkeeping), record/playback of up to 30 s of simulation
state with scrubbing, heat visualization with "Cool Ramp", collision sounds.

## Phase index

Execute in order. **After every phase, all of these must pass:**

```bash
npm run check     # tsc on src + scripts
npm run lint      # biome
npm run build     # tsc && vite build
```

and `npm run dev` must still boot both screens without console errors.

| Doc | Phase | Gate (beyond check/lint/build) |
|---|---|---|
| [01-foundation.md](01-foundation.md) | Strings (en/fr/es), colors, constants, assets | Locale switching still works |
| [02-physics-engine.md](02-physics-engine.md) | Pure physics engine + automated checks | `npm run physics-check` all PASS |
| [03-model.md](03-model.md) | Axon model layer, time-series model, audio | Invariants hold while stepping (dev log) |
| [04-world-view.md](04-world-view.md) | Scene: sky, ramp, barriers, draggable block | Block slides, transfers surfaces, stops at walls |
| [05-vectors-fbd.md](05-vectors-fbd.md) | Force vector arrows + free-body diagram | Static friction balances cabinet at 10° (no motion) |
| [06-controls.md](06-controls.md) | Control panels, sliders, dialogs | Every control round-trips with the model |
| [07-bar-charts-heat.md](07-bar-charts-heat.md) | Energy/work bar charts, heat glow, overheat | Total-energy bar always equals W_applied bar |
| [08-time-series.md](08-time-series.md) | Record/playback + bamboo time plots | Playback reproduces recorded motion |
| [09-screens-polish.md](09-screens-polish.md) | Screen differentiation, tape, zero-point PE, icons | Intro vs More Features feature split correct |
| [10-verification.md](10-verification.md) | Final automated + manual QA | Full checklist green |

## Repo conventions (mandatory)

These come from the existing scaffold and its toolchain. Violating them fails `npm run check`
or `npm run lint`.

1. **Imports**: relative imports use the `.js` extension (`import RampColors from "../../RampColors.js";`),
   matching `src/main.ts`. SceneryStack is imported from its subpath barrels only
   (`scenerystack/axon`, `scenerystack/dot`, …) — never from `scenerystack` root.
2. **`erasableSyntaxOnly` is ON**: no TypeScript `enum`, no `namespace`, no constructor
   parameter properties (`constructor(private x: number)`). Use string-literal union types
   and explicit field declarations instead.
3. **Strict flags**: `exactOptionalPropertyTypes` (never assign `undefined` to an optional
   property; omit the key instead), `noUncheckedIndexedAccess` (indexing an array yields
   `T | undefined`; handle it), `noUnusedLocals/Parameters` (prefix intentionally unused
   params with `_`).
4. **No `console.*` in `src/`** (Biome error). Dev-only diagnostics must be wrapped:
   `if (import.meta.env.DEV) { … }` still may NOT use console in src — use `assert`-style
   throws instead, or put diagnostics in `scripts/`.
5. **Colors**: every color in the sim is a `ProfileColorProperty` in `src/RampColors.ts`
   with both `default` and `projector` values. Never hardcode a color string in a view file.
6. **Strings**: every user-visible string lives in all three of
   `src/i18n/strings_{en,fr,es}.json` and is accessed via `StringManager` getters
   (which return `ReadOnlyProperty<string>`). Never hardcode UI text.
   The two `satisfies` assertions in `StringManager.ts` enforce key parity at compile time.
7. **Tandems**: screens get tandems (already wired in `src/main.ts`). New nodes/properties
   do not need tandems (this sim is not PhET-iO instrumented beyond screens).
8. **Biome style**: 2-space indent, 120-char lines, double quotes, semicolons, trailing
   commas. Run `npm run fix` to auto-format before finishing a phase.
9. **The physics engine imports nothing** (see Architecture below). Do not add a
   scenerystack import to `src/common/model/RampPhysicsEngine.ts`,
   `src/common/model/RampPhysicsConstants.ts`, or `src/common/model/RampObjectDescription.ts` — ever.

## Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │ RampPhysicsEngine.ts  (PURE — zero imports)   │
                    │ RampPhysicsState in → RampPhysicsState out    │
                    └──────────────────────┬────────────────────────┘
                                           │ called by
                    ┌──────────────────────┴────────────────────────┐
                    │ RampModel.ts (axon façade: Properties,        │
                    │ Emitters) ──owns──> TimeSeriesModel.ts        │
                    │ (record/playback snapshot buffer)             │
                    └──────────────────────┬────────────────────────┘
              IntroModel = MoreFeaturesModel = trivial subclasses
                                           │ observed by
                    ┌──────────────────────┴────────────────────────┐
                    │ RampScreenView.ts (options-driven base view)  │
                    │  RampSceneNode (world) · ForceVectorSetNode   │
                    │  FreeBodyDiagramNode · EnergyWorkBarCharts    │
                    │  RampPlotsNode (bamboo) · RampControlPanel    │
                    └───────────────────────────────────────────────┘
         IntroScreenView / MoreFeaturesScreenView = subclasses passing option flags
```

Key decisions:

- **One shared codebase, options-driven screens** (mirrors Java `SimpleRampModule extends
  RampModule`). `RampScreenViewOptions` feature flags decide what each screen shows.
  `IntroModel`/`MoreFeaturesModel` remain as (trivial) subclasses of `RampModel` so the
  scaffold's `Screen<Model, View>` generics keep working.
- **Pure physics engine**: `RampPhysicsEngine.ts` has zero imports, operates on plain
  immutable `RampPhysicsState` objects, and returns fresh state each step. This (a) makes
  record/playback snapshots free (just store the state object), and (b) lets
  `scripts/physics-check.ts` run the physics under Node via `tsx` with no browser shims.
- **Record/playback**: `TimeSeriesModel` keeps `Array<{time, state}>`; playback restores
  snapshots into the model Properties. Any user input that changes physics switches back
  to record mode (Java behavior).

## Complete file map

New files (N) and modified files (M). Phase column = where it's created.

| File | Ph | Responsibility |
|---|---|---|
| `src/common/model/RampPhysicsConstants.ts` (N) | 01 | Zero-import numeric constants (gravity, lengths, init angle, max dt, max recording time, overheat threshold) |
| `src/common/RampConstants.ts` (N) | 01 | UI/view constants (Ranges, MVT scale/origin, arrow scales, margins); imports dot + re-exports physics constants |
| `src/assets/images/*` + `src/assets/audio/*` (N) | 01 | Copied Java assets + license files |
| `src/assets/images.ts` (N) | 01 | imageKey → imported URL map |
| `src/assets/audio.ts` (N) | 01 | audioKey → imported URL map |
| `src/RampColors.ts` (M) | 01 | +22 ProfileColorProperties |
| `src/i18n/strings_{en,fr,es}.json` (M) | 01 | +~75 keys (full content in doc 01) |
| `src/i18n/StringManager.ts` (M) | 01 | Typed per-group getters |
| `src/common/model/RampPhysicsEngine.ts` (N) | 02 | Pure physics: setupForces, stepPhysics, energy bookkeeping, boundary handoff |
| `src/common/model/RampObjectDescription.ts` (N) | 02 | The 5 selectable objects (mass, μ, view scale, yOffset, imageKey) |
| `scripts/physics-check.ts` (N) | 02 | Node-run verification scenarios (exit 1 on failure) |
| `src/common/model/RampModel.ts` (N) | 03 | Axon façade over engine; snapshot get/set; owns TimeSeriesModel |
| `src/common/model/TimeSeriesModel.ts` (N) | 03 | Record/playback modes, buffer, scrubbing, 30 s cap |
| `src/common/model/VectorVisibilityModel.ts` (N) | 03 | Per-force + per-frame BooleanProperties, fbdVisibleProperty |
| `src/common/audio/loadSoundClip.ts` (N) | 03 | URL → SoundClip via WrappedAudioBuffer + asyncLoader |
| `src/common/audio/CollisionSoundPlayer.ts` (N) | 03 | collisionEmitter → tiered smash sounds |
| `src/intro/model/IntroModel.ts` (M) | 03 | `extends RampModel` |
| `src/more-features/model/MoreFeaturesModel.ts` (M) | 03 | `extends RampModel` |
| `src/common/view/SkyAndGroundNode.ts` (N) | 04 | Sky + earth rectangles |
| `src/common/view/SurfaceNode.ts` (N) | 04 | Ground segment + rotatable RampSurfaceNode (heat fill, readouts) |
| `src/common/view/BarrierNode.ts` (N) | 04 | Brick wall at ground left end and ramp top |
| `src/common/view/BlockNode.ts` (N) | 04 | Object image riding the surface; drag → applied force; skateboard when frictionless |
| `src/common/view/RampSceneNode.ts` (N) | 04 | Composes world (MVT owner) |
| `src/common/view/RampScreenView.ts` (N) | 04 | Base ScreenView; grows through phases 5–9 |
| `src/intro/view/IntroScreenView.ts` (M) | 04 | `extends RampScreenView` (flags finalized in 09) |
| `src/more-features/view/MoreFeaturesScreenView.ts` (M) | 04 | `extends RampScreenView` |
| `src/common/view/ForceArrowNode.ts` (N) | 05 | One labeled force arrow |
| `src/common/view/ForceVectorSetNode.ts` (N) | 05 | 5 coordinate frames × 6 forces at the block |
| `src/common/view/FreeBodyDiagramNode.ts` (N) | 05 | 200×200 FBD in AccordionBox; drag applies force |
| `src/common/view/ConfirmDialog.ts` (N) | 06 | `showConfirmDialog` helper (scenerystack `Dialog`) |
| `src/common/view/RampControlPanel.ts` (N) | 06 | Options-assembled right-side panel |
| `src/common/view/ObjectSelectionPanel.ts` (N) | 06 | Radio-button object chooser (Intro) |
| `src/common/view/ObjectComboBox.ts` (N) | 06 | ComboBox object chooser (More Features) |
| `src/common/view/AppliedForceControl.ts` (N) | 06 | NumberControl ±1000 N |
| `src/common/view/GoPauseClearPanel.ts` (N) | 06 | Go!/Pause/Clear with confirm dialog |
| `src/common/view/BarChartNode.ts` (N) | 07 | Generic labeled bar set (stacked groups, zoomable scale) |
| `src/common/view/BarChartAccordionBox.ts` (N) | 07 | Chart panel with zoom buttons + legend dialog |
| `src/common/view/EnergyWorkBarChartsNode.ts` (N) | 07 | Energy + Work BarChartAccordionBoxes |
| `src/common/view/OverheatNode.ts` (N) | 07 | "Overheated." + Cool Ramp button |
| `src/common/view/TimePlotNode.ts` (N) | 08 | One bamboo time plot + cursor + readouts in AccordionBox |
| `src/common/view/RampPlotsNode.ts` (N) | 08 | Stacks the three plots; series registry |
| `src/common/view/RecordPlaybackControlBar.ts` (N) | 08 | Record/Play/Slow/Pause/Rewind/Clear |
| `src/common/view/ZeroPointPeLineNode.ts` (N) | 09 | Draggable zero-point-PE dashed line |
| `src/common/view/RampScreenIcons.ts` (N) | 09 | Drawn ScreenIcons |
| `src/common/view/RampKeyboardHelpContent.ts` (M) | 09 | + slider help section |
| `src/intro/IntroScreen.ts`, `src/more-features/MoreFeaturesScreen.ts` (M) | 09 | Pass ScreenIcons |
| `doc/implementation-notes.md` (M) | 09 | Update to describe the built sim |

## Constants table (single source of truth)

Defined in `RampPhysicsConstants.ts` (P = physics, zero-import file) or
`RampConstants.ts` (V = view). Doc 01 contains the full file contents.

| Constant | Value | Where |
|---|---|---|
| `GRAVITY` | `9.8` m/s² | P |
| `RAMP_LENGTH` | `15.0` m | P |
| `GROUND_LENGTH` | `6.0` m | P |
| `GROUND_ORIGIN_X` | `-6.0` m (ground spans x ∈ [−6, 0], ramp base at origin) | P |
| `INITIAL_RAMP_ANGLE` | `10 * Math.PI / 180` | P |
| `INITIAL_POSITION_IN_SURFACE` | `10.0` m (on ramp ⇒ global 16) | P |
| `MAX_DT` | `0.2` s (clamp on Sim step dt) | P |
| `MAX_RECORDING_TIME` | `30` s | P |
| `OVERHEAT_THERMAL_ENERGY` | `50000` J | P |
| `ANGLE_RANGE` | `new Range(0, Math.PI / 2)` | V |
| `POSITION_RANGE` | `new Range(0, 21)` (global, m) | V |
| `APPLIED_FORCE_RANGE` | `new Range(-1000, 1000)` N | V |
| `FRICTION_RANGE` | `new Range(0.1, 1.5)` | V |
| `MASS_RANGE` | `new Range(100, 500)` kg | V |
| `MODEL_VIEW_SCALE` | `26` px/m | V |
| `WORLD_VIEW_ORIGIN` | `new Vector2(200, 390)` (view px of model origin = ramp base) | V |
| `FORCE_ARROW_SCALE` | `0.06` px/N (world arrows) | V |
| `FBD_FORCE_SCALE` | `1 / 20` px/N | V |
| `FBD_SIZE` | `200` px | V |
| `APPLIED_FORCE_PER_PIXEL` | `1 / 1.2` N/px (block drag) | V |
| `FBD_FORCE_PER_PIXEL` | `20` N/px (FBD drag) | V |
| `ENERGY_BAR_SCALE` | `0.005` px/J | V |
| `PLOT_ENERGY_RANGE` | `new Range(-30000, 30000)` J | V |
| `PLOT_FORCE_RANGE` | `new Range(-1000, 1000)` N | V |
| `SCREEN_VIEW_MARGIN` | `10` px | V |
| `RAMP_BOARD_THICKNESS` | `12` px (visual ramp board thickness) | V |
| Collision sound tiers | |Δp| < 50 silent · < 2000 smash0 · < 4000 smash1 · else smash2 | doc 03 |

## Verified SceneryStack 3.0 API map

All verified against `node_modules/scenerystack/dist/prod/*.d.ts` in this repo.
**Gotchas are real — do not "fix" them from memory of PhET repos.**

| Need | Import from | Names |
|---|---|---|
| Properties | `scenerystack/axon` | `Property, NumberProperty, BooleanProperty, DerivedProperty, StringUnionProperty, EnumerationProperty, Emitter, Multilink, PatternStringProperty` |
| Math | `scenerystack/dot` | `Vector2, Bounds2, Range`, **top-level `clamp` and `linear` functions** (there is NO `Utils.clamp` in scenerystack 3.0) |
| MVT | `scenerystack/phetcommon` | `ModelViewTransform2.createSinglePointScaleInvertedYMapping(modelPoint, viewPoint, scale)` |
| Charts | `scenerystack/bamboo` | `ChartTransform, ChartRectangle, LinePlot, GridLineSet, TickMarkSet, TickLabelSet, AxisLine` |
| UI | `scenerystack/sun` | `Panel, Checkbox, VerticalCheckboxGroup, HSlider, ComboBox, VerticalAquaRadioButtonGroup, RectangularPushButton, TextPushButton, AccordionBox` |
| Dialog | `scenerystack/sim` | **`Dialog` is exported from `scenerystack/sim`, NOT from sun** |
| scenery-phet | `scenerystack/scenery-phet` | `ArrowNode, NumberControl, NumberDisplay, PhetFont, MeasuringTapeNode, ResetAllButton, TimeControlNode, TimeSpeed, RestartButton, EraserButton, ZoomButton, InfoButton, MoveToTrashLegendButton` |
| Scenery | `scenerystack/scenery` | `Node, Rectangle, Path, Line, Circle, Image, Text, RichText, HBox, VBox, DragListener, Color, ProfileColorProperty, LinearGradient` |
| Sound | `scenerystack/tambo` | `SoundClip, WrappedAudioBuffer, phetAudioContext, soundManager` |
| Async lock | `scenerystack/phet-core` | `asyncLoader` |
| Shapes | `scenerystack/kite` | `Shape` |

Asset imports: Vite + the `vite/client` types (already in tsconfig) make
`import cabinetUrl from "./images/cabinet.gif";` yield a typed URL string for
`.gif`, `.png`, and `.wav`. scenery's `Image` node accepts a URL string directly.

## Physics summary (full spec in doc 02)

World: ground segment (angle 0, length 6 m, from x=−6 to the origin) feeding a ramp
(length 15 m, hinged at the origin, angle 0–90°, initially 10°). The block lives on exactly
one surface; its 1D coordinate is `positionInSurface` (m along that surface); global
position = positionInSurface + (ramp ? 6 : 0) ∈ [0, 21]. Positive direction = rightward /
up-ramp. A wall sits at global 0 (ground left end) and at global 21 (ramp top).

Per step (Euler, dt clamped ≤ 0.2 s): compute parallel forces (applied, gravity = −mg sinθ,
friction with static/kinetic logic, wall), a = ΣF/m; v += a·dt with sign-change capture
(v crossing zero ⇒ v = 0, models static-friction catch); x += v·dt; boundary handoff
(ground↔ramp with overshoot transfer) or wall collision (clamp + v=0 + collision event);
then energy/work bookkeeping with the invariants
**totalEnergy === appliedWork** and **ΔKE === totalWork** (these are checked automatically).

The five selectable objects (Java values, exact):

| Object | image | mass kg | μs | μk | view scale | yOffset px |
|---|---|---|---|---|---|---|
| File Cabinet (initial) | cabinet.gif | 100 | 0.3 | 0.3 | 0.4 | 0 |
| Refrigerator | fridge.gif | 175 | 0.5 | 0.5 | 0.4 | 0 |
| Piano | piano.png | 225 | 0.4 | 0.4 | 0.6 | 20 |
| Crate | crate.gif | 300 | 0.7 | 0.7 | 0.3 | 0 |
| Sleepy Dog | ollie.gif | 15 | 0.1 | 0.1 | 0.3 | 5 |

## PORT NOTES (deliberate deviations from Java)

1. **Thermal-before-appliedWork on frictionless collisions**: Java updates `appliedWork`
   before adding collision KE to thermal, transiently breaking its own invariant. We update
   thermal first so `totalEnergy === appliedWork` holds on every step including collision steps.
2. **Fixed conventions**: TS model uses standard math (y up, angles CCW). Java's −θ screen
   convention is absorbed by the inverted-Y ModelViewTransform2.
3. **No pusher animation, no firedog**: applied force is shown by vectors only; Cool Ramp
   fades the heat glow and plays `slapooh.wav`.
4. **dt**: Java re-derives dt from wall-clock and clamps to [1/30, 1/5]. We use the dt that
   `Sim` passes to `model.step(dt)` clamped to ≤ `MAX_DT` (0.2 s). No lower clamp.
5. **Position slider** is global 0–21 m (Java used a −6…15 relative coordinate).
6. **Reset/Clear confirmations** use scenerystack `Dialog` (from `scenerystack/sim`)
   instead of Swing JOptionPane.
