/**
 * Fleet-standard memory-leak regression suite.
 * RampPhysicsEngine state objects are plain data — GC after stepPhysics cycles.
 */

import { describe, expect, it } from "vitest";
import { createInitialState, stepPhysics } from "../src/common/model/RampPhysicsEngine.js";

async function forceGC(earlyExitRef?: WeakRef<object>): Promise<void> {
  for (let i = 0; i < 15; i++) {
    globalThis.gc?.();
    await new Promise<void>((r) => setTimeout(r, 50));
    if (earlyExitRef !== undefined && earlyExitRef.deref() === undefined) {
      return;
    }
    if (earlyExitRef !== undefined) {
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }
}

function createAndDropState(): WeakRef<object> {
  let state = createInitialState();
  const { state: next } = stepPhysics(state, state, 0.05);
  state = next;
  return new WeakRef<object>(state);
}

describe("Memory leak regression", () => {
  it("global.gc is available (--expose-gc)", () => {
    expect(globalThis.gc).toBeDefined();
  });

  it("sanity: plain object is collected", async () => {
    const ref = (() => new WeakRef({ hello: "world" }))();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("RampPhysicsState is collected after drop", async () => {
    const ref = createAndDropState();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("repeated create/drop cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDropState());
    }
    await forceGC();
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
  });
});
