import { describe, expect, it } from "vitest";
import { createSignal } from "../../src/chya";

describe("createSignal", () => {
  it("should create a signal with an initial value", () => {
    const [count] = createSignal(0);
    expect(count()).toBe(0); // The initial value should be 0
  });

  it("should update the signal value when set", () => {
    const [count, setCount] = createSignal(0);
    setCount(5);
    expect(count()).toBe(5);
  });
});
