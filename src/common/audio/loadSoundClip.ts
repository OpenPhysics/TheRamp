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
  let unlocked = false;
  const safeUnlock = () => {
    if (!unlocked) {
      unlock();
      unlocked = true;
    }
  };

  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => phetAudioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      wrappedAudioBuffer.audioBufferProperty.set(audioBuffer);
      safeUnlock();
    })
    .catch(() => {
      // Silent stub so SoundClip always has a valid buffer and the sim still launches.
      wrappedAudioBuffer.audioBufferProperty.set(phetAudioContext.createBuffer(1, 1, phetAudioContext.sampleRate));
      safeUnlock();
    });
  const soundClip = new SoundClip(wrappedAudioBuffer);
  soundManager.addSoundGenerator(soundClip);
  return soundClip;
}
