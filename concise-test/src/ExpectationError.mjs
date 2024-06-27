import { color } from "./colors.mjs";

/**
 * @typedef {Object} ExpectationErrorArgs
 * @property {*} [actual]
 * @property {*} [expected]
 * @property {Function | string} [source]
 */

export class ExpectationError extends Error {
  /**
   * Genearte regex with optional single or double quotes around the provided string. E.g., "<actual>"
   * @param {string} str
   * @returns {RegExp}
   */
  static genQuotedReg(str) {
    return new RegExp(`('|")?(${str})('|")?`, "g");
  }

  /**
   *
   * @param {string} message
   * @param {ExpectationErrorArgs} args
   */
  constructor(message, args) {
    // prev: message.replace("<expected>", `<bold><green>${args.expected}</green></bold>`)

    super(
      "Expected " +
        color(
          message
            .replace(
              ExpectationError.genQuotedReg("<actual>"),
              `<bold><red>$1${args.actual}$3</red></bold>`
            )
            .replace(
              ExpectationError.genQuotedReg("<expected>"),
              `<bold><green>$1${args.expected}$3</green></bold>`
            )
            .replace(
              ExpectationError.genQuotedReg("<source>"),
              `<bold>$1${args.source}$3</bold>`
            )
        )
    );
  }
}
