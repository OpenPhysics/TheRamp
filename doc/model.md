# Model - The Ramp

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation models an object on an **inclined plane** subject to applied force, gravity, the normal
force, and friction. Students push or pull an object up and down a ramp, vary the angle and friction,
and watch the **forces**, the **work** done by each force, and the **energy** (kinetic, potential, and
thermal) update in real time. It reinforces Newton's second law on an incline and the work–energy
theorem, including how friction converts mechanical energy to heat.

There are two screens: **Introduction** (a simplified force/energy view) and **More Features** (adds
charts, record/playback, and additional controls).

## Quantities and units

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Ramp angle | θ | degrees / rad | Incline angle from horizontal |
| Position along ramp | s | m | Object's location measured along the surface |
| Applied force | F_app | N | Pushed/pulled by the student |
| Gravity force | mg | N | Weight of the object |
| Normal force | N | N | Perpendicular to the ramp surface |
| Friction force | f | N | Opposes motion; `f = μN` |
| Coefficient of friction | μ | — | Surface property (static / kinetic) |
| Kinetic / potential / thermal energy | KE, PE, E_th | J | Tracked and charted |

## Governing equations

Resolving forces along and perpendicular to the incline:

```
N = mg·cos θ
F_net = F_app − mg·sin θ − f      (along the ramp)
f = μ·N                            (kinetic friction, opposing motion)
a = F_net / m
```

Energy bookkeeping follows the **work–energy theorem**. Work done by each force is `W = F · d` along the
displacement; friction removes mechanical energy and deposits it as thermal energy, so total energy is
conserved:

```
KE + PE + E_th = constant (in the absence of external applied work)
```

with `PE = mg·h` for the object's height `h` and `KE = ½mv²`. The object's motion is integrated through
the model's `step(dt)`.

## Simplifications and assumptions

- Rigid object treated as a point mass sliding (no rolling or tipping).
- Coulomb (dry) friction with constant coefficients; thermal energy accumulates but does not feed back
  into the dynamics beyond the "overheated ramp" visual cue.
- A barrier/wall can stop the object at the ends of the ramp.
- Two-dimensional, single inclined plane; air resistance is neglected.

## References

- Forces on an inclined plane and the work–energy theorem, any introductory mechanics text.
- Port of the PhET Java *The Ramp* simulation (modules `SimpleRampModule` and `RampModule`).
</content>
