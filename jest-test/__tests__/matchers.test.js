const { describe, it, beforeEach, afterAll, expect } = require("@jest/globals");

describe("matchers", () => {
  describe("toBe", () => {
    it("should not equal number 1 to string 1", () => {
      expect(1).toBe("1");

      //         Expected: "1"
      // Received: 1
    });
  });
});
