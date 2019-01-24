"use strict";

class FaTimer {
	/**
	 *
	 * @param executor
	 */
	constructor(executor) {
		this._timer = [];
	}

	start() {
		this._timer = process.hrtime();
	};

	// stop() {
	// 	this.elapsed = process.hrtime(this.timer)[1] / 1000000;
	// };
	get(note) {
		let result;
		let precision = 3; // 3 decimal places
		let elapsed = process.hrtime(this._timer)[1] / 1000000; // divide by a million to get nano to milli
		if (note === undefined) {
			result = process.hrtime(this._timer)[0] + "s " + elapsed.toFixed(precision) + "ms";
		} else {
			result = note + ": " + process.hrtime(this._timer)[0] + "s " + elapsed.toFixed(precision) + "ms"; // print message + time
		}
		return result;
	};
}

/**
 *

 * @return {FaTimer}
 */
module.exports = function () {
	return new FaTimer();
};
