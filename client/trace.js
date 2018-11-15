'use strict';

class FaTraceClass {
	constructor() {
	}

	/**
	 *
	 * @param level {number|null}
	 * @return {*}
	 */
	get(level = null) {
		let error = new Error();
		let text = error.stack.split("\n");
		text.splice(0, 2);
		let ExpressionMethod = new RegExp("^(.+) \\((.+)\\)$");
		let ExpressionString = new RegExp("^(.+):(\\d+):(\\d+)$");
		let result = [];
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
			}
			result.push(trace);
		});
		if (level !== null) {
			return result[level];
		} else {
			return result;
		}
	}

	/**
	 *
	 * @param level {number}
	 */
	string(level) {
		let trace = this.get(level + 1);
		/*let method = trace.method === null ? '' : `${trace.method}() `;*/
		/*return `${method}${trace.path}:${trace.line}:${trace.column}`;*/
		return `${trace.path}:${trace.line}:${trace.column}`;
	}
}

/**
 *
 * @type {FaTraceClass}
 */
let FaTrace = new FaTraceClass();
