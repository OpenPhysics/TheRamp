# Multi-Screen Simulations

The Ramp is a **two-screen** inclined-plane / work–energy sim. Screens share
`TheRampPreferencesModel` and the common `RampModel` / `RampScreenView` stack;
thin Intro vs More Features wrappers select feature flags. Icons are set in
each `*Screen.ts` (`homeScreenIcon` only today).

For pedagogy and architecture, see [model.md](./model.md) and
[implementation-notes.md](./implementation-notes.md).

---

## Screens in this sim

| Order | UI name | Folder | Screen class | Icon factory |
|---|---|---|---|---|
| 1 | Introduction | `src/intro/` | `IntroScreen` | `createIntroIcon()` |
| 2 | More Features | `src/more-features/` | `MoreFeaturesScreen` | `createMoreFeaturesIcon()` |

```
main.ts
  ├─ IntroScreen         → IntroModel / IntroScreenView
  └─ MoreFeaturesScreen  → MoreFeaturesModel / MoreFeaturesScreenView
         │
         └─ both built on common RampModel + RampScreenView (feature flags)
```

Models are independent instances; preferences seed defaults on construction and
Reset All.

---

## Folder layout

```
src/
├─ common/
│   ├─ TheRampScreenIcons.ts
│   ├─ model/          # RampPhysicsEngine, RampModel, energy, time series, …
│   └─ view/           # RampScreenView, controls, FBD, plots, …
├─ intro/
│   ├─ IntroScreen.ts
│   ├─ model/IntroModel.ts
│   └─ view/IntroScreenView.ts
└─ more-features/
    ├─ MoreFeaturesScreen.ts
    ├─ model/MoreFeaturesModel.ts
    └─ view/MoreFeaturesScreenView.ts
```

Icons live only in `src/common/TheRampScreenIcons.ts`.

---

## Wiring in `main.ts` and `*Screen.ts`

```typescript
// src/main.ts
const rampPreferences = new TheRampPreferencesModel(
  Tandem.ROOT.createTandem("preferences"),
);

const screens = [
  new IntroScreen({
    preferences: rampPreferences,
    name: screenNames.introStringProperty,
    tandem: Tandem.ROOT.createTandem("introScreen"),
    backgroundColorProperty: TheRampColors.backgroundColorProperty,
  }),
  new MoreFeaturesScreen({
    preferences: rampPreferences,
    name: screenNames.moreFeaturesStringProperty,
    tandem: Tandem.ROOT.createTandem("moreFeaturesScreen"),
    backgroundColorProperty: TheRampColors.backgroundColorProperty,
  }),
];
```

```typescript
// src/intro/IntroScreen.ts
import { createIntroIcon } from "../common/TheRampScreenIcons.js";

optionize<IntroScreenOptions, EmptySelfOptions, ScreenOptions>()(
  {
    backgroundColorProperty: TheRampColors.backgroundColorProperty,
    createKeyboardHelpNode: () => new RampKeyboardHelpContent(),
    homeScreenIcon: createIntroIcon(),
  },
  options,
);
```

`MoreFeaturesScreen` uses `createMoreFeaturesIcon()` the same way. Neither
Screen currently sets `navigationBarIcon` (SceneryStack can fall back); other
fleet sims often set both icons to the same factory result.

---

## Home screen icons

### Fleet convention

```
src/common/TheRampScreenIcons.ts
```

| Screen | Factory |
|---|---|
| Introduction | `createIntroIcon()` |
| More Features | `createMoreFeaturesIcon()` |

Drawn on the PhET **548 × 373** canvas with `TheRampColors`.

---

## Screen options reference

| Option | Type | Purpose |
|---|---|---|
| `name` | `ReadOnlyProperty<string>` | Localizable tab label |
| `tandem` | `Tandem` | PhET-iO registration root |
| `backgroundColorProperty` | `TReadOnlyProperty<Color>` | Screen background |
| `createKeyboardHelpNode` | `() => Node` | Keyboard help |
| `homeScreenIcon` | `ScreenIcon` | Home-screen icon |
| `navigationBarIcon` | `ScreenIcon` | Nav-bar icon (optional here) |
| `preferences` | `TheRampPreferencesModel` | Shared Preferences |

---

## Strings and accessibility

Titles via `getScreenNames()`: `intro` (“Introduction”), `moreFeatures`
(“More Features”).

Shared keyboard help: `RampKeyboardHelpContent`. Screen summaries should
describe Intro’s simpler controls vs More Features’ plots / record-playback /
FBD tools.

---

## Adding another screen

1. Add a `screens` key in every locale; expose it from `getScreenNames()`.
2. Add `src/<name>/` with Screen, model (usually extending `RampModel`), and
   view (usually `RampScreenView` + feature flags).
3. Add `create…Icon()` to `TheRampScreenIcons.ts` and set `homeScreenIcon`
   (and preferably `navigationBarIcon`) in the Screen’s `optionize` defaults.
4. Register in `main.ts` with `preferences`, `name`, tandem, and background.
