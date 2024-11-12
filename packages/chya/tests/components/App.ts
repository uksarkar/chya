import {
  conditionalComponent,
  createComponent,
  createSignal,
  inputComponent,
  textComponent
} from "../../src/chya";
import { ChyaElementConditionStrategy } from "../../src/enums/ChyaElementConditionStrategy";

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
      { bindings: [cls, setCls], class: ["conditional", text] },
      () => !!text().length && text().length % 3 === 0,
      ChyaElementConditionStrategy.Remove
    )
  );
};
