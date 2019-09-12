"use strict";
/*vendor*/
const FaError = require("fa-nodejs/base/error");

class FaRouterClass {
	/**
	 *
	 * @param executor
	 */
	constructor(executor) {
		this._handler_list = {};

		this._constructor = function (callback) {
			return function () {
				return callback.apply(executor, arguments);
			};
		}
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
	 * @param route {string}
	 * @param callback {function}
	 */
	attach(route, callback) {
		if (this.exist(route) === false) {
			// this._handler_list[route] = new this._constructor(callback);
			this._handler_list[route] = this._constructor(callback);
		} else {
			throw new FaError(`duplicate handler for route: ${route}`);
		}
	};

	/**
	 *
	 * @param route {string}
	 */
	detach(route) {
		if (this.exist(route) === true) {
			delete this._handler_list[route];
		} else {
			throw new FaError(`no handler for route: ${route}`);
		}
	};
}

/**
 *
 * @type {FaRouterClass}
 */
module.exports = FaRouterClass;
