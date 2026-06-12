/**
 * TimeSeriesModel.ts
 *
 * Record/playback buffer for simulation state snapshots.
 */
import { BooleanProperty, Emitter, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { MAX_RECORDING_TIME } from "./RampPhysicsConstants.js";
import type { RampPhysicsState } from "./RampPhysicsEngine.js";

export type TimeSeriesMode = "record" | "playback";

/** What TimeSeriesModel needs from the physics owner (implemented by RampModel). */
export interface TimeSeriesClient {
  advancePhysics(dt: number): void;
  getStateSnapshot(): RampPhysicsState;
  setStateSnapshot(state: RampPhysicsState): void;
  setupForcesOnly(): void;
}

export class TimeSeriesModel {
  public readonly modeProperty = new StringUnionProperty<TimeSeriesMode>("record", {
    validValues: ["record", "playback"],
  });

  public readonly isPlayingProperty = new BooleanProperty(false);

  public readonly playbackSpeedProperty = new NumberProperty(1);

  public readonly recordTimeProperty = new NumberProperty(0);

  public readonly playbackTimeProperty = new NumberProperty(0);

  public readonly dataPointAddedEmitter = new Emitter<[number, RampPhysicsState]>({
    parameters: [{ valueType: "number" }, { valueType: Object }],
  });

  public readonly clearedEmitter = new Emitter();

  private readonly states: Array<{ time: number; state: RampPhysicsState }> = [];

  private readonly client: TimeSeriesClient;

  public constructor(client: TimeSeriesClient) {
    this.client = client;
  }

  public step(dt: number): void {
    if (!this.isPlayingProperty.value) {
      this.client.setupForcesOnly();
      return;
    }

    if (this.modeProperty.value === "record") {
      if (this.recordTimeProperty.value >= MAX_RECORDING_TIME) {
        this.isPlayingProperty.value = false;
        return;
      }
      this.client.advancePhysics(dt);
      this.recordTimeProperty.value += dt;
      const recordTime = this.recordTimeProperty.value;
      const snapshot = this.client.getStateSnapshot();
      this.states.push({ time: recordTime, state: snapshot });
      this.dataPointAddedEmitter.emit(recordTime, snapshot);
    } else {
      const recordTime = this.recordTimeProperty.value;
      const playbackSpeed = this.playbackSpeedProperty.value;
      const playbackTime = this.playbackTimeProperty.value;
      this.playbackTimeProperty.value = Math.min(playbackTime + dt * playbackSpeed, recordTime);
      this.applyPlaybackState();
      if (this.playbackTimeProperty.value >= recordTime) {
        this.isPlayingProperty.value = false;
      }
    }
  }

  private applyPlaybackState(): void {
    const t = this.playbackTimeProperty.value;
    if (this.states.length === 0) {
      return;
    }

    let lo = 0;
    let hi = this.states.length - 1;
    let result = -1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const entry = this.states[mid];
      if (entry && entry.time <= t) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    if (result >= 0) {
      const entry = this.states[result];
      if (entry) {
        this.client.setStateSnapshot(entry.state);
      }
    }
  }

  public setPlaybackTime(t: number): void {
    const clamped = Math.max(0, Math.min(t, this.recordTimeProperty.value));
    this.modeProperty.value = "playback";
    this.isPlayingProperty.value = false;
    this.playbackTimeProperty.value = clamped;
    this.applyPlaybackState();
  }

  public record(): void {
    if (this.modeProperty.value === "playback") {
      const playbackTime = this.playbackTimeProperty.value;
      while (this.states.length > 0) {
        const last = this.states[this.states.length - 1];
        if (last && last.time > playbackTime) {
          this.states.pop();
        } else {
          break;
        }
      }
      this.recordTimeProperty.value = playbackTime;
    }
    this.modeProperty.value = "record";
    this.isPlayingProperty.value = true;
  }

  public playback(): void {
    if (this.playbackTimeProperty.value >= this.recordTimeProperty.value) {
      this.playbackTimeProperty.value = 0;
    }
    this.modeProperty.value = "playback";
    this.isPlayingProperty.value = true;
  }

  public rewind(): void {
    this.playbackTimeProperty.value = 0;
    this.modeProperty.value = "playback";
    this.isPlayingProperty.value = false;
    this.applyPlaybackState();
  }

  public ensureRecordMode(): void {
    if (this.modeProperty.value === "playback") {
      this.record();
    }
    this.isPlayingProperty.value = true;
  }

  public clear(): void {
    this.isPlayingProperty.value = false;
    this.modeProperty.value = "record";
    this.recordTimeProperty.value = 0;
    this.playbackTimeProperty.value = 0;
    this.states.length = 0;
    this.clearedEmitter.emit();
  }

  public reset(): void {
    this.clear();
    this.playbackSpeedProperty.reset();
  }
}
