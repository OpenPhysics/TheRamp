# Implementation Notes - The Ramp

## Architecture Overview

The Ramp is a SceneryStack reimplementation of PhET's Java simulation of the
same name (`simulations-java/simulations/the-ramp`). It models forces on an
inclined plane. This is currently a structural scaffold: the screens, model, and
view classes exist as stubs with TODO hooks, but no ramp physics has been ported
yet.

The sim has two screens, mirroring the original Java modules:

- **Introduction** (`src/intro/`) — the Java `SimpleRampModule`
- **More Features** (`src/more-features/`) — the Java `RampModule` (advanced)

### High-Level Architecture

Each screen follows the Model-View pattern:

- **Model Layer (`<screen>/model/`)**: Stub model with TODO hooks for `step()` and `reset()`
- **View Layer (`<screen>/view/`)**: Placeholder background, label, and Reset All button
- **Shared (`src/common/`)**: Cross-screen view content such as `RampKeyboardHelpContent`
- **Bootstrap**: `brand.js` must load first in `main.ts`; `init.ts` configures locales and splash

Data flows from Model → View through AXON-ready property patterns documented in
each model file.

## Model Components

`IntroModel` and `MoreFeaturesModel` are empty coordinators with commented
examples for observable properties and simulation stepping. The next step is to
port the Java `RampModel` / `RampPhysicalModel` physics. The two screens may end
up sharing a common base model once the physics is in place.

## View Components

### Screen views as coordinators

`IntroScreenView` and `MoreFeaturesScreenView` demonstrate layout using
`layoutBounds`, background fill from `RampColors.ts`, and a `ResetAllButton`
wired to `model.reset()`.

When extending a view:

- Add specialized nodes under the screen's `view/` folder
- Keep colors in `RampColors.ts` and strings in `src/i18n/strings_*.json`
- Run `scripts/generate-icons.ts` after updating branding assets

### Color Scheme

`RampColors.ts` defines `ProfileColorProperty` instances for default and
projector profiles, scoped to the `the-ramp` namespace (`RampNamespace.ts`).

## Outstanding Work

- Port the ramp physics into `IntroModel` / `MoreFeaturesModel`
- Replace placeholder view content with the ramp, objects, and control panels
- Replace the placeholder icon/splash branding assets
- Expand `RampKeyboardHelpContent` as interactive controls are added

Note that no dispose functions have been used, which should be addressed once
listeners are added.
