/**
 * loadSoundClip.ts
 *
 * Loads a bundled audio asset URL into a tambo SoundClip. Mirrors the loading
 * pattern of tambo's own generated sound modules: WrappedAudioBuffer +
 * decodeAudioData, with an asyncLoader lock so the sim waits for decoding.
 */
import { asyncLoader } from "scenerystack/phet-core";
import { phetAudioContext, SoundClip, soundManager, WrappedAudioBuffer } from "scenerystack/tambo";

export function loadSoundClip(url: string): SoundClip {
  const wrappedAudioBuffer = new WrappedAudioBuffer();
  const unlock = asyncLoader.createLock(url);
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => phetAudioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      wrappedAudioBuffer.audioBufferProperty.set(audioBuffer);
      unlock();
    })
    .catch(() => {
      unlock(); // sim must still launch if audio fails to decode
    });
  const soundClip = new SoundClip(wrappedAudioBuffer);
  soundManager.addSoundGenerator(soundClip);
  return soundClip;
}
