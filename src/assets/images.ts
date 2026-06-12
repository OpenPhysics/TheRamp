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
