"use strict";
/*vendor*/
const FaError = require("/fa-nodejs/base/error");

class FaBaseHandler {
	/**
	 *
	 * @param context
	 */
	constructor(context) {
		this._context = context;
		this._handler_list = {};
	}

	_handler(context, callback) {
		return function () {
			return callback.apply(context, arguments);
		};
	}

	/**
	 *
	 * @return {string[]}
	 */
	get list() {
		return Object.keys(this._handler_list);
	}

	/**
	 *
	 * @param route
	 * @return {function}
	 */
	find(route) {
		return this._handler_list[route];
	}

	/**
	 *
	 * @param route {string}
	 * @return {boolean}
	 */
	exist(route) {
		return !!this._handler_list[route];
	}

	/**
	 *
	 * @param handler {string}
	 * @param callback {function}
	 */
	attach(handler, callback) {
		if (this.exist(handler) === false) {
			this._handler_list[handler] = new this._handler(this._context, callback);
		} else {
			throw new FaError(`duplicate handler: ${handler}`);
		}
	};

	/**
	 *
	 * @param handler {string}
	 */
	detach(handler) {
		if (this.exist(handler) === true) {
			delete this._handler_list[handler];
		} else {
			throw new FaError(`handler not found: ${handler}`);
		}
	};
}

/**
 *
 * @type {FaBaseHandler}
 */
module.exports = FaBaseHandler;
