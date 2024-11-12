import { describe, it, expect } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { App } from "./components/App";

describe("App Component", () => {
  it("renders correctly and reacts to input changes", () => {
    // Render the component
    const container = App();

    // Select the input and conditional elements
    const inputElement = container.querySelector(
      "input[placeholder='Type your name']"
    );
    const conditionalInput = () => container.querySelector("input.conditional");

    // Initial checks
    expect(inputElement).toBeTruthy(); // Input element should exist
    expect(conditionalInput()).toBeFalsy(); // Conditional input should not be rendered initially

    // Type into the input field to check reactivity
    fireEvent.input(inputElement!, { target: { value: "Jo" } });
    expect(inputElement!.className).toContain("Jo"); // The class should update with the text

    // Test the conditional component: length % 3 === 0
    fireEvent.input(inputElement!, { target: { value: "Jon" } });
    expect(conditionalInput()).toBeTruthy(); // Conditional input should now appear

    fireEvent.input(inputElement!, { target: { value: "Jonas" } });
    expect(conditionalInput()).toBeFalsy();
  });
});
