"use strict";
/*variables*/
let TestPattern = "^(?:\\[\\\"([^\\[\\]\\\"]+)\\\"\\])+$";
let MatchPattern = "[^\\[\\]\\\"]+";

class FaDaoAttribute {
	/**
	 * @constructor
	 * @param attributes
	 */
	constructor(attributes) {
		this._attributes = attributes;
		this._TestExpression = new RegExp(TestPattern);
		this._MatchExpression = new RegExp(MatchPattern, "g");
	};

	/**
	 *
	 * @param object {Object}
	 * @param keys {Array}
	 * @return {*}
	 * @private
	 */
	_fillObject(object, keys) {
		let key = keys.shift();
		if (object[key] && keys.length > 0) {
			return this._fillObject(object[key], keys);
		} else {
			return object[key];
		}
	};

	/**
	 *
	 * @param attribute {Object}
	 * @param data {Array}
	 * @return {Array|Object}
	 * @private
	 */
	_fill(attribute, data) {
		let context = this;
		console.log([attribute]);
		return data.map(function (map) {
			let result = Array.isArray(attribute) ? [] : {};
			Object.entries(attribute).map(function ([key, value]) {
				if (typeof value === "string" && context._TestExpression.test(value)) {
					result[key] = context._fillObject(map, value.match(context._MatchExpression));
				} else {
					result[key] = value;
				}
				result[key] = result[key] === undefined ? null : result[key];
			});
			return result;
		});
	};

	/**
	 *
	 * @param attributes {Object}
	 */
	set set(attributes) {
		this._attributes = attributes;
	}

	get get() {
		return this._attributes;
	}

	/**
	 *
	 * @param data {Object|Array<Object>}
	 * @return {Object|Array<Object>}
	 */
	fill(data) {
		let result;
		if (Array.isArray(data)) {
			result = this._fill(this._attributes, data);
		} else {
			result = this._fill(this._attributes, [data])[0];
		}

		return result;
	};
}

/**
 *
 * @class {FaDaoAttribute}
 */
module.exports = FaDaoAttribute;
