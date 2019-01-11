"use strict";
/*vendor*/
const FaError = require("./error");

/**
 *
 * @type {FaRouterClass}
 */
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
			this._handler_list[route] = new this._constructor(callback);
		} else {
			throw new FaError(`duplicate handler for route: ${route}`);
			// throw FaError.pickTrace(`route exist: ${route}`,2);
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
			throw new FaError(`not found handler for route: ${route}`);
		}
	};
}

/**
 *
 * @param executor {Object}
 * @return {FaRouterClass}
 */
module.exports = function (executor) {
	if (executor) {
		return new FaRouterClass(executor);
	} else {
		return FaRouterClass;
	}
};
