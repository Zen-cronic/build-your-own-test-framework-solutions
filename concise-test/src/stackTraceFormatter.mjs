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