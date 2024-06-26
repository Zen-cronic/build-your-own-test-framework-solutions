import { EOL } from "os";
import { ExpectationError } from "./ExpectationError.mjs";

/**
 *
 * @param {any} actual
 */
export const toBeDefined = (actual) => {
  //declared, so can use === undefined
  //   if (typeof actual == "undefined") {
  // console.log(`toBeDefined invoked`);

  if (actual === undefined) {
    throw new ExpectationError("<actual> value to be defined", { actual });
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
    throw new ExpectationError("<source> to throw exception but it did not", {
      source: fn,
    });
  } catch (actualError) {
    if (expected && actualError.message !== expected.message) {
      throw new ExpectationError(
        "<source> to throw an exception, but the thrown error message did not match the expected message." +
          EOL +
          " Expected exception message: <expected>" +
          EOL +
          "   Actual exception message: <actual>" +
          EOL,
        {
          actual: actualError.message,
          source: fn,
          expected: expected.message,
        }
      );
    }
  }
};

/**
 * Check for objects with `length` property (i.e., Array, strings)
 * @param {Array | string} actual
 * @param {number} expected
 */
export const toHaveLength = (actual, expected) => {
  if (actual.length !== expected) {
    throw new ExpectationError(
      "value to have length <expected>, but it was <actual>",
      { actual: actual.length, expected }
    );
  }
};

/**
 *
 * @param {string} str
 * @returns {string}
 */
const padDoubleQuotes = (str) => {
  return `"${str}"`;
};

/**
 *
 * @param {string} str
 * @returns {boolean}
 */
const isString = (str) => {
  const className = Object.prototype.toString.call(str);

  return className === "[object String]";
};

/**
 *
 * @param {*} actual
 * @param {*} expected
 */
export const toBe = (actual, expected) => {
  if (actual !== expected) {
    const a = "<actual>";
    const e = "<expected>";

    const expectedStr = isString(expected) ? padDoubleQuotes(e) : e;

    const actualStr = isString(actual) ? padDoubleQuotes(a) : a;

    throw new ExpectationError(
      `value to be ${expectedStr}, but it was ${actualStr}`,
      {
        actual,
        expected,
      }
    );
  }
};
