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
