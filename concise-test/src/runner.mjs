import path from "path";
import { pathToFileURL } from "url";
import { color } from "./colors.mjs";

// [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'

// let anyFailure = false;  //module-level vari

const TICK = "\u2713";
const CROSS = "\u2717";

const exitCodes = {
  ok: 0,
  failures: 1,
};

let successes = 0;

// let currentDescribe ;
let describeStack = [];

// let failures = 0;
const failures = [];

const printFailure = (failure) => {
  console.error(color(composeTestDescription(failure)));
  console.error(failure.error);
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

const composeTestDescription = ({ name, describeStack }) => {
  return [...describeStack, name]
    .map((describeName) => `<bold><red>${describeName}</red></bold>`)
    .join(" -> ");
};

const indent = (message) => {
  return `${" ".repeat(describeStack.length * 2)}${message}`;
};

const withoutLast = (arr) => arr.slice(0, -1);

export const run = async () => {
  try {
    const p = path.resolve(process.cwd(), "test/tests.mjs");

    const windowsPath = pathToFileURL(p);
    // console.log({windowsPath});

    await import(windowsPath);
  } catch (error) {
    console.error(error);
  }

  printAllFailures();
  console.log();
  console.log(
    color(`<green>${successes}</green> tests have passed, <red>${failures.length}</red> tests have failed
    `)
  );
  console.log("\nJello");
  //   process.exit(anyFailure ? exitCodes.failures : exitCodes.ok);
  process.exit(failures.length != 0 ? exitCodes.failures : exitCodes.ok);
};

export const it = (name, body) => {
  try {
    body();
    console.log(
      indent(color(`<bold><green>${TICK} PASS ${name}</green></bold>`))
    );
    successes++;
  } catch (e) {
    console.log(indent(color(`<bold><red>${CROSS} PASS ${name}</red></bold>`)));
    // anyFailure = true
    // failures.push(e);
    failures.push({
      error: e,
      name: name,
      // describeName: currentDescribe
      describeStack,
    });
  }

  //prog exits on first failure - include in run, not it
  // process.exit(anyFailure ? exitCodes.failures: exitCodes.ok)
};

export const describe = (name, body) => {
  console.log(indent(name));
  // console.log(name);
  // currentDescribe = name
  describeStack = [...describeStack, name];
  body(); //the it invoked
  // currentDescribe = undefined
  describeStack = withoutLast(describeStack);
};
