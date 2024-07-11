import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { color } from "./colors.mjs";
import * as matchers from "./matchers.mjs";
import { ExpectationError } from "./ExpectationError.mjs";
import { formatStackTrace } from "./stackTraceFormatter.mjs";

// Error.prepareStackTrace = formatStackTrace

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
  cannotAccessFile: 2,
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
    // "in" from `formatStackTrace` coloured red cuz console.error
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
 * @param {TestBlock} failure
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

const isSingleFileMode = () => process.argv[2];

/**
 *
 * @returns {Promise<string[]>}
 */
const getSingleFilePath = async () => {
  const filePathArg = process.argv[2];

  try {
    const fullPath = path.resolve(process.cwd(), filePathArg);

    await fs.promises.access(fullPath);
    return [fullPath];
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`File ${filePathArg} could not be accessed.`);
      // throw vs log error: diff format
      // throw - bubble up to parent + orig prepareStackTrace format
      // console.error - voided here + custom implm of prepareStackTrace in formatStackTrace
      console.error(error);
      // throw error
    } else {
      //throw
      console.error(error);
    }

    process.exit(exitCodes.cannotAccessFile);
  }
};

/**
 *
 * @returns {Promise<string[]>}
 */
const chooseTestFiles = () => {
  return isSingleFileMode() ? getSingleFilePath() : discoverTestFiles();
};
/**
 *
 * @returns {Promise<string[]>}
 */
const discoverTestFiles = async () => {
  const testDir = path.resolve(process.cwd(), "test");
  //'C:\\..\\repo\\todo-example\\test'

  const dir = await fs.promises.opendir(testDir);
  const dirPath = dir.path;
  let testFilePaths = [];
  for await (const dirent of dir) {
    const fullPath = path.resolve(dirPath, dirent.name);
    testFilePaths.push(fullPath);
  }

  //asyncIterator auto close
  // await dir.close()
  return testFilePaths;
};
/**
 * @returns {Promise<void>}
 */
export const run = async () => {
  const origPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = formatStackTrace;
  try {
    // const testFilePaths = await discoverTestFiles();
    const testFilePaths = await chooseTestFiles();
    await Promise.all(
      testFilePaths.map(async (testFilePath) => {
        const crossPlatformPath = pathToFileURL(testFilePath);
        await import(crossPlatformPath);
      })
    );
  } catch (error) {
    //use built-in prepareStackTrace for non-test errors
    if (error.name !== ExpectationError.name) {
      Error.prepareStackTrace = origPrepareStackTrace;
      console.error(error);

      //ensure exit + DNPrint test failures
      process.exit(exitCodes.failures);
    }
    //test exceptions handled by `printFailures()` - voided here
  } finally {
    printAllFailures();

    //restore
    Error.prepareStackTrace = origPrepareStackTrace;

    console.log();
    console.log(
      color(`<green>${successes}</green> tests have passed, <red>${failures.length}</red> tests have failed
    `)
    );

    process.exit(failures.length != 0 ? exitCodes.failures : exitCodes.ok);
  }
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
  } catch (e) {
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
