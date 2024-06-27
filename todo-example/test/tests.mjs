import {
  it,
  describe,
  beforeEach,
  afterEach,
  expect,
} from "concise-test";
import { emptyTodo, markAsDone } from "../src/todo.mjs";
import { TodoRepository } from "../src/todoRepository.mjs";

// describe("Test Suite", () => {
const mockThrow = () => {
  throw new Error("Jello, Error");
};

describe("todo", () => {
  it("should set completedAt when calling markAsDone", () => {
    // mockThrow();
    const todo = emptyTodo();

    expect(markAsDone(todo).completedAt).toBeDefined();
    // if (!markAsDone(todo).completedAt)
    //   throw new Error(
    //     "completedAt not set when calling markAsDone"
    //   );
  });
});

describe("ToDoRepository", () => {
  const newTodo = { ...emptyTodo(), title: "test" };
  let repository;

  beforeEach(() => {
    repository = new TodoRepository();
  });
  //  afterEach(() => {
  //     console.log(`ToDoRepository afterEach`);
  //   });

  describe("add method", () => {
    it("should throw an exception when adding a todo without a title", () => {
      // mockThrow();

      expect(() => repository.add(emptyTodo())).toThrow(
        new Error("title cannot be blank")
      );
      // try {
      //   repository.add(emptyTodo());
      //   throw new Error(
      //     "no error thrown when adding an empty todo"
      //   );
      // } catch (e) {
      //   if (e.message !== "title cannot be blank")
      //     throw new Error(
      //       "wrong message in guard clause when adding an empty todo"
      //     );
      // }
    });

    it("should throw errors when adding a repeated todo", () => {
      repository.add(newTodo);

      const repeatedTodo = { ...newTodo };

      expect(() => repository.add(repeatedTodo)).toThrow(
        new Error("123todo already exists")
      );
    });
  });

  describe("findAllMatching method", () => {
    beforeEach(() => {
      repository.add(newTodo);
    });
    // afterEach(() => {
    //   console.log(`findAllMatching method afterEach`);
    // });
    it("finds an added todo", () => {
      expect(repository.findAllMatching("")).toHaveLength(
        1
      );

    });

    it("filters out todos that do not match filter", () => {

      expect(repository.findAllMatching("some other test")).toHaveLength(
        100
      );
      // if (
      //   repository.findAllMatching("some other test")
      //     .length !== 0
      // )
      //   throw new Error(
      //     "filter was not applied when finding matches"
      //   );
    });
  });
});

// });
// describe("async fn", async () => {

//   it('should throw Error if cb of describe is an async', () => {

//   });
// })
