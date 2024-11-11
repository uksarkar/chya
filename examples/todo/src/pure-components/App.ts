import {
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
      placeholder: "Type your name"
    }),
    conditionalComponent(
      {
        tag: "input",
        attr: { placeholder: "Conditional", "data-cls": cls },
        bindings: [cls, setCls]
      },
      () => text().length % 3 === 0,
      1
    )
  );
};
