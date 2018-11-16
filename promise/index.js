'use strict';
/*vendor*/
const FaError = require('../error/index');
const Trace = require('../trace/index');
/**
 * https://gist.github.com/domenic/8ed6048b187ee8f2ec75
 * @type {module.FaPromise}
 */
module.exports = class FaPromise extends Promise {
	/**
	 *
	 * @param executor
	 */
	constructor(executor) {
		// super((resolve, reject) => {
		super(function (resolve, reject) {
			return executor(resolve, reject);
		});
	}

	/**
	 *
	 * @param onFulfilled
	 * @param onRejected
	 * @return {Promise}
	 */
	then(onFulfilled, onRejected) {
		return super.then(onFulfilled, onRejected);
	}

	/**
	 *
	 * @param onCatch
	 * @return {Promise}
	 */
	catch(onCatch) {
		let trace = Trace.getString(1);
		return super.catch(
			/**
			 *
			 * @param e {module.FaError}
			 * @return {PromiseLike}
			 */
			function (e) {
				if (e instanceof FaError) {
					// e.appendTrace(trace);
					e.prependTrace(trace);
				} else {
					e = new FaError(e, false);
				}
				return onCatch.call(this, e);
			}
		);
	}
};
