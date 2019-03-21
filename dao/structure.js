"use strict";
/*variables*/
let TestPattern = "^(?:\\[\\\"([^\\[\\]\\\"]+)\\\"\\])+$";
let MatchPattern = "[^\\[\\]\\\"]+";

class FaDaoStructure {
	/**
	 * @constructor
	 * @param attribute {Object}
	 */
	constructor(attribute) {
		this._structure = attribute;
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
	_destructurizeObject(object, keys) {
		let key = keys.shift();
		if (object[key] && keys.length > 0) {
			return this._destructurizeObject(object[key], keys);
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
	_destructurize(attribute, data) {
		let context = this;
		return data.map(function (map) {
			let result = Array.isArray(attribute) ? [] : {};
			Object.entries(attribute).map(function ([key, value]) {
				if (typeof value === "string" && context._TestExpression.test(value)) {
					result[key] = context._destructurizeObject(map, value.match(context._MatchExpression));
				} else {
					result[key] = value;
				}
				result[key] = result[key] === undefined ? null : result[key];
			});
			return result;
		});
	};

	/**
	 * @param result {Object}
	 * @param keys
	 * @param value
	 * @return {Object}
	 * @private
	 */
	_structurizeObject(result, keys, value) {
		let key = keys.shift();
		if (!result[key]) {
			result[key] = {};
		}
		if (keys.length > 0) {
			result[key] = this._structurizeObject(result[key], keys, value);
		} else {
			result[key] = value;
		}
		return result;
	};

	/**
	 *
	 * @param attribute
	 * @param data
	 * @return {*}
	 * @private
	 */
	_structurize(attribute, data) {
		let context = this;
		return data.map(function (map) {
			let result = Array.isArray(attribute) ? [] : {};
			Object.entries(attribute).map(function ([key, value]) {
				if (typeof value === "string" && context._TestExpression.test(value)) {
					context._structurizeObject(result, value.match(context._MatchExpression), map[key]);
				} else {
					result[key] = value;
				}
			});
			return result;
		});
	}

	/**
	 *
	 * @param structure {Object}
	 */
	setStructure(structure) {
		this._structure = structure;
	}

	/**
	 *
	 * @param data {Object|Array<Object>}
	 * @return {Object|Array<Object>}
	 */
	destructurize(data) {
		let result;
		if (Array.isArray(data)) {
			result = this._destructurize(this._structure, data);
		} else {
			result = this._destructurize(this._structure, [data])[0];
		}
		return result;
	};
	/**
	 *
	 * @param data
	 * @return {*}
	 */
	structurize(data) {
		let result;
		if (Array.isArray(data)) {
			result = this._structurize(this._structure, data);
		} else {
			result = this._structurize(this._structure, [data])[0];
		}
		return result;
	};

}

/**
 *
 * @type {FaDaoStructure}
 */
module.exports = FaDaoStructure;
