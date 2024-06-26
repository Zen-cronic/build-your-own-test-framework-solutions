import path from "path";
import { pathToFileURL } from "url";
import { color } from "./colors.mjs";

// [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'

let anyFailure = false;  //module-level vari

let successes = 0;

let failures = 0;

const exitCodes = {
  ok: 0,
  failures: 1,
};
export const run = async () => {
  try {
    const p = path.resolve(process.cwd(), "test/tests.mjs");
    // console.log({p});

    const f = p.replace(/^C/, "file"); //wrong, doesn't encode posix, etc
    // console.log({f});

    // await import(f)
    // await import(p)

    const windowsPath = pathToFileURL(p);
    // console.log({windowsPath});

    await import(windowsPath);
    // const v = path.dirname(fileURLToPath(import.meta.url))
    // console.log({v});
  } catch (error) {
    console.error(error);
  }

  console.log(
    color(`<green>${successes}</green> tests have passed\n<red>${failures}</red> tests have failed
    `)
  );
  console.log("\nJello");
//   process.exit(anyFailure ? exitCodes.failures : exitCodes.ok);
  process.exit(failures != 0 ? exitCodes.failures: exitCodes.ok)

};

export const it = (name, body) => {
  try {
    body();
    successes++;
  } catch (e) {
    console.error(color(`<bold><red>${name}</red></bold>`));
    // console.error(e);
    // anyFailure = true
    failures++;
  }

 
  //prog exits on first failure - include in run, not it
  // process.exit(anyFailure ? exitCodes.failures: exitCodes.ok)

};
