"use strict";
const FaError = require("fa-nodejs/base/error");
/**
 *
 * @type {module.AdapterClass}
 */
module.exports = class AdapterClass {
	constructor() {
		this._args = {};
	};

	// objectValueByExpression(object, value, expression) {
	// 	expression.lastIndex = 0;
	// 	let keys = expression.exec(value);
	// 	let result = Object.assign({}, object);
	// 	while (keys && keys[1] !== null) {
	// 		result = result[keys[1]];
	// 		keys = expression.exec(value);
	// 	}
	// 	return result;
	// }
	/**
	 *
	 * @param object
	 * @param keys
	 * @return {*}
	 * @private
	 */
	_getValueByKeys(object, keys) {
		let key = keys.shift();
		if (object[key] && keys.length > 0) {
			return this._getValueByKeys(object[key], keys);
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
		// let TestPattern = "^(?:\\[([^\\[\\]]+)\\])+$";
		// let MatchPattern = "[^\\[\\]]+";
		let TestPattern = "^(?:\\[\\\"([^\\[\\]\\\"]+)\\\"\\])+$";
		let MatchPattern = "[^\\[\\]\\\"]+";
		let TestExpression = new RegExp(TestPattern);
		let MatchExpression = new RegExp(MatchPattern, "g");
		let context = this;
		return data.map(function (map) {
			let result = Array.isArray(adapter) ? [] : {};
			Object.entries(adapter).forEach(function ([key, value]) {
				if (typeof value === "string" && TestExpression.test(value)) {
					result[key] = context._getValueByKeys(map, value.match(MatchExpression));
				} else if (value && value.constructor === Array) {
					result[key] = context._use(value, [map], args)[0];
				} else if (value && value.constructor === Object) {
					result[key] = context._use(value, [map], args)[0];
				} else if (typeof value === "function") {
					let result_function;
					try {
						result_function = value.apply(map, args);
					} catch (e) {
						result_function = FaError.pickTrace(e);
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

	// set adapter(adapter) {
	// 	this._adapter = adapter;
	// }
	/**
	 *
	 * @param data
	 * @return {*}
	 */
	use(data) {
		let result;
		let adapter = typeof this.adapter === "function" ? this.adapter.apply(this, this._args) : this.adapter;
		if (Array.isArray(data)) {
			result = this._use(adapter, data, this._args);
		} else {
			result = this._use(adapter, [data], this._args)[0];
		}
		return result;
	};

	/**
	 *
	 * @return {module.AdapterClass}
	 */
	extend() {
		this._args = arguments;
		return this;
	};
};

