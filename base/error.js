"use strict";
/*fa-nodejs*/
const FaTrace = require("fa-nodejs/base/trace");

class FaError extends Error {
	/**
	 * error {Error|{name: string, message: string|null, trace: []|null, stack: string|null}|string}
	 *
	 * @param error {Error|{name, message, trace, stack}|string}
	 * @return {FaError}
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
	 * @return {string}
	 */
	getName() {
		return this.name;
	}

	/**
	 *
	 * @param name {string}
	 * @return {FaError}
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
	 * @return {FaError}
	 */
	setMessage(message) {
		if (message) {
			this.message = message;
		}
		return this;
	}

	appendTrace(trace) {
		this.trace.push(trace);
		return this;
	}

	prependTrace(trace) {
		this.trace.unshift(trace);
		return this;
	}

	/**
	 *
	 * @param trace
	 * @return {FaError}
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
	 * @return {FaError}
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
