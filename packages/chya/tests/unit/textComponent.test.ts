import { describe, expect, it } from "vitest";
import { textComponent } from "../../src/chya";

describe("textComponent", () => {
  it("should create a text node with the correct text content", () => {
    const textNode = textComponent(() => "Hello, world!");
    expect(textNode.textContent).toBe("Hello, world!");
  });
});
