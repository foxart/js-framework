"use strict";

class FaHttpHeaders {
	/**
	 *
	 * @param key {string}
	 * @param value {Array|string}
	 * @return {string}
	 * @private
	 */
	static _getValue(key, value) {
		let keyUpper = key;
		let keyLower = key.toLowerCase();
		if (value[keyUpper]) {
			return value[keyUpper];
		}
		if (value[keyLower]) {
			return value[keyLower];
		}
	}

	/**
	 *
	 * @param key {string}
	 * @param value {string|array}
	 * @return {string|null}
	 */
	static getValue(key, value) {
		let result;
		if (Array.isArray(value)) {
			result = value.map(function (item) {
				return FaHttpHeaders._getValue(key, item);
			}).filter(function (item) {
				return item;
			})[0];
		} else {
			result = FaHttpHeaders._getValue(key, value);
		}
		if (result) {
			return result.toString().toLowerCase().trim()
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param value {string}
	 * @return {string|null}
	 */
	static getCharset(value) {
		// value = "text/html  ,application/xhtml+xml,application/xml;  q=0.9;charset=windows-1251  ";
		// value = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
		// value = "text/html ";
		// value = "  text/plain,a-1; charset=utf-8";
		// value = "charset=utf-81";
		let result = value ? value.split(";").map(item => item.trim()).filter(item => item.includes("charset="))[0] : null;
		if (result) {
			return result.toString().toLowerCase().trim()
		} else {
			return null;
		}
	}
}

/**
 *
 * @type {FaHttpHeaders|Class}
 */
module.exports = FaHttpHeaders;

