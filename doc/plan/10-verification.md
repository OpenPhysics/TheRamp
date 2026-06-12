# Phase 10 — Final verification

No new features. Run everything, fix what fails, leave the tree green.

## 1. Automated

```bash
npm run check          # tsc src + scripts
npm run lint           # biome — run `npm run fix` first if needed
npm run physics-check  # all scenarios PASS, exit 0
npm run build          # tsc && vite build (PWA manifest generated)
npm run preview        # serve dist/ for the PWA smoke test below
```

`npm run physics-check` scenario matrix (from doc 02) — confirm all nine still pass:
static hold · break-away threshold (459 N holds / 460 N moves) · frictionless slide
(v = −4.9 after 1 s at 30°) · 600-step invariant soak · ramp-top collision · ground-end
collision · surface-handoff continuity · clearHeat · snapshot determinism.

## 2. Manual browser checklist (`npm run dev`)

Work through in order; each item names its phase of origin if it regresses.

**Physics & world (04)**
- [ ] Cabinet rests at 10°, 16 m global; angle readout "Angle = 10.0°".
- [ ] Ramp drag rotates 0–90°, block glued, height readout tracks.
- [ ] Block drag ≈ 0.83 N/px; release zeroes force; block decelerates and stops.
- [ ] Steep ramp: block slides, crosses onto ground seamlessly, smashes into the left
      wall (sound), stops. Up-ramp push smashes into the top wall.
- [ ] Sound checkbox off ⇒ silent collisions.

**Vectors & FBD (05)**
- [ ] At rest on 10°: F_G down, F_N perpendicular, F_f up-slope, no F_net. RichText
      subscripts render.
- [ ] FBD mirrors world arrows at 1/20 px/N; FBD drag pushes the block.
- [ ] (More Features) Forces-to-Show and Coordinate-Frames checkboxes hide/show and
      decompose arrows; parallel+perpendicular of gravity sum to entire.

**Controls (06)**
- [ ] All five objects selectable on both screens; dog slides at shallow angles, crate
      needs ~35°.
- [ ] Frictionless ⇒ skateboard appears, no kinetic loss; restore works.
- [ ] Friction slider disabled while frictionless; mass slider stretches the crate and
      changes break-away force.
- [ ] Reset and Clear confirmation dialogs, localized, cancel-able.

**Energy & heat (07)**
- [ ] Energy-Total bar ≡ Work-Applied bar at all times (drag, collide, cool).
- [ ] Grinding friction reddens the board; ≥ 50 kJ shows "Overheated." + Cool Ramp;
      cooling plays slapooh and zeroes thermal.

**Record/playback (08)**
- [ ] Record 10 s of motion; all three plots trace; readouts live.
- [ ] Scrub the cursor: whole world time-travels. Playback, Slow Motion (half speed),
      Rewind all behave; recording caps at 30 s; Clear wipes.
- [ ] Touching any control during playback returns to record mode.
- [ ] Record → scrub to 5 s → Record again: trace beyond 5 s is gone, recording continues.

**Screens & polish (09)**
- [ ] Intro vs More Features feature split exactly per the doc-09 table.
- [ ] Measuring tape measures the 15 m board as ~15 m.
- [ ] Zero-point PE line drag makes the PE bar negative when above the block.
- [ ] Screen icons on home screen + navbar.

**Cross-cutting**
- [ ] Locale en→fr→es live-switches every label, readout pattern, dialog (Preferences →
      Language).
- [ ] Projector mode recolors background, panels, arrows, charts (Preferences → Visual);
      nothing stays dark-on-dark or white-on-white.
- [ ] Reset All on each screen → confirm → identical to first load of that screen.
- [ ] No console errors/warnings during all of the above.
- [ ] Window resize: sky/earth bleed to edges; layout stays usable at narrow widths.

## 3. PWA / build smoke test

After `npm run build && npm run preview`:

- [ ] Sim loads from `dist` build; assets (object images, wav files) load (network tab:
      hashed asset URLs, no 404s).
- [ ] `dist/manifest.webmanifest` exists and the app is installable (Chrome address-bar
      install icon).
- [ ] Audio works in the production build (decode path has no dev-server dependency).

## 4. Done criteria

Tree is clean, all of sections 1–3 pass, and `doc/implementation-notes.md` + root
`CLAUDE.md` status lines reflect the implemented sim (phase 09 item). Commit history should
show one commit per phase (or logical group) with messages like
`feat(physics): pure ramp engine + physics-check (plan 02)`.
