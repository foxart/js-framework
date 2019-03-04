"use strict";

class FaTimer {
	constructor() {
		this._timer = [];
	}

	start() {
		this._timer = process.hrtime();
	};

	stop() {
		this._timer = process.hrtime(this._timer);
	};

	/**
	 *
	 * @param template {string}
	 * @return {String}
	 */
	get(template = "{seconds}s {milliseconds}ms") {
		let seconds = this._timer[0];
		let milliseconds = (this._timer[1] / 1000000).toFixed(3); // divide by a million to get nano to milli
		return template.replaceAll(["{seconds}", "{milliseconds}"], [seconds, milliseconds]);
	};
}

/**
 *
 * @type {FaTimer}
 */
module.exports = FaTimer;
