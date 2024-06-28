
[V8 Stack Trace Api Article](https://v8.dev/docs/stack-trace-api#customizing-stack-traces)

Current CallSite methods [2024-06-28]

1. `getThis()`: returns the value of `this`.
2. `getTypeName()`: returns the type of `this` as a string. This is the name of the function stored in the constructor field of `this`, if available, otherwise the object’s `[[Class]]` internal property.
3. `getFunction()`: returns the current function.
4. `getFunctionName()`: returns the name of the current function, typically its `name` property. If a `name` property is not available, an attempt is made to infer a name from the function’s context.
5. `getMethodName()`: returns the name of the property of `this` or one of its prototypes that holds the current function.
6. `getFileName()`: if this function was defined in a script, returns the name of the script.
7. `getLineNumber()`: if this function was defined in a script, returns the current line number.
8. `getColumnNumber()`: if this function was defined in a script, returns the current column number.
9. `getEvalOrigin()`: if this function was created using a call to `eval`, returns a string representing the location where `eval` was called.
10. `isToplevel()`: is this a top-level invocation, that is, is this the global object?
11. `isEval()`: does this call take place in code defined by a call to `eval`?
12. `isNative()`: is this call in native V8 code?
13. `isConstructor()`: is this a constructor call?
14. `isAsync()`: is this an async call (i.e., `await`, `Promise.all()`, or `Promise.any()`)?
15. `isPromiseAll()`: is this an async call to `Promise.all()`?
16. `getPromiseIndex()`: returns the index of the promise element that was followed in `Promise.all()` or `Promise.any()` for async stack traces, or `null` if the CallSite is not an async `Promise.all()` or `Promise.any()` call.

Note: To maintain restrictions imposed on strict mode functions, frames that have a strict mode function and all frames below (its caller etc.) are not allow to access their receiver and function objects. For those frames, `getFunction()` and `getThis()` returns `undefined`.

Updated types: 
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