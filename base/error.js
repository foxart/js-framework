"use strict";

class FaError extends Error {
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
			this.trace = FaError.traceStack(error.stack);
			this.stack = error.stack;
		} else {
			this.trace = FaError.traceStack(this.stack);
		}
	}

	/**
	 *
	 * @param stack {string}
	 * @return {Array}
	 */
	static traceStack(stack) {
		let text = stack.split("\n");
		let ExpressionMethod = new RegExp("^(.+) \\((.+)\\)$");
		let ExpressionString = new RegExp("^(.+):(\\d+):(\\d+)$");
		let result = [];
		text.splice(0, 1);
		text.forEach(function (item) {
			let trace = {
				method: null,
				path: null,
				line: null,
				column: null,
			};
			let string = '';
			let line = item.slice(item.indexOf("at ") + 3, item.length);
			let MatchMethod = ExpressionMethod.exec(line);
			if (MatchMethod) {
				// trace.method = `${MatchMethod[1].replace("\<anonymous\>", "()")}`;
				trace.method = MatchMethod[1];
				string = MatchMethod[2];
			} else {
				string = line;
			}
			let MatchString = ExpressionString.exec(string);
			if (MatchString) {
				trace.path = MatchString[1];
				trace.line = MatchString[2];
				trace.column = MatchString[3];
			} else {
				trace.method = string;
			}
			result.push(trace);
		});
		return result;
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
}

/**
 *
 * @type {FaError}
 */
module.exports = FaError;