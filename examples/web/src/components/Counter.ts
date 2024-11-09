import { createComponent, createSignal, textComponent } from "@chya/core";

export const Counter = () => {
  const [count, setCount] = createSignal(0);

  return createComponent(
    "div",
    null,
    "Count is: ",
    textComponent(() => `${count()}`),
    createComponent(
      "button",
      { "on:click": () => setCount(count() + 1) },
      "Increment"
    )
  );
};
