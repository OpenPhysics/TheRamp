# Model - The Ramp

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation models a **block sliding on a composite surface**: a flat ground segment joined to an
**inclined ramp**. Students push or pull the block with an applied force parallel to the surface, vary
the ramp angle and friction coefficients, and watch **forces**, **work** done by each force, and
**energy** (kinetic, gravitational potential, and thermal) update in real time. The physics is a
faithful port of PhET's Java *The Ramp* (`SimpleRampModule` and `RampModule`).

The key ideas a student should take away:

- On an incline, gravity splits into components **parallel** and **perpendicular** to the surface;
  only the parallel part accelerates the block along the ramp.
- **Static friction** can hold the block at rest until the net parallel force exceeds the maximum
  static value; **kinetic friction** then opposes motion with magnitude μₖN.
- **Work–energy bookkeeping** ties applied work, gravity work, friction work, and thermal energy
  together so total energy is conserved when accounting for heat.
- Friction converts mechanical energy to **thermal energy**; the "Cool Ramp" control resets heat
  without changing the block's motion.

There are two screens:

- **Introduction** — simplified controls and go/pause/clear playback.
- **More Features** — adds time-series plots, record/playback, free-body diagram, measuring tape,
  and zero-point potential-energy line.

## Quantities and units

The model uses SI units throughout.

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Ramp angle | θ | rad (UI shows °) | Incline angle from horizontal |
| Position along surface | s | m | Arc length on the current segment (ground or ramp) |
| Global position | s_g | m | 1D coordinate over ground + ramp, range 0–21 m |
| Applied force | F_app | N | Student force, parallel to current surface |
| Gravity (parallel) | F_g∥ | N | −mg sin θ on the incline; 0 on level ground |
| Normal force | N | N | mg cos θ (perpendicular component) |
| Friction force | f | N | Static or kinetic Coulomb friction |
| Static / kinetic coefficients | μ_s, μ_k | — | Dimensionless; can be set to 0 (frictionless) |
| Mass | m | kg | From selected object or custom value |
| Velocity / acceleration | v, a | m/s, m/s² | Positive = up-ramp / to the right on ground |
| Kinetic / potential / thermal energy | KE, PE, E_th | J | PE reference height set by zero-point line |
| Work (applied / gravity / friction) | W_app, W_g, W_f | J | Accumulated along motion |

Default geometry after reset: **6 m** of ground (x from −6 to 0), **15 m** ramp hinged at the origin,
block at **10 m** up the ramp (global position 16 m), **10°** incline, **100 kg** file cabinet,
μ_s = μ_k = **0.3**, g = **9.8 m/s²**.

## Governing equations

**Force resolution** (at each instant, on the active surface with angle θ):

```
N = m g cos θ
F_g∥ = −m g sin θ
f = friction model (see below)
F_net = F_app + F_g∥ + f + F_wall
a = F_net / m     (|a| < 10⁻⁷ treated as 0)
```

**Coulomb friction** (exact port of the Java `Block.getFrictionForce`):

- If |v| > 0: kinetic friction f = −sign(v) · μ_k · N.
- If v = 0: static friction cancels the net of other parallel forces up to μ_s · N; if that cap is
  exceeded, the block breaks free with friction μ · N where μ = max(μ_s, μ_k).

**Wall forces** stop the block at boundaries: the top of the ramp (s = 15 m on ramp) and the left
end of the ground (s = 0 on ground). The wall force cancels any net force pushing into the wall.

**Motion integration** uses explicit Euler with velocity sign-change capture (if a step would cross
v = 0, velocity is clamped to 0 — the static-friction catch). The student can also **teleport** the
block via a position slider; that reassigns ground vs. ramp segment without integrating.

**Surface handoff**: sliding off the bottom of the ramp (s < 0 on ramp) places the block on the
ground; moving past the end of the ground (s > 6 m) moves it onto the ramp.

**Energy and work** follow a work–energy invariant maintained every step:

```
KE + PE + E_th = W_app + W_g + W_f   (with W_g = −PE at rest baseline)
```

On **frictionless** surfaces, wall collisions convert kinetic energy at impact into thermal energy.
With **friction**, thermal energy is updated from the work balance each step; raising the ramp angle
under a resting block can do work via a dedicated "ramp lift" term (matching the Java original).

## Simplifications and assumptions

- The block is a **point mass** sliding (no rolling, tipping, or rotation).
- **Dry Coulomb friction** with constant μ_s and μ_k; thermal energy accumulates but does not feed
  back into μ (the "Overheated." indicator is visual only, at 50 000 J).
- **Two-dimensional** motion constrained to the 1D ground + ramp path; air resistance is neglected.
- **Instantaneous** force updates when angle, mass, friction, or applied force change at rest.
- g = 9.8 m/s² is constant; the zero-point PE line is a user-chosen reference height.

## References

- Forces on an inclined plane and the work–energy theorem, any introductory mechanics text.
- PhET *The Ramp* Java simulation (`simulations-java/simulations/the-ramp`): `SimpleRampModule`
  and `RampModule`.
- OpenPhysics port verification: `scripts/physics-check.ts` (21 automated scenarios).
