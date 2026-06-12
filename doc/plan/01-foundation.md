# Phase 01 — Foundation: strings, colors, constants, assets

Goal: land every cross-cutting resource the later phases consume, with zero behavior change.
After this phase the sim looks identical to the scaffold but all strings/colors/constants/assets exist.

## 1. Strings

Replace the **entire contents** of `src/i18n/strings_en.json` with:

```json
{
  "title": "The Ramp",
  "screens": {
    "intro": "Introduction",
    "moreFeatures": "More Features"
  },
  "forces": {
    "applied": "Applied",
    "gravity": "Gravity",
    "normal": "Normal",
    "friction": "Friction",
    "wall": "Wall",
    "total": "Total",
    "parallelTitle": "Parallel Forces"
  },
  "forceSymbols": {
    "applied": "F<sub>A</sub>",
    "gravity": "F<sub>G</sub>",
    "normal": "F<sub>N</sub>",
    "friction": "F<sub>f</sub>",
    "wall": "F<sub>wall</sub>",
    "total": "F<sub>net</sub>"
  },
  "energy": {
    "title": "Energy",
    "kinetic": "Kinetic",
    "potential": "Potential",
    "thermal": "Thermal",
    "total": "Total"
  },
  "work": {
    "title": "Work",
    "applied": "Applied",
    "gravity": "Gravity",
    "friction": "Friction",
    "total": "Total"
  },
  "objects": {
    "fileCabinet": "File Cabinet",
    "refrigerator": "Refrigerator",
    "piano": "Piano",
    "crate": "Crate",
    "sleepyDog": "Sleepy Dog"
  },
  "controls": {
    "chooseObject": "Choose an Object",
    "frictionless": "Frictionless",
    "sound": "Sound",
    "reset": "Reset",
    "coolRamp": "Cool Ramp",
    "measuringTape": "Measuring Tape",
    "showZeroPointPe": "Show zero-point PE",
    "freeBodyDiagram": "Free Body Diagram",
    "forcesToShow": "Forces to Show",
    "coordinateFrames": "Coordinate Frames",
    "entireVectors": "Entire Vectors",
    "parallelComponents": "Parallel Components",
    "perpendicularComponents": "Perpendicular Components",
    "xComponents": "X-Components",
    "yComponents": "Y-Components",
    "frictionCoefficient": "Coefficient of Friction",
    "mass": "Mass",
    "position": "Object Position",
    "rampAngle": "Ramp Angle",
    "appliedForce": "Applied Force",
    "graphs": "Graphs",
    "forces": "Forces"
  },
  "timeControls": {
    "go": "Go!",
    "pause": "Pause",
    "clear": "Clear",
    "record": "Record",
    "playback": "Playback",
    "slowMotion": "Slow Motion",
    "rewind": "Rewind"
  },
  "units": {
    "newtons": "N",
    "joules": "J",
    "meters": "m",
    "kilograms": "kg",
    "degrees": "degrees",
    "metersPerSecond": "m/s",
    "seconds": "s"
  },
  "readouts": {
    "anglePattern": "Angle = {{value}}°",
    "heightPattern": "h = {{value}} m",
    "speedPattern": "{{value}} m/s",
    "timePattern": "{{value}} s",
    "massPattern": "{{name}} ({{mass}} kg)",
    "valueUnitsPattern": "{{value}} {{units}}",
    "zeroPointPe": "PE = 0"
  },
  "messages": {
    "confirmReset": "Are you sure you'd like to reset everything?",
    "confirmResetTitle": "Confirm Reset",
    "confirmClearGraphs": "Are you sure you'd like to clear the graphs?",
    "confirmClearTitle": "Confirm Clear",
    "overheated": "Overheated."
  }
}
```

Replace the **entire contents** of `src/i18n/strings_fr.json` with:

