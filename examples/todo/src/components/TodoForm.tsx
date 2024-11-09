// @ts-ignore
import { createSignal, createComponent } from "@chya/core";
import { addTodo } from "../stores/todo-store";

export const TodoForm = () => {
  const [text, setText] = createSignal("");

  return (
    <>
      <div class="group">
        <input
          type="text"
          c-bind={[text, setText]}
          placeholder="Add a new task"
        />
        <button
          class="btn-success"
          on:click={() =>
            text().length > 4 && addTodo({ done: false, title: text() })
          }
        >
          Add
        </button>
      </div>
      <p>
        {text()
          ? text()
          : "Type your task and press Enter to add it to the list"}
      </p>
      {text().length < 4 && (
        <div class="feedback">Todo name should be at least 4 char</div>
      )}
    </>
  );
};
