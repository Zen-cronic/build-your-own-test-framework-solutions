import { EOL } from "os";
import { color } from "./colors.mjs";

/**
 *
 * @param {any} actual
 */
export const toBeDefined = (actual) => {
  //declared, so can use === undefined
  //   if (typeof actual == "undefined") {
  // console.log(`toBeDefined invoked`);

  if (actual === undefined) {
    throw new Error(`Expected undefined value to be defined`);
  }
};

/**
 *
 * @param {Function} fn
 * @param {Error} [expected]
 */
export const toThrow = (fn, expected) => {
  try {
    fn();
    throw new Error(`Expected ${fn} to throw exception but it did not`);
  } catch (actualError) {
    if (expected && actualError.message !== expected.message) {
      throw new Error(
        `Expected ${fn} to throw an exception, but the thrown error message did not match the expected message.` +
          EOL +
          ` Expected exception message: ${expected.message}` +
          EOL +
          `   Actual exception message: ${actualError.message}` +
          EOL
      );
    }
  }
};

/**
 *
 * @param {Array | string} actual
 * @param {number} expected
 */
export const toHaveLength = (actual, expected) => {
  if (actual.length !== expected) {
    throw new Error(
      color(
        `Expected value to have length <bold>${expected}</bold> but it was <bold>${actual.length}</bold>`
      )
    );
  }
};