```json
{
  "title": "La rampe",
  "screens": {
    "intro": "Introduction",
    "moreFeatures": "Plus d'options"
  },
  "forces": {
    "applied": "Appliquée",
    "gravity": "Gravité",
    "normal": "Normale",
    "friction": "Frottement",
    "wall": "Mur",
    "total": "Totale",
    "parallelTitle": "Forces parallèles"
  },
  "forceSymbols": {
    "applied": "F<sub>A</sub>",
    "gravity": "F<sub>G</sub>",
    "normal": "F<sub>N</sub>",
    "friction": "F<sub>f</sub>",
    "wall": "F<sub>mur</sub>",
    "total": "F<sub>net</sub>"
  },
  "energy": {
    "title": "Énergie",
    "kinetic": "Cinétique",
    "potential": "Potentielle",
    "thermal": "Thermique",
    "total": "Totale"
  },
  "work": {
    "title": "Travail",
    "applied": "Appliqué",
    "gravity": "Gravité",
    "friction": "Frottement",
    "total": "Total"
  },
  "objects": {
    "fileCabinet": "Classeur",
    "refrigerator": "Réfrigérateur",
    "piano": "Piano",
    "crate": "Caisse",
    "sleepyDog": "Chien endormi"
  },
  "controls": {
    "chooseObject": "Choisir un objet",
    "frictionless": "Sans frottement",
    "sound": "Son",
    "reset": "Réinitialiser",
    "coolRamp": "Refroidir la rampe",
    "measuringTape": "Mètre ruban",
    "showZeroPointPe": "Afficher le zéro d'énergie potentielle",
    "freeBodyDiagram": "Diagramme des forces",
    "forcesToShow": "Forces à afficher",
    "coordinateFrames": "Repères",
    "entireVectors": "Vecteurs entiers",
    "parallelComponents": "Composantes parallèles",
    "perpendicularComponents": "Composantes perpendiculaires",
    "xComponents": "Composantes en X",
    "yComponents": "Composantes en Y",
    "frictionCoefficient": "Coefficient de frottement",
    "mass": "Masse",
    "position": "Position de l'objet",
    "rampAngle": "Angle de la rampe",
    "appliedForce": "Force appliquée",
    "graphs": "Graphiques",
    "forces": "Forces"
  },
  "timeControls": {
    "go": "Allez !",
    "pause": "Pause",
    "clear": "Effacer",
    "record": "Enregistrer",
    "playback": "Lecture",
    "slowMotion": "Ralenti",
    "rewind": "Rembobiner"
  },
  "units": {
    "newtons": "N",
    "joules": "J",
    "meters": "m",
    "kilograms": "kg",
    "degrees": "degrés",
    "metersPerSecond": "m/s",
    "seconds": "s"
  },
  "readouts": {
    "anglePattern": "Angle = {{value}}°",
    "heightPattern": "h = {{value}} m",
    "speedPattern": "{{value}} m/s",
    "timePattern": "{{value}} s",
    "massPattern": "{{name}} ({{mass}} kg)",
    "valueUnitsPattern": "{{value}} {{units}}",
    "zeroPointPe": "EP = 0"
  },
  "messages": {
    "confirmReset": "Voulez-vous vraiment tout réinitialiser ?",
    "confirmResetTitle": "Confirmer la réinitialisation",
    "confirmClearGraphs": "Voulez-vous vraiment effacer les graphiques ?",
    "confirmClearTitle": "Confirmer l'effacement",
    "overheated": "Surchauffe !"
  }
}
```

Replace the **entire contents** of `src/i18n/strings_es.json` with:

