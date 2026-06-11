# Implementation Notes - Sim Template

## Architecture Overview

TemplateSingleSim is a minimal starter scaffold for forking new single-screen SceneryStack simulations. It demonstrates the Model-View pattern, color profiles, localization, and reset behavior without domain-specific physics.

### High-Level Architecture

The simulation follows a modular architecture:

- **Model Layer (`src/sim-screen/model/`)**: Stub model with TODO hooks for `step()` and `reset()`
- **View Layer (`src/sim-screen/view/`)**: Placeholder background, label, and Reset All button
- **Bootstrap**: `brand.js` must load first in `main.ts`; `init.ts` configures locales and splash

Data flows from Model → View through AXON-ready property patterns documented in `SimModel.ts`.

## Model Components

### Core Model Design

`SimModel` is an empty coordinator with commented examples for observable properties and simulation stepping.

When forking this template:

1. Rename `SimModel`, `SimScreen`, and `SimScreenView` to match the new sim name
2. Replace `SimColors.ts` and `SimNamespace.ts` with sim-specific files
3. Add physics logic in `step()` and state restoration in `reset()`

## View Components

### SimScreenView as Coordinator

The screen view demonstrates layout using `layoutBounds`, background fill from `SimColors.ts`, and a `ResetAllButton` wired to `model.reset()`.

When extending the view:

- Add specialized nodes under `src/sim-screen/view/`
- Keep colors in `SimColors.ts` and strings in `src/i18n/strings_*.json`
- Run `scripts/generate-icons.ts` after updating branding assets

### Color Scheme

`SimColors.ts` defines `ProfileColorProperty` instances for default and projector profiles. This is the pattern all forked sims should follow.

### Fork Checklist

- Update package name, sim title, and locale files (en, es, fr)
- Regenerate PWA icons and splash assets
- Replace placeholder view content with play area and control panels
- Add `doc/implementation-notes.md` describing the new sim's architecture

Note that no dispose functions have been used, which should be addressed once listeners are added.
