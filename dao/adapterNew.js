"use strict";
/*fa*/
const FaBaseError = require("fa-nodejs/base/error");
// const FaBaseHandler = require("fa-nodejs/base/handler");
// 		this._FaBaseHandler = new FaBaseHandler();
/*variables*/
let TestPattern = "^(?:\\[\\\"([^\\[\\]\\\"]+)\\\"\\])+$";
let MatchPattern = "[^\\[\\]\\\"]+";

class FaDaoAdapterNew {
	/**
	 * @constructor
	 */
	constructor() {
		this._TestExpression = new RegExp(TestPattern);
		this._MatchExpression = new RegExp(MatchPattern, "g");
		this._adapter = {};
		this._arguments = {};
	};

	/**
	 *
	 * @param object {Object}
	 * @param keys {Array}
	 * @return {*}
	 * @private
	 */
	_extractObject(object, keys) {
		let key = keys.shift();
		try {
			if (object[key] && keys.length > 0) {
				return this._extractObject(object[key], keys);
			} else {
				return object[key];
			}
		} catch (e) {
			return null;
		}
	};

	/**
	 *
	 * @param adapter {Object}
	 * @param data {Array}
	 * @param args
	 * @return {Array|Object}
	 * @private
	 */
	_extract(adapter, data, args) {
		let context = this;
		return data.map(function (map) {
			let result = Array.isArray(adapter) ? [] : {};
			if (typeof adapter === "function") {
				try {
					result = adapter.apply(map, args);
				} catch (e) {
					result = new FaBaseError(e).pickTrace(0).setContext(map);
				}
			} else if (typeof adapter === "string") {
				if (context._TestExpression.test(adapter)) {
					result = context._extractObject(map, adapter.match(context._MatchExpression));
				} else {
					result = adapter;
				}
			} else {
				Object.entries(adapter).map(function ([key, value]) {
					if (typeof value === "string" && context._TestExpression.test(value)) {
						result[key] = context._extractObject(map, value.match(context._MatchExpression));
					} else if (value && value.constructor === Array) {
						result[key] = context._extract(value, [map], args)[0];
					} else if (value && value.constructor === Object) {
						result[key] = context._extract(value, [map], args)[0];
					} else if (typeof value === "function") {
						let result_function;
						try {
							result_function = value.apply(map, args);
						} catch (e) {
							result_function = new FaBaseError(e).pickTrace(0).setContext(map);
						}
						result[key] = result_function;
					} else {
						result[key] = value;
					}
					result[key] = result[key] === undefined ? null : result[key];
				});
			}
			return result;
		});
	};

	get adapter() {
		return this._adapter;
	}

	/**
	 *
	 * @param adapter {Object}
	 */
	set adapter(adapter) {
		this._adapter = adapter;
	}

	/**
	 *
	 * @return {FaDaoAdapterNew}
	 */
	use() {
		this._arguments = arguments;
		return this;
	}

	/**
	 *
	 * @param data {Object|Array<Object>}
	 * @return {Object|Array<Object>}
	 */
	apply(data) {
		let result;
		if (Array.isArray(data)) {
			result = this._extract(this._adapter, data, this._arguments);
		} else {
			result = this._extract(this._adapter, [data], this._arguments)[0];
		}
		return result;
	}
}

/**
 *
 * @type {FaDaoAdapterNew}
 */
module.exports = FaDaoAdapterNew;
// let adapter;
// if (typeof this._adapter === "function") {
// 	adapter = this._adapter.apply(data, this._arguments);
// } else {
// 	adapter = this._adapter;
// }
