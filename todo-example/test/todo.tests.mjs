import {
  it,
  describe,
  beforeEach,
  afterEach,
  expect,
} from "concise-test";
// import { describe } from "concise-test";
import { emptyTodo, markAsDone } from "../src/todo.mjs";

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
