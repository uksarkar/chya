import { describe, expect, it } from "vitest";
import { createSignal, inputComponent } from "../../src/chya";
import { fireEvent } from "@testing-library/dom";

describe("inputComponent", () => {
  it("should create an input element with the correct type", () => {
    const input = inputComponent("input", undefined, "input", { type: "text" });
    expect(input.type).toBe("text");
  });

  it("should handle value binding correctly", () => {
    const [value, setValue] = createSignal("");
    const input = inputComponent("input", [value, setValue], "input", {});

    // Simulate user input
    setValue("new value");
    expect(value()).toBe("new value");
    expect(input.value).toBe(value());

    // test reactivity
    fireEvent.input(input, { target: { value: "HELLO WORLD" } });

    expect(value()).toBe("HELLO WORLD");
    expect(input.value).toBe(value());
  });
});
