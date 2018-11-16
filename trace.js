'use strict';
/**
 *
 * @type {module.FaTraceClass}
 */
module.exports = class FaTraceClass {
	constructor() {
		this._trace = this._traceStack();
	}

	/**
	 *
	 * @private
	 */
	_traceStack() {
		let error = new Error();
		let text = error.stack.split("\n");
		let ExpressionMethod = new RegExp("^(.+) \\((.+)\\)$");
		let ExpressionString = new RegExp("^(.+):(\\d+):(\\d+)$");
		let result = [];
		text.splice(0, 2);
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
		return result;
	}

	/**
	 *
	 * @param level {number|null}
	 * @return {*}
	 */
	get(level = null) {
		if (level !== null) {
			return this._trace[level];
		} else {
			return this._trace;
		}
	}

	/**
	 *
	 * @param level {number}
	 */
	path(level) {
		let trace = this.get(level + 1);
		return trace.path;
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
};