```json
{
  "title": "La Rampa",
  "screens": {
    "intro": "Introducción",
    "moreFeatures": "Más Detalles"
  },
  "forces": {
    "applied": "Aplicada",
    "gravity": "Gravedad",
    "normal": "Normal",
    "friction": "Fricción",
    "wall": "Pared",
    "total": "Total",
    "parallelTitle": "Fuerzas paralelas"
  },
  "forceSymbols": {
    "applied": "F<sub>A</sub>",
    "gravity": "F<sub>G</sub>",
    "normal": "F<sub>N</sub>",
    "friction": "F<sub>f</sub>",
    "wall": "F<sub>pared</sub>",
    "total": "F<sub>net</sub>"
  },
  "energy": {
    "title": "Energía",
    "kinetic": "Cinética",
    "potential": "Potencial",
    "thermal": "Térmica",
    "total": "Total"
  },
  "work": {
    "title": "Trabajo",
    "applied": "Aplicado",
    "gravity": "Gravedad",
    "friction": "Fricción",
    "total": "Total"
  },
  "objects": {
    "fileCabinet": "Archivador",
    "refrigerator": "Refrigerador",
    "piano": "Piano",
    "crate": "Caja",
    "sleepyDog": "Perro dormilón"
  },
  "controls": {
    "chooseObject": "Elegir un objeto",
    "frictionless": "Sin fricción",
    "sound": "Sonido",
    "reset": "Reiniciar",
    "coolRamp": "Enfriar la rampa",
    "measuringTape": "Cinta métrica",
    "showZeroPointPe": "Mostrar el cero de energía potencial",
    "freeBodyDiagram": "Diagrama de cuerpo libre",
    "forcesToShow": "Fuerzas a mostrar",
    "coordinateFrames": "Sistemas de referencia",
    "entireVectors": "Vectores completos",
    "parallelComponents": "Componentes paralelas",
    "perpendicularComponents": "Componentes perpendiculares",
    "xComponents": "Componentes en X",
    "yComponents": "Componentes en Y",
    "frictionCoefficient": "Coeficiente de fricción",
    "mass": "Masa",
    "position": "Posición del objeto",
    "rampAngle": "Ángulo de la rampa",
    "appliedForce": "Fuerza aplicada",
    "graphs": "Gráficas",
    "forces": "Fuerzas"
  },
  "timeControls": {
    "go": "¡Adelante!",
    "pause": "Pausa",
    "clear": "Borrar",
    "record": "Grabar",
    "playback": "Reproducir",
    "slowMotion": "Cámara lenta",
    "rewind": "Rebobinar"
  },
  "units": {
    "newtons": "N",
    "joules": "J",
    "meters": "m",
    "kilograms": "kg",
    "degrees": "grados",
    "metersPerSecond": "m/s",
    "seconds": "s"
  },
  "readouts": {
    "anglePattern": "Ángulo = {{value}}°",
    "heightPattern": "h = {{value}} m",
    "speedPattern": "{{value}} m/s",
    "timePattern": "{{value}} s",
    "massPattern": "{{name}} ({{mass}} kg)",
    "valueUnitsPattern": "{{value}} {{units}}",
    "zeroPointPe": "EP = 0"
  },
  "messages": {
    "confirmReset": "¿Seguro que quieres reiniciar todo?",
    "confirmResetTitle": "Confirmar reinicio",
    "confirmClearGraphs": "¿Seguro que quieres borrar las gráficas?",
    "confirmClearTitle": "Confirmar borrado",
    "overheated": "¡Sobrecalentado!"
  }
}
```

Notes:
- `forceSymbols` values use scenery `RichText` markup (`<sub>…</sub>`); render them with
  `RichText`, never `Text`.
- `*Pattern` keys are for `PatternStringProperty` (from `scenerystack/axon`) with
  `{{placeholder}}` syntax.

### StringManager additions

In `src/i18n/StringManager.ts`, keep everything that exists and add one getter per group.
Each getter returns the corresponding sub-object of `stringProperties` directly — the
nesting produced by `LocalizedString.getNestedStringProperties` appends `StringProperty`
to each leaf key (e.g. `stringProperties.forces.appliedStringProperty`). Pattern
(repeat for every group: `forces`, `forceSymbols`, `energy`, `work`, `objects`,
`controls`, `timeControls`, `units`, `readouts`, `messages`):

```ts
public getForceStrings(): typeof stringProperties.forces {
  return stringProperties.forces;
}

public getForceSymbolStrings(): typeof stringProperties.forceSymbols {
  return stringProperties.forceSymbols;
}

public getEnergyStrings(): typeof stringProperties.energy {
  return stringProperties.energy;
}

public getWorkStrings(): typeof stringProperties.work {
  return stringProperties.work;
}

public getObjectStrings(): typeof stringProperties.objects {
  return stringProperties.objects;
}

public getControlStrings(): typeof stringProperties.controls {
  return stringProperties.controls;
}

public getTimeControlStrings(): typeof stringProperties.timeControls {
  return stringProperties.timeControls;
}

public getUnitStrings(): typeof stringProperties.units {
  return stringProperties.units;
}

public getReadoutStrings(): typeof stringProperties.readouts {
  return stringProperties.readouts;
}

public getMessageStrings(): typeof stringProperties.messages {
  return stringProperties.messages;
}
```

(`typeof stringProperties.xxx` keeps the return types fully inferred; no manual interfaces.)

## 2. Colors

In `src/RampColors.ts`, keep the existing five properties and add the following entries to
the `RampColors` object (same `ProfileColorProperty(RampNamespace, "name", {...})` pattern;
JSDoc each one briefly). Names and values are exact; the force/energy/work hexes come from
Java's `RampLookAndFeel`:

