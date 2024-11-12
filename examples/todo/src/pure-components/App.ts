import {
  ChyaElementConditionStrategy,
  conditionalComponent,
  createComponent,
  createSignal,
  inputComponent,
  textComponent
} from "@chya/core";

export const App = () => {
  const [text, setText] = createSignal("");
  const [cls, setCls] = createSignal("start");

  return createComponent(
    "div",
    undefined,
    textComponent(text),
    createComponent("br"),
    inputComponent("input", [text, setText], "input", {
      placeholder: "Type your name",
      class: ["hello", text]
    }),
    conditionalComponent(
      "input",
      { bindings: [cls, setCls], class: ["hello", text] },
      () => text().length % 3 === 0,
      ChyaElementConditionStrategy.Remove
    )
  );
};
