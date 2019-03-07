"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
/*variables*/
let TestPattern = "^(?:\\[\\\"([^\\[\\]\\\"]+)\\\"\\])+$";
let MatchPattern = "[^\\[\\]\\\"]+";
/**
 *
 * @type {module.AdapterClass}
 */
module.exports = class AdapterClass {
	constructor() {
		this._arguments = {};
	};

	/**
	 *
	 * @param object {Object}
	 * @param keys {Array}
	 * @return {*}
	 * @private
	 */
	_getObjectValueByKeys(object, keys) {
		let key = keys.shift();
		if (object[key] && keys.length > 0) {
			return this._getObjectValueByKeys(object[key], keys);
		} else {
			return object[key];
		}
	};

	/**
	 *
	 * @param data
	 * @param adapter
	 * @param args
	 * @return {*}
	 * @private
	 */
	_use(adapter, data, args) {
		let TestExpression = new RegExp(TestPattern);
		let MatchExpression = new RegExp(MatchPattern, "g");
		let context = this;
		return data.map(function (map) {
			let result = Array.isArray(adapter) ? [] : {};
			// Object.entries(adapter).forEach(function ([key, value]) {
			Object.entries(adapter).map(function ([key, value]) {
				if (typeof value === "string" && TestExpression.test(value)) {
					result[key] = context._getObjectValueByKeys(map, value.match(MatchExpression));
				} else if (value && value.constructor === Array) {
					result[key] = context._use(value, [map], args)[0];
				} else if (value && value.constructor === Object) {
					result[key] = context._use(value, [map], args)[0];
				} else if (typeof value === "function") {
					let result_function;
					try {
						result_function = value.apply(map, args);
					} catch (e) {
						result_function = new FaError(e).pickTrace(0);
					}
					result[key] = result_function;
				} else {
					result[key] = value;
				}
				result[key] = result[key] === undefined ? null : result[key];
			});
			return result;
		});
	};

	get adapter() {
		return this._adapter;
	}

	set adapter(adapter) {
		this._adapter = adapter;
	}

	/**
	 *
	 * @param data
	 * @return {*}
	 */
	use(data) {
		let result;
		let adapter = typeof this.adapter === "function" ? this.adapter.apply(this, this._arguments) : this.adapter;
		if (Array.isArray(data)) {
			result = this._use(adapter, data, this._arguments);
		} else {
			result = this._use(adapter, [data], this._arguments)[0];
		}
		return result;
	};

	/**
	 *
	 * @return {module.AdapterClass}
	 */
	extend() {
		this._arguments = arguments;
		return this;
	};
};

