// @ts-ignore
import { createSignal, createComponent } from "@chya/core";

export const TestForm = () => {
  const [text, setText] = createSignal("");

  return (
    <div>
      <div>
        <input c-bind={[text, setText]} c-event="change" />
      </div>
      <div>{`${text()}`}</div>
      <button
        class={`some ${text().length > 10 ? "bigger" : "smaller"}`}
        on:click={() => setText(`New text: ${crypto.randomUUID()}`)}
      >
        Set text
      </button>
    </div>
  );
};
