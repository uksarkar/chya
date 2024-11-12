import { describe, expect, it, beforeEach } from "vitest";
import {
  conditionalComponent,
  createComponent,
  createSignal
} from "../../src/chya";
import { ChyaElementConditionStrategy } from "../../src/enums/ChyaElementConditionStrategy";

describe("conditionalComponent", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = createComponent("div", { class: "container" });
  });

  it("should render component based on condition", () => {
    const [show, setShow] = createSignal(true);

    const component = conditionalComponent(
      "div",
      { class: ["test-class"] },
      show,
      ChyaElementConditionStrategy.Remove
    );

    container.appendChild(component);

    const cmp = () => container.firstChild;

    expect(cmp()?.nodeName).toBe("DIV");

    setShow(false);
    expect(cmp()?.nodeType).toBe(Node.COMMENT_NODE);
  });
});
