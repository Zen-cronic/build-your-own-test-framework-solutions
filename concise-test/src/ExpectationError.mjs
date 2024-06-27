import { color } from "./colors.mjs";

/**
 * @typedef {Object} ExpectationErrorArgs
 * @property {*} [actual]
 * @property {*} [expected]
 * @property {Function | string} [source]
 */

export class ExpectationError extends Error {
  /**
   *
   * @param {string} message
   * @param {ExpectationErrorArgs} param1
   */
  constructor(message, { actual, expected, source }) {
    super(
      "Expected " +
        color(
          message
            .replace("<actual>", `<bold><red>${actual}</red></bold>`)
            .replace("<expected>", `<bold><green>${expected}</green></bold>`)
            .replace("<source>", `<bold>${source}</bold>`)
        )
    );
  }
}
