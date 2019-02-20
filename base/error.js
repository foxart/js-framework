"use strict";
/*fa-nodejs*/
const ErrorStack = require("fa-nodejs/base/error-stack");
/**
 *
 * @type {module.FaError}
 */
module.exports = class FaError extends Error {
	/**
	 * @param error {Error|string}
	 */
	constructor(error) {
		super();
		this.name = error.name ? error.name : this.constructor.name;
		this.message = error.message ? error.message : error;
		if (error instanceof FaError) {
			this.trace = error.trace;
			this.stack = error.stack;
		} else if (error instanceof Error) {
			this.trace = ErrorStack.trace(error.stack);
			this.stack = error.stack;
		} else {
			this.trace = ErrorStack.trace(this.stack);
		}
		return this;
	}

	setTrace(trace) {
		// console.warn(this);
		this.trace = trace;
		return this;
	}

	/**
	 *
	 * @param error {Error|string}
	 * @param level {number}
	 * @return {FaError}
	 */
	static pickTrace(error, level = 0) {
		let e = error instanceof FaError ? error : new FaError(error);
		e.trace = [e.trace[level]];
		return e;
	}

	/**
	 *
	 * @param level {number}
	 * @return {string}
	 */
	// getStackString(level = 0) {
	// 	let trace = this.stack[level];
	// 	let method = trace.method === null ? '' : `${trace.method} | `;
	// 	let path = trace.path === null ? '' : `${trace.path}`;
	// 	let line = trace.line === null ? '' : `:${trace.line}`;
	// 	let column = trace.column === null ? '' : `:${trace.column}`;
	// 	return `${method}${path}${line}${column}`;
	// }
};
