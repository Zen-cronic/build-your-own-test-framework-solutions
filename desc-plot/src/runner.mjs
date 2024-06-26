import path from "path";
import { pathToFileURL } from "url";

const verbs = {};

const objToCSV = (o) => {
  //   let csvStr = "";
  //   for (const k in o) {
  //     csvStr += k.concat(",", o[k], ",");
  //   }
  //       return csvStr;

  //to avoid trailing,

  const parts = [];
  for (const k in o) {
    const p = k.concat(",", o[k]);
    parts.push(p);
  }
  return parts.join(",");
};

export const run = async () => {
  const testPath = path.join(process.cwd(), "test/tests-desc.mjs");

  // console.log({testPath});
  try {
    await import(pathToFileURL(testPath));
  } catch (error) {
    console.error(error);
  }

  console.log();
  console.log(`If not in try/catch, program fails at the first throw`);
  console.log(verbs);
  const csvData = objToCSV(verbs);
  console.log(csvData);
};

/**
 *
 * @param {string} name
 * @param {function} body
 */
export const it = (name, body) => {
  try {
    //body()

    const matched = name.match(/^should\s+([a-zA-Z]+)/);

    if (matched) {
      const v = matched[1];
      console.log({ v });

      //   if (v in verbs) {
      //     verbs[v]++;
      //   } else {
      //     verbs[v] = 1;
      //   }

      //or 
      verbs[v] = verbs[v] ? ++verbs[v] : 1;
    }
  } catch (error) {
    console.error(`${name} has error`);
  }
};
