import { removeTodo, updateTodo } from "../stores/todo-store";
import { Todo } from "../types";

export const TodoItem = ({ todo }: { todo: Todo }) => {
  return (
    <li class={`todo ${todo.done ? "completed" : ""}`}>
      <span class={`status ${todo.done ? "danger" : "success"}`}>
        {todo.done ? "✔" : "✘"}
      </span>
      <span class="name">{todo.title}</span>
      <div class="actions">
        {!todo.done && (
          <button
            on:click={() => updateTodo(todo.id, "done", true)}
            class="done"
          >
            DONE
          </button>
        )}
        <button class="remove" on:click={() => removeTodo(todo.id)}>
          REMOVE
        </button>
      </div>
    </li>
  );
};
