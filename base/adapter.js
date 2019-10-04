"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
/*variables*/
let TestPattern = "^(?:\\[\'([^\\[\\]\']+)\'\\])+$";
let MatchPattern = "[^\\[\\]\']+";
let AsyncFunction = (async () => {
}).constructor;

class FaAdapter {
	/**
	 *
	 * @constructor
	 * @param adapter {Object}
	 */
	constructor(adapter = {}) {
		this._TestExpression = new RegExp(TestPattern);
		this._MatchExpression = new RegExp(MatchPattern, "g");
		this._adapter = adapter;
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
		let self = this;
		return data.map(function (map) {
			let result = Array.isArray(adapter) ? [] : {};
			if (typeof adapter === "function") {
				try {
					result = adapter.apply(map, args);
				} catch (e) {
					result = new FaError(e).pickTrace(0);
				}
			} else if (typeof adapter === "string") {
				if (self._TestExpression.test(adapter)) {
					result = self._extractObject(map, adapter.match(self._MatchExpression));
				} else {
					result = adapter;
				}
			} else {
				if (adapter && (adapter.constructor === Object || adapter.constructor === Array)) {//todo check how adapter can possibilly be null or undefined
					Object.entries(adapter).map(function ([key, value]) {
						if (typeof value === "string" && self._TestExpression.test(value)) {
							result[key] = self._extractObject(map, value.match(self._MatchExpression));
						} else if (value && value.constructor === Array) {
							result[key] = self._extract(value, [map], args)[0];
						} else if (value && value.constructor === Object) {
							result[key] = self._extract(value, [map], args)[0];
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
				} else {
					result = adapter;
				}
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
	 * @return {FaAdapter}
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
		// if (Array.isArray(data)) {
		// 	result = this._extract(this._adapter, data, this._arguments);
		// } else {
		// 	result = this._extract(this._adapter, [data], this._arguments)[0];
		// }
		// return result;
		/**/
		let result;
		let adapter;
		if (typeof this.adapter === "function") {
			adapter = this.adapter.apply(data, this._arguments);
			// if (Array.isArray(data)) {
			// 	result = this._extract(adapter, data, this._arguments);
			// } else {
			// 	result = this._extract(adapter, [data], this._arguments)[0];
			// }
			// return result;
		} else {
			adapter = this.adapter;
		}
		if (Array.isArray(data)) {
			result = this._extract(adapter, data, this._arguments);
		} else {
			result = this._extract(adapter, [data], this._arguments)[0];
		}
		return result;
	}
}

/** @class {FaAdapter} */
module.exports = FaAdapter;