| Property name | namespace key | default | projector |
|---|---|---|---|
| `appliedForceColorProperty` | `appliedForce` | `#EC9937` | `#C97A1B` |
| `gravityForceColorProperty` | `gravityForce` | `#3282D7` | `#1F66B5` |
| `normalForceColorProperty` | `normalForce` | `#FF00FF` | `#C400C4` |
| `frictionForceColorProperty` | `frictionForce` | `#FF0000` | `#D40000` |
| `wallForceColorProperty` | `wallForce` | `#BEBE00` | `#8F8F00` |
| `totalForceColorProperty` | `totalForce` | `#00CC1A` | `#009913` |
| `kineticEnergyColorProperty` | `kineticEnergy` | `#00CC1A` | `#009913` |
| `potentialEnergyColorProperty` | `potentialEnergy` | `#3282D7` | `#1F66B5` |
| `thermalEnergyColorProperty` | `thermalEnergy` | `#FF0000` | `#D40000` |
| `totalEnergyColorProperty` | `totalEnergy` | `#EC9937` | `#C97A1B` |
| `appliedWorkColorProperty` | `appliedWork` | `#EC9937` | `#C97A1B` |
| `gravityWorkColorProperty` | `gravityWork` | `#3282D7` | `#1F66B5` |
| `frictionWorkColorProperty` | `frictionWork` | `#FF0000` | `#D40000` |
| `totalWorkColorProperty` | `totalWork` | `#00CC1A` | `#009913` |
| `skyColorProperty` | `sky` | `#A5DCFC` | `#D6EEFF` |
| `earthColorProperty` | `earth` | `#96C88C` | `#96C88C` |
| `rampSurfaceColorProperty` | `rampSurface` | `#C68642` | `#B5793A` |
| `rampSurfaceHotColorProperty` | `rampSurfaceHot` | `#FF3300` | `#FF3300` |
| `barrierColorProperty` | `barrier` | `#AA4A3C` | `#995040` |
| `chartBackgroundColorProperty` | `chartBackground` | `#FFFFFF` | `#FFFFFF` |
| `chartGridColorProperty` | `chartGrid` | `#CCCCCC` | `#AAAAAA` |
| `readoutTextColorProperty` | `readoutText` | `#1A1A1A` | `#1A1A1A` |

