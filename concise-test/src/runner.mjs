import path from "path";
import { pathToFileURL } from "url";
import { color } from "./colors.mjs";
import * as matchers from "./matchers.mjs";
import { ExpectationError } from "./ExpectationError.mjs";
import { formatStackTrace } from "./stackTraceFormatter.mjs";

Error.prepareStackTrace = formatStackTrace

/**
 * @typedef {Array<DescribeBlock>} DescribeStack
 */

/**
 * @typedef DescribeBlock
 * @property {string} name
 * @property {Array<Function>} befores
 * @property {Array<Function>} [afters]
 */

/**
 * @typedef TestBlock - Each it block
 * @property {string} name
 * @property {Array<Error>} errors
 * @property {DescribeStack} describeStack
 */

// /** B4 currentTest
//  * @typedef Failure
//  * @property {Error} error
//  * @property {string} name
//  * @property {DescribeStack} describeStack
//  */

const TICK = "\u2713";
const CROSS = "\u2717";

const exitCodes = {
  ok: 0,
  failures: 1,
};

let successes = 0;

/**
 * @type {TestBlock | null}
 */
let currentTest;

// from <string> to {name<string>, befores<Array>, [afters]<Array>}

/**
 * @type {DescribeStack}
 */
let describeStack = [];

/**
 * @type {Array<TestBlock>}
 */
const failures = [];

/**
 * Create test/it
 * @param {string} name
 * @returns {TestBlock}
 */
const makeTest = (name) => {
  return {
    name,
    errors: [],
    describeStack: describeStack,
  };
};
/**
 *
 * @param {string} name
 * @returns {DescribeBlock}
 */
const makeDescribe = (name) => {
  return {
    name: name,
    befores: [],
    afters: [],
  };
};

/**
 *
 * @param {TestBlock} failure
 */
const printFailure = (failure) => {
  console.error(color(composeTestDescription(failure)));
  failure.errors.forEach((error) => {
    console.error(error.message);
    console.error(error.stack);
    console.error("");
  });
  console.error("");
};

const printAllFailures = () => {
  if (failures.length > 0) {
    console.error("");
    console.error("Failures:");
    console.error("");

    failures.forEach(printFailure);
  }
};

/**
 *
 * @param {Failure} failure
 * @returns {string}
 */
const composeTestDescription = (failure) => {
  //only need the name of the describe block obj, not befores or afters
  //describeStack is the global array of non-it describe blocks; name is the current (failing) it test

  const { name, describeStack } = failure;
  return [...describeStack, { name }]
    .map(({ name }) => `<bold><red>${name}</red></bold>`)
    .join(" -> ");
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
const indent = (message) => {
  return `${" ".repeat(describeStack.length * 2)}${message}`;
};

/**
 *
 * @param {Array} arr
 * @returns {Array}
 */
const withoutLast = (arr) => arr.slice(0, -1);

/**
 *
 * @param {Array} arr
 * @returns {any | undefined}
 */
const getLast = (arr) => arr[arr.length - 1];

/**
 *
 * @param {Array<Function>} fnArr
 */
const invokeAll = (fnArr) => fnArr.forEach((fn) => fn());

/**
 * Invoke all beforeEach blocks
 */
const invokeBefores = () => {
  invokeAll(describeStack.flatMap((describe) => describe.befores));
};

/**
 * Invoke all afterEach blocks
 */
const invokeAfters = () => {
  invokeAll(describeStack.flatMap((describe) => describe.afters));
};

/**
 * @returns {Promise<void>}
 */
export const run = async () => {
  try {
    const relativeTestName = "test/tests.mjs";
    const p = path.resolve(process.cwd(), relativeTestName);

    const windowsPath = pathToFileURL(p);

    await import(windowsPath);
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
  }

  printAllFailures();
  console.log();
  console.log(
    color(`<green>${successes}</green> tests have passed, <red>${failures.length}</red> tests have failed
    `)
  );
  console.log("\nJello");
  process.exit(failures.length != 0 ? exitCodes.failures : exitCodes.ok);
};

/**
 *
 * @param {string} name
 * @param {Function} body
 */
export const it = (name, body) => {
  currentTest = makeTest(name);
  try {
    invokeBefores();
    body();
    invokeAfters();
    // console.log(
    //   indent(color(`<bold><green>${TICK} PASS ${name}</green></bold>`))
    // );
    // successes++;
  } catch (e) {
    // console.log(indent(color(`<bold><red>${CROSS} PASS ${name}</red></bold>`)));
    // failures.push({
    //   error: e,
    //   name: name,
    //   describeStack,
    // });
    currentTest.errors.push(e);
  }

  if (currentTest.errors.length > 0) {
    console.log(indent(color(`<bold><red>${CROSS} PASS ${name}</red></bold>`)));
    failures.push(currentTest);
  } else {
    successes++;
    console.log(
      indent(color(`<bold><green>${TICK} PASS ${name}</green></bold>`))
    );
  }

  //prog exits on first failure - include in run, not it
  // process.exit(anyFailure ? exitCodes.failures: exitCodes.ok)
};

/**
 *
 * @param {string} name
 * @param {Function} body
 */
export const describe = (name, body) => {
  console.log(indent(name));

  describeStack = [...describeStack, makeDescribe(name)];
  const result = body(); //the it invoked

  if (result instanceof Promise) {
    console.error(`Cannot be async`);
    // process.exit(1)
    throw new Error(`Cannot be async`);
  }
  // getCurrentDescribe = undefined
  describeStack = withoutLast(describeStack);
};

/**
 *
 * @returns {DescribeBlock}
 */
const getCurrentDescribe = () => getLast(describeStack);

/**
 *
 * @param {any} newProps
 */
const updatedDescribe = (newProps) => {
  //spread & updated
  const updatedDescribe = {
    ...getCurrentDescribe(),
    ...newProps,
  };

  describeStack = [...withoutLast(describeStack), updatedDescribe];
};
/**
 *
 * @param {Function} body
 */
export const beforeEach = (body) => {
  updatedDescribe({
    befores: [...getCurrentDescribe().befores, body],
  });
};

/**
 *
 * @param {Function} body
 */
export const afterEach = (body) => {
  updatedDescribe({
    afters: [...getCurrentDescribe().afters, body],
  });
};

const matcherHandler = (actual) => ({
  get:
    (_, name) =>
    (...args) => {
      try {
        matchers[name](actual, ...args);
      } catch (error) {
        if (error instanceof ExpectationError) {
          currentTest.errors.push(error);
        } else {
          throw e;
        }
      }
    },
});

/**
 * @typedef {Object} Matchers
 * @property {() => void} toBeDefined
 * @property {(expected?: Error) => void} toThrow
 * @property {(expected: number) => void} toHaveLength
 * @property {(expected: any) => void} toBe
 */

/**
 *
 * @param {any} actual
 * @returns {Matchers}
 */
export const expect = (actual) => new Proxy({}, matcherHandler(actual));
