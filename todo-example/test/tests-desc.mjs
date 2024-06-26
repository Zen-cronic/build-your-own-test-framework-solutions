
import { it } from "desc-plot";
import { emptyTodo, markAsDone } from "../src/todo.mjs";
import { TodoRepository } from "../src/todoRepository.mjs";

const mockThrow = () => {throw new Error("Jello, Error")}

it("should set completedAt when calling markAsDone", () => {

  mockThrow()
  const todo = emptyTodo();

  if (!markAsDone(todo).completedAt)
    throw new Error(
      "completedAt not set when calling markAsDone"
    );
});

it("should throw an exception when adding a todo without a title", () => {
  mockThrow()
  const repository = new TodoRepository();

  try {
    repository.add(emptyTodo());
    throw new Error(
      "no error thrown when adding an empty todo"
    );
  } catch (e) {
    if (e.message !== "title cannot be blank")
      throw new Error(
        "wrong message in guard clause when adding an empty todo"
      );
  }
});

it("should throw errors when adding a repeated todo", () => {
  const repository = new TodoRepository(); // global

  const newTodo = { ...emptyTodo(), title: "test" };
  repository.add(newTodo);

  const repeatedTodo = { ...newTodo };
  try {
    repository.add(repeatedTodo);
    throw new Error(
      "no error thrown when adding a repeated todo"
    );
  } catch (e) {
    if (e.message !== "todo already exists")
      throw new Error(
        "wrong message in guard clause when adding an existing todo"
      );
  }
});

it("should find an added todo", () => {
  const repository = new TodoRepository();
  const newTodo = { ...emptyTodo(), title: "test" };
  repository.add(newTodo);

  if (repository.findAllMatching("").length !== 1)
    throw new Error("added todo was not returned");
});

it("should filter out todos that do not match filter", () => {
  const repository = new TodoRepository();
  const newTodo = { ...emptyTodo(), title: "test" };
  repository.add(newTodo);
  if (
    repository.findAllMatching("some other test")
      .length !== 0
  )
    throw new Error(
      "filter was not applied when finding matches"
    );
});
