"use strict";
/**
 *
 * @type {*|Array}
 */
exports.time_start = [];
/**
 *
 */
exports.reset = function () {
	this.time_start = process.hrtime();
};
/**
 *
 * @param note
 * @returns {string}
 */
exports.elapsed = function (note) {
	let result;
	let precision = 3; // 3 decimal places
	let elapsed = process.hrtime(this.time_start)[1] / 1000000; // divide by a million to get nano to milli
	if (note === undefined) {
		result = process.hrtime(this.time_start)[0] + " s, " + elapsed.toFixed(precision) + " ms";
	} else {
		result = note + ": " + process.hrtime(this.time_start)[0] + " s, " + elapsed.toFixed(precision) + " ms"; // print message + time
	}
	return result;
};

