import { Header } from "./components/Header";
import { TodoForm } from "./components/TodoForm";
import { TodoItem } from "./components/TodoItem";
import { getTodoItems } from "./stores/todo-store";

export const App = () => {
  return (
    <div class="container">
      <Header />
      <section>
        <TodoForm />
        <hr />

        <ul class="todos" id="todoList">
          {getTodoItems().map(todo => (
            <TodoItem todo={todo} />
          ))}
        </ul>
      </section>
    </div>
  );
};
