/**
 * images.ts
 *
 * Central map from image keys to bundled asset URLs. RampObjectDescription
 * (a zero-import model file) refers to images by key; views resolve keys here.
 */
import cabinetUrl from "./images/cabinet.svg";
import crateUrl from "./images/crate.svg";
import fridgeUrl from "./images/fridge.svg";
import ollieUrl from "./images/ollie.svg";
import pianoUrl from "./images/piano.svg";
import skateboardUrl from "./images/skateboard.svg";

export const RampImages = {
  cabinet: cabinetUrl,
  fridge: fridgeUrl,
  piano: pianoUrl,
  crate: crateUrl,
  ollie: ollieUrl,
  skateboard: skateboardUrl,
} as const;

export type RampImageKey = keyof typeof RampImages;
