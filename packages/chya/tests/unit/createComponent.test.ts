import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/chya";

describe("createComponent", () => {
  it("should create a component with a given tag", () => {
    const component = createComponent("div");
    expect(component.tagName).toBe("DIV");
  });

  it("should apply attributes correctly", () => {
    const component = createComponent("div", { id: "test-id" });
    expect(component.id).toBe("test-id");
  });
});
