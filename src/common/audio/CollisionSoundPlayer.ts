import type { Emitter, ReadOnlyProperty } from "scenerystack/axon";
import type { CollisionInfo } from "../model/RampPhysicsEngine.js";
import { SynthesizedSounds } from "./synthesizeSoundClip.js";

/** Plays tiered impact sounds on wall collisions (Java CollisionHandler). */
export class CollisionSoundPlayer {
  public constructor(collisionEmitter: Emitter<[CollisionInfo]>, enabledProperty: ReadOnlyProperty<boolean>) {
    const smash0 = SynthesizedSounds.impactSoft();
    const smash1 = SynthesizedSounds.impactMedium();
    const smash2 = SynthesizedSounds.impactHard();
    collisionEmitter.addListener((collision) => {
      if (!enabledProperty.value) {
        return;
      }
      const momentum = Math.abs(collision.momentumChange);
      if (momentum < 50) {
        // soft touch: silent
      } else if (momentum < 2000) {
        smash0.play();
      } else if (momentum < 4000) {
        smash1.play();
      } else {
        smash2.play();
      }
    });
  }
}
