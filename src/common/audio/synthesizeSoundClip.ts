/**
 * synthesizeSoundClip.ts
 *
 * Creates SoundClips using Web Audio synthesis rather than external WAV files.
 * All sounds are generated procedurally from phetAudioContext and registered
 * with soundManager so they respect the global sound-enabled toggle.
 */
import { phetAudioContext, SoundClip, soundManager, WrappedAudioBuffer } from "scenerystack/tambo";

function makeSoundClip(buffer: AudioBuffer): SoundClip {
  const wrapped = new WrappedAudioBuffer();
  wrapped.audioBufferProperty.set(buffer);
  const clip = new SoundClip(wrapped);
  soundManager.addSoundGenerator(clip);
  return clip;
}

/**
 * A short percussive impact thud.
 * level 0 = soft tap, 1 = medium thud, 2 = heavy crash
 */
type ImpactParams = { duration: number; freq: number; decay: number; noiseRatio: number; amp: number };
const IMPACT_PARAMS: readonly [ImpactParams, ImpactParams, ImpactParams] = [
  { duration: 0.18, freq: 180, decay: 28, noiseRatio: 0.35, amp: 0.55 },
  { duration: 0.28, freq: 110, decay: 16, noiseRatio: 0.5, amp: 0.75 },
  { duration: 0.42, freq: 70, decay: 9, noiseRatio: 0.65, amp: 0.9 },
];

function createImpactBuffer(level: 0 | 1 | 2): AudioBuffer {
  const sampleRate = phetAudioContext.sampleRate;
  const { duration, freq, decay, noiseRatio, amp } = IMPACT_PARAMS[level];
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = phetAudioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Seed the pseudo-random sequence so synthesis is deterministic
  let seed = 12345 + level * 7919;
  const rand = (): number => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return ((seed >>> 0) / 0xffffffff) * 2 - 1;
  };

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * decay);
    const tone = Math.sin(2 * Math.PI * freq * t) + 0.4 * Math.sin(2 * Math.PI * freq * 0.5 * t);
    const noise = rand();
    data[i] = amp * env * ((1 - noiseRatio) * tone * 0.65 + noiseRatio * noise);
  }

  return buffer;
}

/**
 * A bright ascending chime (C major arpeggio: C5–E5–G5) with bell-like harmonics.
 * Used as the "energy milestone" / cool sound.
 */
function createChimeBuffer(): AudioBuffer {
  const sampleRate = phetAudioContext.sampleRate;
  const duration = 1.1;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = phetAudioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  const notes = [
    { freq: 523.25, onset: 0.0 },
    { freq: 659.25, onset: 0.07 },
    { freq: 783.99, onset: 0.14 },
  ];

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (const { freq, onset } of notes) {
      const dt = t - onset;
      if (dt <= 0) {
        continue;
      }
      const env = Math.exp(-dt * 5) * (1 - Math.exp(-dt * 80));
      sample +=
        env *
        (Math.sin(2 * Math.PI * freq * dt) +
          0.3 * Math.sin(2 * Math.PI * freq * 2 * dt) +
          0.12 * Math.sin(2 * Math.PI * freq * 3 * dt));
    }
    data[i] = (sample / notes.length) * 0.55;
  }

  return buffer;
}

export const SynthesizedSounds = {
  impactSoft: (): SoundClip => makeSoundClip(createImpactBuffer(0)),
  impactMedium: (): SoundClip => makeSoundClip(createImpactBuffer(1)),
  impactHard: (): SoundClip => makeSoundClip(createImpactBuffer(2)),
  chime: (): SoundClip => makeSoundClip(createChimeBuffer()),
};
