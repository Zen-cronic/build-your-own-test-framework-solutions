import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import * as fs from "fs";
import { EOL } from "os";
import { color } from "../../concise-test/src/colors.mjs";
import { Logger } from "scope-logger";

const logger = new Logger("StackTrace").disableAll();

const ignoredFilePatterns = [
  /\/node_modules\//,
  new RegExp(path.dirname(new URL(import.meta.url).pathname)),
  /^node:internal\//,
];

/**
 * Returns the CallSite repsonsible for the Error
 * @param {Array<CallSite>} stack
 * @returns {CallSite | undefined}
 */
const findFailureCallSite = (stack) => {
  //the first occurence - the top most call/ last call
  const failureCallSite = stack.find((callSite) => {
    const fileName = callSite.getFileName();

    return (
      fileName &&
      !ignoredFilePatterns.some((pattern) => {
        return fileName.match(pattern);
      })
    );
  });
  return failureCallSite;
};

/**
 * Get relative path
 * @param {string} fileUrl
 * @returns {string}
 */
const relative = (fileUrl) => {
  //wo this throw: "TypeError: fileUrl.replace is not a function"
  if (typeof fileUrl != "string") {
    throw new TypeError(
      `Paramter must be of type string. Received: '${typeof fileUrl}'.`
    );
  }

  const pathWithoutFileProtocol = fileURLToPath(fileUrl, { windows: false });
  const urlCwd = pathToFileURL(process.cwd());
  const urlCwdPathName = urlCwd.pathname;

  return path.relative(urlCwdPathName, pathWithoutFileProtocol); //
};

/**
 *
 * @param {Array<CallSite>} stack
 * @returns {FailureLocation | undefined}
 */
const getFailureLocation = (stack) => {
  const failureLocation = findFailureCallSite(stack);
  if (failureLocation) {
    return {
      fileName: relative(failureLocation.getFileName()),
      lineNumber: failureLocation.getLineNumber(),
      columnNumber: failureLocation.getColumnNumber(),
    };
  }
};

/**
 * @template T
 * @param  {Array<T>} columns
 * @returns {string}
 */

const pipeSeparatedValues = (...columns) => {
  return columns.join(" | ");
};

/**
 *
 * @param {Array<string>} lines
 * @param {number} start
 * @returns {Array<string>}
 */
const withLineNumbers = (lines, start) => {
  logger.log({ start });
  //max - e.g., 1:1, 10:2, 100:3
  const maxNumberColumnWidth = (lines.length + start).toString().length;
  return lines.map((line, index) => {
    const number = (start + index).toString().padStart(maxNumberColumnWidth);

    return pipeSeparatedValues(number, line);
  });
};

/**
 * @template T
 * @param {Array<T>} array
 * @param {number} from
 * @param {number} to
 * @returns {Array<T>}
 */
const boundedSlice = (array, from, to) => {
  // return array.slice(Math.max(from, 0), Math.min(to, array.length -1 ));
  return array.slice(Math.max(from, 0), Math.min(to, array.length));
};

/**
 *
 * @param {number} columnNumber - to place the pointer (in the line below)
 * @param {number} maxLineNumber - to format the space preceding the "|"
 * @returns {string}
 */
const pointerAt = (columnNumber, maxLineNumber) => {
  const padding = maxLineNumber.toString().length;

  logger.log({ columnNumber });
  return pipeSeparatedValues(
    " ".repeat(padding),
    `${" ".repeat(columnNumber - 1)}<bold><red>^</red></bold>`
  );
};
/**
 *
 * @param {FailureLocation} failureLocation
 */
const highlightedSource = (failureLocation) => {
  const { fileName, lineNumber, columnNumber } = failureLocation;
  const allLines = fs.readFileSync(fileName, { encoding: "utf-8" }).split(EOL);

  //if - 3 => when err on 1st, starts from -1
  //if - 2 => solves 3 BUT wrong error line: lower by 1 e.g., for 11 => 12
  const fromLine = lineNumber - 3;
  const toLine = lineNumber + 2;

  const highlightedLines = withLineNumbers(
    boundedSlice(allLines, fromLine, toLine),
    fromLine + 1
  );

  return [
    ...highlightedLines.slice(0, 3),
    pointerAt(columnNumber, toLine),
    ...highlightedLines.slice(3, 5),
  ];
};

/**
 *
 * @param {string} line
 * @returns {string}
 */
const indentLine = (line) => {
  return `${" ".repeat(2)}${line}`;
};

/**
 *
 * @param {Error} error
 * @param {Array<CallSite>} stack
 * @returns {string[] | CallSite[]}
 */
export const formatStackTrace = (_, stack) => {
  //   const origStack = stack;
  //   origStack.forEach((line, idx) => {
  //     const lineNumber = idx + 1;
  //     console.log(lineNumber, line.getFileName());
  //   });
  //   console.log("");

  const failureLocation = getFailureLocation(stack);

  if (failureLocation === undefined) {
    console.log("Nu qualifiedFailureLocation found");
    return stack;
  }

  const { fileName, lineNumber, columnNumber } = failureLocation;

  const introLine = `in <bold>${fileName}</bold><dim>:${lineNumber}:${columnNumber}</dim>`;

  const allLines = ["", introLine, "", ...highlightedSource(failureLocation)];
  return color(allLines.map(indentLine).join(EOL));
};

/**
 * @typedef {Object} FailureLocation
 * @property {string} fileName
 * @property {string} lineNumber
 * @property {string} columnNumber
 */

/**
 * @typedef {Object} CallSite
 * @property {() => any | undefined} getThis Returns the value of this or undefined if the function is invoked in strict mode
 * @property {() => string} getTypeName Returns the type of this as a string
 * @property {() => string} getFunctionName Returns the name of the current function
 * @property {() => string} getMethodName Returns the name of the property of this or one of its prototypes that holds the current function
 * @property {() => string} getFileName Returns the name of the script or module
 * @property {() => number} getLineNumber Returns the current line number
 * @property {() => number} getColumnNumber Returns the current column number
 * @property {() => Function | undefined} getFunction Returns the current function or undefined if the function is invoked in strict mode
 * @property {() => string} getEvalOrigin Returns the string representing the location where eval was called
 * @property {() => boolean} isNative Returns true if the function is a native function
 * @property {() => boolean} isToplevel Returns true if the execution is in the top-level context
 * @property {() => boolean} isEval Returns true if the function is being called within an eval
 * @property {() => boolean} isConstructor Returns true if the function is a constructor
 * @property {() => boolean} isAsync Returns true if the function is an asynchronous function
 * @property {() => boolean} isPromiseAll Returns true if the function is an asynchronous call to Promise.all()
 * @property {() => number | null} getPromiseIndex: Returns the index of the promise element that was followed in Promise.all() or Promise.any() for async stack traces, or null if the CallSite is not an async Promise.all() or Promise.any() call.
 */
