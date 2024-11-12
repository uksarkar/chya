import { describe, expect, it } from "vitest";
import { createEffect, createSignal } from "../../src/chya";

describe("createEffect", () => {
  it("should run an effect when signal changes", () => {
    const [count, setCount] = createSignal(0);
    let effectedValue: number | null = null;

    createEffect(() => {
      effectedValue = count();
    });

    setCount(1);
    expect(effectedValue).toBe(1);
    expect(effectedValue).toBe(count());
  });
});
