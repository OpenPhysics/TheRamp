/**
 * RampObjectDescription.ts
 *
 * The five selectable objects, with Java's exact values (RampModule.java).
 * ZERO imports — images are referenced by key and resolved in src/assets/images.ts;
 * names are referenced by key and resolved via StringManager.getObjectStrings().
 */
export interface RampObjectDescription {
  readonly nameKey: "fileCabinet" | "refrigerator" | "piano" | "crate" | "sleepyDog";
  readonly imageKey: "cabinet" | "fridge" | "piano" | "crate" | "ollie";
  readonly mass: number; // kg
  readonly staticFriction: number;
  readonly kineticFriction: number;
  readonly viewScale: number; // image scale factor in the world view
  readonly yOffset: number; // px the image is shifted down to sit on the surface
}

export const RAMP_OBJECTS: readonly RampObjectDescription[] = [
  {
    nameKey: "fileCabinet",
    imageKey: "cabinet",
    mass: 100,
    staticFriction: 0.3,
    kineticFriction: 0.3,
    viewScale: 0.4,
    yOffset: 0,
  },
  {
    nameKey: "refrigerator",
    imageKey: "fridge",
    mass: 175,
    staticFriction: 0.5,
    kineticFriction: 0.5,
    viewScale: 0.4,
    yOffset: 0,
  },
  {
    nameKey: "piano",
    imageKey: "piano",
    mass: 225,
    staticFriction: 0.4,
    kineticFriction: 0.4,
    viewScale: 0.6,
    yOffset: 20,
  },
  {
    nameKey: "crate",
    imageKey: "crate",
    mass: 300,
    staticFriction: 0.7,
    kineticFriction: 0.7,
    viewScale: 0.3,
    yOffset: 0,
  },
  {
    nameKey: "sleepyDog",
    imageKey: "ollie",
    mass: 15,
    staticFriction: 0.1,
    kineticFriction: 0.1,
    viewScale: 0.3,
    yOffset: 5,
  },
];
