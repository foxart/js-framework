'use strict';
/*components*/
const
	Trace = require('./trace/index');
/**
 *
 * @param error
 */
exports.getError = function (error) {
	// error = error === undefined ? {} : error;
	if (Array.isArray(error.trace)) {
		error.trace.push(Trace.extractString(Trace.getData(2)));
	} else {
		error.trace = [Trace.extractString(Trace.getData(2))];
	}
	return ({
		name: error.name,
		message: error.message,
		trace: error.trace.reverse(),
	});
};
exports.setError = function (error) {
	if (Array.isArray(error.trace)) {
		error.trace.push(Trace.extractString(Trace.getData(2)));
	} else {
		error.trace = [Trace.extractString(Trace.getData(2))];
	}
	return ({
		name: error.name,
		message: error.message,
		trace: error.trace,
	});
};
exports.throwError = function (error) {
	// console.log(Trace.getData(2));
	if (Array.isArray(error.trace)) {
		error.trace.push(Trace.extractString(Trace.getData(2)));
	} else {
		error.trace = [Trace.extractString(Trace.getData(2))];
	}
	throw {
		name: error.name,
		message: error.message,
		trace: error.trace,
	};
};


