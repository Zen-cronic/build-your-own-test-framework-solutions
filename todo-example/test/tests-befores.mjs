import { it, describe, beforeEach, expect } from "concise-test";

describe("add function", () => {
  let count = 0;
  beforeEach(() => {
    count++;
  });
  //   afterAll(() => {
  //     console.log("After all top-most count:", count);
  //   });
  describe("add positive integers", () => {
    let nestedCount = 0;
    beforeEach(() => {
      nestedCount++;
    });
    // afterAll(() => {
    //   console.log("After all nested count:", nestedCount);
    // });
    it("should add 1 and 1", () => {
        expect(1 + 1).toBe(2)
    });
    it("should add 2 and 2", () => {
   
    });
    console.log({nestedCount});
  });

  describe("add negative integers", () => {
    it("should add -1 and -1", () => {

    });
  });
  describe("add 0 with any number", () => {
    it("should add 0 and -1", () => {
   
    });
    it("should add 0 and 1", () => {
    
    });

    it("should add 0 and 0", () => {
 
    });
  });
  console.log({count});
  
});

