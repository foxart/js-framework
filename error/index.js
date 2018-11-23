'use strict';
// const FaTrace = require('../trace/index');
const FaTraceClass = require('../trace/index.js');
const FaTrace = new FaTraceClass();
/**
 *
 * @type {module.FaError}
 */
module.exports = class FaError extends Error {
	/**
	 * @param error
	 * @param trace {boolean}
	 */
	constructor(error, trace = true) {
		super();
		let backtrace;
		if (error instanceof Error) {
			backtrace = trace ? [FaTrace.parse(error).string(0)] : [];
		} else {
			backtrace = trace ? [FaTrace.parse(this).string(0)] : [];
		}
		// FaConsole.consoleError(backtrace);
		this.name = error['name'] ? error['name'] : this.constructor.name;
		this.message = error['message'] ? error['message'] : error;
		this.trace = error['trace'] ? backtrace.concat(error['trace']) : backtrace;
		// this.trace = error['trace'] ? error['trace'].concat(backtrace) : backtrace;
	}

	/**
	 *
	 * @param trace {string}
	 */
	appendTrace(trace) {
		if (trace) {
			this.trace.push(trace);
		}
	}

	/**
	 *
	 * @param trace {string}
	 */
	prependTrace(trace) {
		if (trace) {
			this.trace.unshift(trace);
		}
	}
};
