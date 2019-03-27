"use strict";
/*fa-nodejs*/
const FaTrace = require("fa-nodejs/base/trace");

class FaBaseError extends Error {
	/**
	 * @param error {Error|string}
	 */
	constructor(error = "error") {
		super();
		this.name = error["name"] ? error["name"] : this.constructor.name;
		this.message = error["message"] ? error["message"] : error;
		if (error instanceof FaBaseError) {
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
	 * @param name {string}
	 * @return {FaBaseError}
	 */
	setName(name) {
		if (name) {
			this.name = name;
		}
		return this;
	}

	/**
	 *
	 * @param message {string}
	 * @return {FaBaseError}
	 */
	setMessage(message) {
		if (message) {
			this.message = message;
		}
		return this;
	}

	/**
	 *
	 * @param trace
	 * @return {FaBaseError}
	 */
	setTrace(trace) {
		if (trace) {
			this.trace = Array.isArray(trace) ? trace : [trace];
		}
		return this;
	}

	/**
	 *
	 * @param context {*}
	 * @return {FaBaseError}
	 */
	setContext(context) {
		if (context) {
			this.context = context;
		}
		return this;
	}

	/**
	 *
	 * @param level {number|null}
	 * @return {FaBaseError}
	 */
	pickTrace(level = null) {
		this.trace = level === null ? this.trace : [this.trace[level]];
		return this;
	}
}

/**
 *
 * @type {FaBaseError}
 */
module.exports = FaBaseError;
