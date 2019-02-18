"use strict";
const FaError = require("fa-nodejs/base/error");
/**
 *
 * @type {module.ModelClass}
 */
module.exports = class ModelClass {
	/**
	 * @constructor
	 */
	constructor() {
	};

	// _getValueByKeys(object, keys) {
	// 	let key = keys.shift();
	// 	if (object[key] && keys.length > 0) {
	// 		return this._getValueByKeys(object[key], keys);
	// 	} else {
	// 		return object[key];
	// 	}
	// };
	/**
	 *
	 * @return {{}}
	 */
	get attributes() {
		return {};
	};

	// _useScheme(scheme, data) {
	// 	// console.warn(scheme,JSON.stringify(data));
	// 	// console.info(this.attributes);
	// 	let context = this;
	// 	return data.map(function (map) {
	// 		// console.warn(map);
	// 		let result = Array.isArray(data) ? [] : {};
	// 		Object.entries(scheme).forEach(function ([key, value]) {
	// 			if (typeof value === "string") {
	// 				result[key] = map[value];
	// 			} else if (value && value.constructor === Object) {
	// 				// result[key] = "OBJ";
	// 				console.warn(key, value, map[value]);
	// 				result[key] = context._useScheme(value, [map])[0];
	// 			}
	// 			result[key] = result[key] === undefined ? null : result[key];
	// 		});
	// 		return result;
	// 	});
	// };
	//
	// useScheme(data) {
	// 	let result;
	// 	if (Array.isArray(data)) {
	// 		result = this._useScheme(this.scheme, data);
	// 	} else {
	// 		result = this._useScheme(this.scheme, [data])[0];
	// 	}
	// 	return result;
	// };
};

