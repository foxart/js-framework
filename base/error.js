"use strict";
/*fa-nodejs*/
const FaTrace = require("fa-nodejs/base/trace");

class FaError extends Error {
	/**
	 * @param error {Error|string}
	 */
	constructor(error = "error") {
		super();
		this.name = error["name"] ? error["name"] : this.constructor.name;
		this.message = error["message"] ? error["message"] : error;
		if (error instanceof FaError) {
			this.trace = error["trace"];
			this.stack = error["stack"];
		} else if (error instanceof Error) {
			this.trace = FaTrace.stack(error["stack"]);
			this.stack = error["stack"];
		} else {
			this.trace = FaTrace.stack(this.stack);
		}
		return this;
	}

	/**
	 *
	 * @param trace
	 * @return {FaError}
	 */
	setTrace(trace) {
		this.trace = Array.isArray(trace) ? trace : [trace];
		return this;
	}

	/**
	 *
	 * @param level {number|null}
	 * @return {FaError}
	 */
	pickTrace(level = null) {
		this.trace = level === null ? this.trace : [this.trace[level]];
		return this;
	}
}

/**
 *
 * @type {FaError}
 */
module.exports = FaError;
