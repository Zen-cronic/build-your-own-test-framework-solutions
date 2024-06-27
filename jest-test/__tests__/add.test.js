const { describe, it, beforeEach, afterAll, expect } = require("@jest/globals");

const { add } = require("../src");

describe("add function", () => {
  let count = 0;
  beforeEach(() => {
    count++;
  });
  afterAll(() => {
    console.log("After all top-most count:", count);
  });
  describe("add positive integers", () => {
    let nestedCount = 0;
    beforeEach(() => {
      nestedCount++;
    });
    afterAll(() => {
      console.log("After all nested count:", nestedCount);
    });
    it("should add 1 and 1", () => {
      const result = add(1, 1);
      expect(result).toBe(2);
    });
    it("should add 2 and 2", () => {
      const result = add(2, 2);
      expect(result).toBe(4);
    });
  });

  describe("add negative integers", () => {
    it("should add -1 and -1", () => {
      const result = add(-1, -1);
      expect(result).toBe(-2);
    });
  });
  describe("add 0 with any number", () => {
    it("should add 0 and -1", () => {
      const result = add(0, -1);
      expect(result).toBe(-1);
    });
    it("should add 0 and 1", () => {
      const result = add(0, 1);
      expect(result).toBe(1);
    });

    it("should add 0 and 0", () => {
      const result = add(0, 0);
      expect(result).toBe(0);
    });
  });
});
