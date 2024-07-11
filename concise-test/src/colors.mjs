const ansiColors = {
  bold: "\u001b[37;1m",
  strike: "\u001b[37;9m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  dim: "\u001b[37;2m",
};
const ansiReset = "\u001b[0m";

/**
 * Usage: <red>${name}</red>
 * @param {string} message
 * @returns {string}
 */
export const color = (message) => {
  const colorisedMsg = Object.keys(ansiColors).reduce((msg, currColor) => {
    // console.log({currColor});
    const replacedMsg = msg
      .replace(new RegExp(`<${currColor}>`, "g"), ansiColors[currColor])
      .replace(new RegExp(`</${currColor}>`, "g"), ansiReset);

    return replacedMsg;
  }, message);

  return colorisedMsg;
};
