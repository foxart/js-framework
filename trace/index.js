'use strict';
/**
 *
 * @type {module.FaTraceClass}
 */
module.exports = class FaTraceClass {
	constructor() {
		this._trace = [];
	}

	/**
	 *
	 * @private
	 */
	_traceStack(error) {
		let text = error.stack.split("\n");
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
				// trace.method = MatchMethod[1];
				// trace.method = MatchMethod[1].replaceAll(['<','>'],['&lt;','&gt;']);
				trace.method = MatchMethod[1].escapeHtml();
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
	 * @param error {Error}
	 * @return {module.FaTraceClass}
	 */
	parse(error = null) {
		if (error === null) {
			error = new Error();
		}
		this._trace = this._traceStack(error);
		return this;
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
	string(level = 0) {
		let trace = this.get(level);
		let method = trace.method === null ? '' : `${trace.method} | `;
		let path = trace.path === null ? '' : `${trace.path}`;
		let line = trace.line === null ? '' : `:${trace.line}`;
		let column = trace.column === null ? '' : `:${trace.column}`;
		return `${method}${path}${line}${column}`;
		// return `${path}${line}${column}`;
	}
};

