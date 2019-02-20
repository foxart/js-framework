"use strict";
/**
 *
 * @type {module.ErrorStack}
 */
module.exports = class ErrorStack {
	/**
	 *
	 * @param stack {string}
	 * @return {Array}
	 */
	static trace(stack) {
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
			let string = "";
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
	 * @param stack {string}
	 * @param level {number}
	 * @return {[]}
	 */
	static pick(stack, level = 0) {
		let trace = this.trace(stack);
		return [trace[level]];
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