(Work/energy colors deliberately duplicate force hexes — keep them as separate properties
so they can diverge later, mirroring Java's `RampLookAndFeel` aliasing.)

## 3. Constants files

Create `src/common/model/RampPhysicsConstants.ts` — **zero imports** (this file is consumed
by the Node-run physics checks; it must never import scenerystack):

```ts
/**
 * RampPhysicsConstants.ts
 *
 * Numeric constants for the ramp physics. ZERO imports — this module is shared
 * by the pure physics engine and runs under Node in scripts/physics-check.ts.
 */

/** Gravitational acceleration, m/s^2 */
export const GRAVITY = 9.8;

/** Length of the inclined ramp, m */
export const RAMP_LENGTH = 15.0;

/** Length of the flat ground segment to the left of the ramp, m */
export const GROUND_LENGTH = 6.0;

/** x-coordinate of the left end of the ground; the ramp is hinged at the origin */
export const GROUND_ORIGIN_X = -6.0;

/** Ramp angle after reset, radians (10 degrees) */
export const INITIAL_RAMP_ANGLE = (10 * Math.PI) / 180;

/** Block position along the ramp after reset, m (global position 16) */
export const INITIAL_POSITION_IN_SURFACE = 10.0;

/** Upper clamp on a single integration step, s */
export const MAX_DT = 0.2;

/** Maximum record/playback duration, s */
export const MAX_RECORDING_TIME = 30;

/** Thermal energy at which the "Overheated." indicator appears, J */
export const OVERHEAT_THERMAL_ENERGY = 50000;
```

Create `src/common/RampConstants.ts` (view-layer constants; dot imports allowed):

```ts
/**
 * RampConstants.ts
 *
 * View-layer constants for The Ramp. Physics constants live in
 * common/model/RampPhysicsConstants.ts (zero-import file) and are re-exported
 * here for convenience.
 */
import { Range, Vector2 } from "scenerystack/dot";

export * from "./model/RampPhysicsConstants.js";

/** Ramp angle control range, radians */
export const ANGLE_RANGE = new Range(0, Math.PI / 2);

/** Global block position range, m (0 = ground left wall, 21 = ramp top) */
export const POSITION_RANGE = new Range(0, 21);

/** Applied force control range, N */
export const APPLIED_FORCE_RANGE = new Range(-1000, 1000);

/** Coefficient-of-friction slider range (sets both mu_s and mu_k) */
export const FRICTION_RANGE = new Range(0.1, 1.5);

/** Mass slider range, kg (More Features screen) */
export const MASS_RANGE = new Range(100, 500);

/** Model-view scale, view px per model meter */
export const MODEL_VIEW_SCALE = 26;

/** View position of the model origin (the ramp hinge / base) */
export const WORLD_VIEW_ORIGIN = new Vector2(200, 390);

/** World force-arrow scale, px per N */
export const FORCE_ARROW_SCALE = 0.06;

/** Free-body-diagram force scale, px per N */
export const FBD_FORCE_SCALE = 1 / 20;

/** Free-body-diagram panel size, px */
export const FBD_SIZE = 200;

/** Block drag: applied newtons per pixel of horizontal drag */
export const APPLIED_FORCE_PER_PIXEL = 1 / 1.2;

/** FBD drag: applied newtons per pixel of horizontal drag */
export const FBD_FORCE_PER_PIXEL = 20;

/** Bar chart scale, px per J */
export const ENERGY_BAR_SCALE = 0.005;

/** Y range of the energy and work time plots, J */
export const PLOT_ENERGY_RANGE = new Range(-30000, 30000);

/** Y range of the parallel-forces time plot, N */
export const PLOT_FORCE_RANGE = new Range(-1000, 1000);

/** Margin between screen-view edge and content, px */
export const SCREEN_VIEW_MARGIN = 10;
```

## 4. Assets

Copy these files (exact commands, run from the repo root):

```bash
mkdir -p src/assets/images src/assets/audio
JAVA_DATA=~/svn/trunk/simulations-java/simulations/the-ramp/data/the-ramp
cp "$JAVA_DATA/images/cabinet.gif"     src/assets/images/
cp "$JAVA_DATA/images/fridge.gif"      src/assets/images/
cp "$JAVA_DATA/images/piano.png"       src/assets/images/
cp "$JAVA_DATA/images/crate.gif"       src/assets/images/
cp "$JAVA_DATA/images/ollie.gif"       src/assets/images/
cp "$JAVA_DATA/images/skateboard.png"  src/assets/images/
cp "$JAVA_DATA/audio/smash0.wav"       src/assets/audio/
cp "$JAVA_DATA/audio/smash1.wav"       src/assets/audio/
cp "$JAVA_DATA/audio/smash2.wav"       src/assets/audio/
cp "$JAVA_DATA/audio/slapooh.wav"      src/assets/audio/
```

Also copy the license files (both exist — verified):

```bash
cp "$JAVA_DATA/images/license.txt" src/assets/images/license.txt
cp "$JAVA_DATA/audio/license.txt"  src/assets/audio/license.txt
```

Create `src/assets/images.ts`:

```ts
/**
 * images.ts
 *
 * Central map from image keys to bundled asset URLs. RampObjectDescription
 * (a zero-import model file) refers to images by key; views resolve keys here.
 */
import cabinetUrl from "./images/cabinet.gif";
import crateUrl from "./images/crate.gif";
import fridgeUrl from "./images/fridge.gif";
import ollieUrl from "./images/ollie.gif";
import pianoUrl from "./images/piano.png";
import skateboardUrl from "./images/skateboard.png";

export const RampImages = {
  cabinet: cabinetUrl,
  fridge: fridgeUrl,
  piano: pianoUrl,
  crate: crateUrl,
  ollie: ollieUrl,
  skateboard: skateboardUrl,
} as const;

export type RampImageKey = keyof typeof RampImages;
```

And `src/assets/audio.ts`:

```ts
/**
 * audio.ts — bundled audio asset URLs.
 */
import slapoohUrl from "./audio/slapooh.wav";
import smash0Url from "./audio/smash0.wav";
import smash1Url from "./audio/smash1.wav";
import smash2Url from "./audio/smash2.wav";

export const RampAudio = {
  smash0: smash0Url,
  smash1: smash1Url,
  smash2: smash2Url,
  slapooh: slapoohUrl,
} as const;
```

## Acceptance criteria

1. `npm run check && npm run lint && npm run build` pass.
2. `npm run dev`: sim boots; switching locale in Preferences → Language between
   English/Français/Español still updates the title and screen names.
3. `git status` shows the 10 asset files + `images.ts` + `audio.ts` (and license/README).
4. No view file imports the new colors/strings yet — that's fine; Biome must not flag
   unused exports (exports are exempt from `noUnusedLocals`).
